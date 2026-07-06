/**
 * extract-and-seed.js
 * Comprehensive question bank extractor:
 *  - Parses JSX text file (structured JSON with 40 DILR questions)
 *  - Parses DILR markdown sets (Set 1-5 patterns)
 *  - Parses Arithmetic markdown (100 questions with solutions)
 *  - Extracts text from all PDFs using pdf-parse, then structures questions
 *  - Upserts all questions to the Prisma SQLite DB
 *
 * Run: node prisma/extract-and-seed.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const BASE = 'C:\\Users\\yash mohan\\Downloads\\cat_questions_extracted\\cat questions';

// ─── Option letter → index mapping ──────────────────────────────────────────
function optionLetterToIndex(letter) {
  const map = { A: '0', B: '1', C: '2', D: '3' };
  return map[letter.toUpperCase()] ?? '0';
}

// ─── Sanitize text ────────────────────────────────────────────────────────────
function clean(str) {
  return (str || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--')
    .replace(/\u00A0/g, ' ')
    .trim();
}

// ─── PARSER 1: JSX text file (structured JS object, 10 sets × 4 questions) ──
function parseJsxTextFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const questions = [];

  // Extract the dilrData array literal as text
  const arrMatch = raw.match(/const dilrData\s*=\s*(\[[\s\S]*?\]);\s*\n\s*const/);
  if (!arrMatch) {
    console.warn('Could not find dilrData array in JSX file');
    return questions;
  }

  // Use a regex-based parser to find each set block
  const setRegex = /\{\s*id:\s*(\d+),\s*title:\s*"([^"]+)",\s*difficulty:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*questions:\s*\d+,\s*passage:\s*`([\s\S]*?)`,\s*questions_list:\s*\[([\s\S]*?)\]\s*\}/g;
  const questionRegex = /\{\s*qno:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*text:\s*"([\s\S]*?)",\s*options:\s*\[([\s\S]*?)\],\s*answer:\s*"([A-D])",\s*explanation:\s*"([\s\S]*?)"\s*\}/g;

  let setMatch;
  while ((setMatch = setRegex.exec(raw)) !== null) {
    const setId    = setMatch[1];
    const title    = setMatch[2];
    const diff     = setMatch[3]; // 'Hard'
    const type     = setMatch[4]; // 'Logical Reasoning' | 'Data Interpretation'
    const passage  = clean(setMatch[5]);
    const qBlock   = setMatch[6];

    const section = type === 'Data Interpretation' ? 'DILR' : 'DILR';
    const topic   = type === 'Data Interpretation' ? 'Data Interpretation' : 'Logical Reasoning';

    let qMatch;
    while ((qMatch = questionRegex.exec(qBlock)) !== null) {
      const qno  = qMatch[1]; // 'Q1'
      const qtype = 'MCQ';
      const text  = clean(qMatch[3]);
      const opts  = qMatch[4]
        .match(/"([^"]+)"/g)
        .map(o => o.replace(/"/g, '').replace(/^[A-D]\)\s*/, ''));
      const ansLetter = qMatch[5];
      const explanation = clean(qMatch[6]);

      questions.push({
        id: `dilr-jsx-set${setId}-${qno.toLowerCase()}`,
        section,
        topic,
        subtopic: title,
        passage,
        type: qtype,
        questionText: text,
        optionsJson: JSON.stringify(opts),
        correctAnswer: optionLetterToIndex(ansLetter),
        explanation,
        shortcut: null,
        trap: null,
        difficulty: diff === 'Hard' ? 'Hard' : 'Medium',
        idealTime: 150,
      });
    }
    questionRegex.lastIndex = 0;
  }

  console.log(`  JSX file: parsed ${questions.length} questions from 10 DILR sets`);
  return questions;
}

// ─── PARSER 2: Arithmetic markdown file ─────────────────────────────────────
function parseArithmeticMd(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const questions = [];

  // Split on "### Q<n>:" headings
  const blocks = raw.split(/(?=### Q\d+:)/);

  for (const block of blocks) {
    const headerMatch = block.match(/^### Q(\d+):\s*(.+)/);
    if (!headerMatch) continue;
    const qNum = headerMatch[1];
    const topicHint = clean(headerMatch[2]); // e.g. "Number System"

    // Question text: everything between header and **Solution:**
    const qtextMatch = block.match(/###[^\n]+\n([\s\S]*?)\*\*Solution:\*\*/);
    if (!qtextMatch) continue;
    const questionText = clean(qtextMatch[1]);

    // Solution text: everything after **Solution:** until next --- or end
    const solMatch = block.match(/\*\*Solution:\*\*\n([\s\S]*?)(?:---|\Z)/);
    if (!solMatch) continue;
    const solutionText = clean(solMatch[1]);

    // Extract bold answer: **n** or **word** (last bold in solution)
    const answerMatches = solutionText.match(/\*\*([^*]+)\*\*/g) || [];
    let correctAnswer = '';
    if (answerMatches.length) {
      correctAnswer = answerMatches[answerMatches.length - 1].replace(/\*\*/g, '').trim();
    }

    // Determine section/topic from section header context
    let section = 'QA';
    let topic = 'Arithmetic';
    let subtopic = topicHint;
    if (/number system|divisib|prime|gcd|lcm|remainder|factorial|digit|base|coprime|digital root/i.test(topicHint + questionText)) {
      topic = 'Number System'; subtopic = topicHint;
    } else if (/percentage|ratio|profit|loss|discount|markup|mixture|alligation/i.test(topicHint + questionText)) {
      topic = 'Arithmetic'; subtopic = topicHint;
    } else if (/time|work|speed|distance|train/i.test(topicHint + questionText)) {
      topic = 'Arithmetic'; subtopic = 'Time Speed Distance / Work';
    } else if (/interest|CI|SI/i.test(topicHint + questionText)) {
      topic = 'Arithmetic'; subtopic = 'Simple & Compound Interest';
    }

    questions.push({
      id: `qa-arith-md-q${qNum}`,
      section,
      topic,
      subtopic,
      passage: null,
      type: 'TITA',
      questionText,
      optionsJson: null,
      correctAnswer,
      explanation: solutionText.substring(0, 800),
      shortcut: null,
      trap: null,
      difficulty: parseInt(qNum) <= 30 ? 'Easy' : parseInt(qNum) <= 70 ? 'Medium' : 'Hard',
      idealTime: 90,
    });
  }

  console.log(`  Arithmetic MD: parsed ${questions.length} questions`);
  return questions;
}

// ─── PARSER 3: DILR Practice Sets markdown ───────────────────────────────────
function parseDilrMd(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const questions = [];

  // Each set: "## Set N:"
  const sets = raw.split(/(?=^## Set \d+)/m);

  for (const setBlock of sets) {
    const setMatch = setBlock.match(/^## Set (\d+):\s*(.+)/m);
    if (!setMatch) continue;
    const setNum  = setMatch[1];
    const setTitle = setMatch[2].trim();

    // Each topic within a set: "### N. Topic Name"
    const topicBlocks = setBlock.split(/(?=^### \d+\.)/m);

    for (const topicBlock of topicBlocks) {
      const topicMatch = topicBlock.match(/^### \d+\.\s*(.+)/m);
      if (!topicMatch) continue;
      const topicName = clean(topicMatch[1]);

      // passage: everything between topic header and **Questions:**
      const passageMatch = topicBlock.match(/^###[^\n]+\n([\s\S]*?)\*\*Questions:\*\*/m);
      const passage = passageMatch ? clean(passageMatch[1]) : null;

      // Questions: numbered list after **Questions:**
      const qSection = topicBlock.match(/\*\*Questions:\*\*\n([\s\S]+)/m);
      if (!qSection) continue;

      const qLines = qSection[1].match(/^\d+\..+/gm) || [];

      for (let i = 0; i < qLines.length; i++) {
        const qtextRaw = clean(qLines[i].replace(/^\d+\.\s*/, ''));
        const qIdx = i + 1;

        questions.push({
          id: `dilr-md-set${setNum}-${topicName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-q${qIdx}`,
          section: 'DILR',
          topic: 'Logical Reasoning',
          subtopic: topicName,
          passage: passage?.substring(0, 1000) || null,
          type: 'TITA',
          questionText: qtextRaw,
          optionsJson: null,
          correctAnswer: '',  // no explicit answers in this file
          explanation: `This is a ${topicName} problem. Work through the given constraints systematically to arrive at the answer.`,
          shortcut: null,
          trap: null,
          difficulty: setNum >= '3' ? 'Hard' : setNum === '2' ? 'Medium' : 'Easy',
          idealTime: 120,
        });
      }
    }
  }

  console.log(`  DILR MD: parsed ${questions.length} questions`);
  return questions;
}

// ─── PARSER 4: PDF files using pdf-parse ─────────────────────────────────────
async function extractPdfQuestions(pdfPath) {
  let pdfParse;
  try {
    const mod = require('pdf-parse');
    pdfParse = typeof mod === 'function' ? mod : (mod.default || mod);
  } catch (e) {
    console.warn('pdf-parse not available, skipping PDFs');
    return [];
  }

  const questions = [];
  const fileName  = path.basename(pdfPath, '.pdf');
  const dataBuffer = fs.readFileSync(pdfPath);

  let text = '';
  try {
    const data = await pdfParse(dataBuffer);
    text = data.text;
  } catch (e) {
    console.warn(`  Skipped ${fileName}: ${e.message}`);
    return [];
  }

  // Determine metadata from filename
  const meta = inferMetaFromFilename(fileName);

  // Strategy: split on common question patterns
  // Pattern A: "Q1." or "1." or "Question 1" at start of line
  const qBlocks = splitIntoQuestionBlocks(text);

  for (let i = 0; i < qBlocks.length; i++) {
    const block = qBlocks[i];
    const parsed = parseQuestionBlock(block, meta);
    if (!parsed) continue;

    questions.push({
      id: `${meta.prefix}-q${String(i + 1).padStart(3, '0')}`,
      section: meta.section,
      topic: meta.topic,
      subtopic: meta.subtopic,
      passage: null,
      type: parsed.type,
      questionText: parsed.questionText,
      optionsJson: parsed.optionsJson,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation || `Refer to solution in ${fileName}.`,
      shortcut: null,
      trap: null,
      difficulty: meta.difficulty,
      idealTime: meta.idealTime,
    });
  }

  console.log(`  PDF ${fileName}: extracted ${questions.length} questions`);
  return questions;
}

function inferMetaFromFilename(name) {
  const n = name.toLowerCase();
  let section = 'QA', topic = 'Arithmetic', subtopic = 'General', difficulty = 'Medium', idealTime = 90;
  let prefix = 'qa';

  if (n.includes('dilr') || n.includes('logical')) {
    section = 'DILR'; topic = 'Data Interpretation'; subtopic = 'Mixed'; prefix = 'dilr';
  } else if (n.includes('rc') || n.includes('reading')) {
    section = 'VARC'; topic = 'Reading Comprehension'; subtopic = 'Passage'; prefix = 'varc';
  }

  if (n.includes('number') || n.includes('ns_'))     { topic = 'Number System'; subtopic = 'Number System'; }
  else if (n.includes('algebra') || n.includes('function'))  { topic = 'Algebra'; subtopic = 'Algebra & Functions'; }
  else if (n.includes('arithmetic'))                  { topic = 'Arithmetic'; subtopic = 'Arithmetic'; }
  else if (n.includes('geometry'))                    { topic = 'Geometry'; subtopic = 'Geometry'; idealTime = 150; }
  else if (n.includes('logarithm'))                   { topic = 'Algebra'; subtopic = 'Logarithms'; }
  else if (n.includes('polynomial'))                  { topic = 'Algebra'; subtopic = 'Polynomials'; }
  else if (n.includes('inequalit') || n.includes('modulus')) { topic = 'Algebra'; subtopic = 'Inequalities & Modulus'; }
  else if (n.includes('maxima') || n.includes('minima'))     { topic = 'Algebra'; subtopic = 'Maxima & Minima'; }
  else if (n.includes('modern'))                      { topic = 'Modern Math'; subtopic = 'PnC & Probability'; }
  else if (n.includes('percentage'))                  { topic = 'Arithmetic'; subtopic = 'Percentages'; }
  else if (n.includes('profit') || n.includes('loss')){ topic = 'Arithmetic'; subtopic = 'Profit & Loss'; }
  else if (n.includes('ratio'))                       { topic = 'Arithmetic'; subtopic = 'Ratio & Proportion'; }
  else if (n.includes('time_speed') || n.includes('speed')) { topic = 'Arithmetic'; subtopic = 'Time Speed Distance'; }
  else if (n.includes('time_work') || n.includes('work'))   { topic = 'Arithmetic'; subtopic = 'Time & Work'; }
  else if (n.includes('average'))                     { topic = 'Arithmetic'; subtopic = 'Averages'; }
  else if (n.includes('mixture') || n.includes('alligation')) { topic = 'Arithmetic'; subtopic = 'Mixture & Alligation'; }
  else if (n.includes('si_ci') || n.includes('interest')) { topic = 'Arithmetic'; subtopic = 'Simple & Compound Interest'; }
  else if (n.includes('algebraic_identit'))           { topic = 'Algebra'; subtopic = 'Algebraic Identities'; }

  if (n.includes('hard') || n.includes('200q') || n.includes('150q')) difficulty = 'Hard';
  else if (n.includes('100q') || n.includes('100_q') || n.includes('100 q')) difficulty = 'Medium';

  prefix = `${prefix}-${subtopic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`;
  return { section, topic, subtopic, difficulty, idealTime, prefix };
}

function splitIntoQuestionBlocks(text) {
  // Try pattern: line starting with number followed by . or )
  const lines = text.split('\n');
  const blocks = [];
  let current = [];
  let inBlock = false;

  for (const line of lines) {
    const isNewQ = /^(Q\.?\s*)?(\d{1,3})[.)]\s+\S/.test(line.trim());
    if (isNewQ) {
      if (inBlock && current.length > 0) {
        blocks.push(current.join('\n').trim());
      }
      current = [line];
      inBlock = true;
    } else if (inBlock) {
      current.push(line);
    }
  }
  if (current.length > 0 && inBlock) {
    blocks.push(current.join('\n').trim());
  }

  // If that didn't find much, try splitting on double newlines for RC-style
  if (blocks.length < 3) {
    return text
      .split(/\n{2,}/)
      .map(b => b.trim())
      .filter(b => b.length > 30);
  }

  return blocks;
}

function parseQuestionBlock(block, meta) {
  if (!block || block.length < 20) return null;

  // Clean up the question number prefix
  const questionText = block
    .replace(/^(Q\.?\s*)?(\d{1,3})[.)]\s+/, '')
    .replace(/\n/g, ' ')
    .trim();

  if (questionText.length < 15) return null;

  // Look for options lines: (A) / a) / A. / (a) patterns
  const optionPattern = /\(?[A-D]\)?[.)]\s+([^\n(A-D)]+)/gi;
  const optionMatches = [...block.matchAll(optionPattern)];

  let type = 'TITA';
  let optionsJson = null;
  let correctAnswer = '';

  if (optionMatches.length >= 2) {
    type = 'MCQ';
    const opts = optionMatches.slice(0, 4).map(m => m[1].trim());
    optionsJson = JSON.stringify(opts);

    // Look for answer line: "Answer: A" or "Ans: B" or "Sol: C"
    const ansMatch = block.match(/(?:Answer|Ans|Sol|Answer key)[:\s.]+([A-D])/i);
    correctAnswer = ansMatch ? optionLetterToIndex(ansMatch[1]) : '0';
  } else {
    // TITA - look for numerical answer after "Answer:" or bold
    const ansMatch = block.match(/(?:Answer|Ans|Sol)[:\s.]+\*?\*?([0-9.,/]+)\*?\*?/i)
      || block.match(/\*\*([0-9.,/]+)\*\*/);
    correctAnswer = ansMatch ? ansMatch[1].trim() : '';
  }

  // Extract explanation
  const expMatch = block.match(/(?:Solution|Explanation|Sol)[:\s]+([\s\S]+)/i);
  const explanation = expMatch
    ? expMatch[1].replace(/\n/g, ' ').trim().substring(0, 600)
    : '';

  // Cap question text to just the question part (before options)
  const qtextClean = questionText.split(/\(?[A-D]\)?[.)]\s+/)[0].trim().substring(0, 500);

  return { type, questionText: qtextClean, optionsJson, correctAnswer, explanation };
}

// ─── PARSER 5: DOCX files using mammoth ──────────────────────────────────────
async function extractDocxQuestions(docxPath) {
  let mammoth;
  try { mammoth = require('mammoth'); } catch (e) {
    console.warn('mammoth not available'); return [];
  }

  const questions = [];
  const fileName = path.basename(docxPath, '.docx');
  const meta = inferMetaFromFilename(fileName);

  let text = '';
  try {
    const result = await mammoth.extractRawText({ path: docxPath });
    text = result.value;
  } catch (e) {
    console.warn(`  Skipped DOCX ${fileName}: ${e.message}`);
    return [];
  }

  const qBlocks = splitIntoQuestionBlocks(text);
  for (let i = 0; i < qBlocks.length; i++) {
    const parsed = parseQuestionBlock(qBlocks[i], meta);
    if (!parsed) continue;
    questions.push({
      id: `${meta.prefix}-docx-q${String(i + 1).padStart(3, '0')}`,
      section: meta.section,
      topic: meta.topic,
      subtopic: meta.subtopic,
      passage: null,
      type: parsed.type,
      questionText: parsed.questionText,
      optionsJson: parsed.optionsJson,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation || `Refer to solution in ${fileName}.`,
      shortcut: null,
      trap: null,
      difficulty: meta.difficulty,
      idealTime: meta.idealTime,
    });
  }
  console.log(`  DOCX ${fileName}: extracted ${questions.length} questions`);
  return questions;
}

// ─── Gather all files ─────────────────────────────────────────────────────────
function getAllFiles() {
  const result = { pdfs: [], docxs: [], texts: [], mds: [] };
  const dirs = ['Dilr', 'Quants', 'Rcs'];

  for (const dir of dirs) {
    const dirPath = path.join(BASE, dir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath);
    for (const f of files) {
      const full = path.join(dirPath, f);
      const ext = path.extname(f).toLowerCase();
      if (ext === '.pdf') result.pdfs.push(full);
      else if (ext === '.docx') result.docxs.push(full);
      else if (ext === '.txt' || ext === '.jsx.txt' || f.endsWith('.jsx.txt')) result.texts.push(full);
      else if (ext === '.md') result.mds.push(full);
    }
  }
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍 Scanning question bank files...\n');
  const files = getAllFiles();
  console.log(`Found: ${files.pdfs.length} PDFs, ${files.docxs.length} DOCXs, ${files.texts.length} TXT/JSX, ${files.mds.length} MDs\n`);

  let allQuestions = [];

  // 1. Structured JSX text file
  console.log('📄 Parsing JSX structured data file...');
  for (const f of files.texts) {
    if (f.includes('MegaSet')) {
      const qs = parseJsxTextFile(f);
      allQuestions.push(...qs);
    }
  }

  // 2. Arithmetic MD
  console.log('\n📄 Parsing Arithmetic markdown...');
  for (const f of files.mds) {
    if (f.includes('Arithmetic')) {
      const qs = parseArithmeticMd(f);
      allQuestions.push(...qs);
    }
  }

  // 3. DILR Practice Sets MD
  console.log('\n📄 Parsing DILR Practice Sets markdown...');
  for (const f of files.mds) {
    if (f.includes('DILR_Practice')) {
      const qs = parseDilrMd(f);
      allQuestions.push(...qs);
    }
  }

  // 4. PDFs
  console.log('\n📑 Extracting text from PDFs...');
  for (const f of files.pdfs) {
    const qs = await extractPdfQuestions(f);
    allQuestions.push(...qs);
  }

  // 5. DOCXs
  console.log('\n📝 Extracting text from DOCX files...');
  for (const f of files.docxs) {
    const qs = await extractDocxQuestions(f);
    allQuestions.push(...qs);
  }

  // ─── Deduplicate by ID ────────────────────────────────────────────────────
  const seen = new Set();
  const unique = [];
  for (const q of allQuestions) {
    // Skip if question text is too short or empty
    if (!q.questionText || q.questionText.length < 15) continue;
    // Skip RC/passage questions without question text (just paragraph dumps)
    if (!q.id) continue;
    const key = q.id;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }

  console.log(`\n✅ Total unique questions to insert: ${unique.length}`);
  console.log('   Breakdown:');
  const bySection = {};
  for (const q of unique) {
    bySection[q.section] = (bySection[q.section] || 0) + 1;
  }
  for (const [s, c] of Object.entries(bySection)) {
    console.log(`     ${s}: ${c} questions`);
  }

  // ─── Upsert to DB ─────────────────────────────────────────────────────────
  console.log('\n💾 Upserting to database...');
  let inserted = 0, skipped = 0;

  // Process in batches of 50
  const BATCH = 50;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    for (const q of batch) {
      try {
        await prisma.question.upsert({
          where: { id: q.id },
          update: q,
          create: q,
        });
        inserted++;
      } catch (e) {
        console.warn(`  ⚠ Skipped ${q.id}: ${e.message.substring(0, 80)}`);
        skipped++;
      }
    }
    process.stdout.write(`\r  Progress: ${Math.min(i + BATCH, unique.length)}/${unique.length} (${skipped} skipped)`);
  }

  console.log(`\n\n🎉 Done!`);
  console.log(`   Inserted/Updated: ${inserted}`);
  console.log(`   Skipped:          ${skipped}`);

  const total = await prisma.question.count();
  console.log(`   Total in DB now:  ${total}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
