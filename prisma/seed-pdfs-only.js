/**
 * seed-pdfs-only.js
 * Runs ONLY the PDF extraction step from extract-and-seed.js.
 * Already-seeded questions (DILR/Arithmetic/DILR-MD) are skipped
 * because upsert is idempotent, but this avoids re-parsing text files.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const BASE = 'C:\\Users\\yash mohan\\Downloads\\cat_questions_extracted\\cat questions';

function clean(str) {
  return (str || '')
    .replace(/\r\n/g, '\n').replace(/\u00A0/g, ' ')
    .replace(/\u2019/g, "'").replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"').replace(/\u201D/g, '"')
    .replace(/\u2013/g, '-').replace(/\u2014/g, '--').trim();
}

function optionLetterToIndex(letter) {
  return { A: '0', B: '1', C: '2', D: '3' }[letter.toUpperCase()] ?? '0';
}

function inferMetaFromFilename(name) {
  const n = name.toLowerCase();
  let section = 'QA', topic = 'Arithmetic', subtopic = 'General', difficulty = 'Medium', idealTime = 90;
  let prefix = 'qa';

  if (n.includes('dilr') || n.includes('logical')) {
    section = 'DILR'; topic = 'Data Interpretation'; subtopic = 'Mixed'; prefix = 'dilr';
  } else if (n.includes('_rc_') || n.includes('rc_') || n.includes('reading')) {
    section = 'VARC'; topic = 'Reading Comprehension'; subtopic = 'Passage'; prefix = 'varc';
  }

  if      (n.includes('number') || n.includes('ns_'))                   { topic = 'Number System'; subtopic = 'Number System'; }
  else if (n.includes('algebraic_identit'))                              { topic = 'Algebra'; subtopic = 'Algebraic Identities'; }
  else if (n.includes('algebra') || n.includes('function'))             { topic = 'Algebra'; subtopic = 'Algebra & Functions'; }
  else if (n.includes('polynomial'))                                     { topic = 'Algebra'; subtopic = 'Polynomials'; }
  else if (n.includes('logarithm'))                                      { topic = 'Algebra'; subtopic = 'Logarithms'; }
  else if (n.includes('inequalit') || n.includes('modulus'))            { topic = 'Algebra'; subtopic = 'Inequalities & Modulus'; }
  else if (n.includes('maxima') || n.includes('minima'))                { topic = 'Algebra'; subtopic = 'Maxima & Minima'; }
  else if (n.includes('geometry'))                                       { topic = 'Geometry'; subtopic = 'Geometry'; idealTime = 150; }
  else if (n.includes('modern'))                                         { topic = 'Modern Math'; subtopic = 'PnC & Probability'; }
  else if (n.includes('percentage'))                                     { topic = 'Arithmetic'; subtopic = 'Percentages'; }
  else if (n.includes('profit') || n.includes('loss'))                  { topic = 'Arithmetic'; subtopic = 'Profit & Loss'; }
  else if (n.includes('ratio'))                                          { topic = 'Arithmetic'; subtopic = 'Ratio & Proportion'; }
  else if (n.includes('time_speed') || n.includes('speed'))             { topic = 'Arithmetic'; subtopic = 'Time Speed Distance'; }
  else if (n.includes('time_work') || n.includes('work'))               { topic = 'Arithmetic'; subtopic = 'Time & Work'; }
  else if (n.includes('average'))                                        { topic = 'Arithmetic'; subtopic = 'Averages'; }
  else if (n.includes('mixture') || n.includes('alligation'))           { topic = 'Arithmetic'; subtopic = 'Mixture & Alligation'; }
  else if (n.includes('si_ci') || n.includes('interest'))               { topic = 'Arithmetic'; subtopic = 'Simple & Compound Interest'; }
  else if (n.includes('arithmetic'))                                     { topic = 'Arithmetic'; subtopic = 'Arithmetic'; }

  if (n.includes('hard') || n.includes('200q') || n.includes('150q'))  difficulty = 'Hard';
  else if (n.includes('100q') || n.includes('100_q'))                   difficulty = 'Medium';

  prefix = `${prefix}-${subtopic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/-$/, '')}`;
  return { section, topic, subtopic, difficulty, idealTime, prefix };
}

function splitIntoQuestionBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let current = [];
  let inBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isNewQ = /^(Q\.?\s*)?(\d{1,3})[.)]\s+\S/.test(trimmed);
    if (isNewQ) {
      if (inBlock && current.length > 0) blocks.push(current.join('\n').trim());
      current = [line];
      inBlock = true;
    } else if (inBlock) {
      current.push(line);
    }
  }
  if (current.length > 0 && inBlock) blocks.push(current.join('\n').trim());

  // fallback: paragraph split
  if (blocks.length < 3) {
    return text.split(/\n{2,}/).map(b => b.trim()).filter(b => b.length > 30);
  }
  return blocks;
}

function parseQuestionBlock(block) {
  if (!block || block.length < 20) return null;

  const questionText = block
    .replace(/^(Q\.?\s*)?(\d{1,3})[.)]\s+/, '')
    .replace(/\n/g, ' ')
    .trim();

  if (questionText.length < 15) return null;

  // Detect options
  const optionPattern = /\(?([A-D])\)?[.)]\s+([^\n\(A-D)]{2,})/gi;
  const optionMatches = [...block.matchAll(optionPattern)];

  let type = 'TITA', optionsJson = null, correctAnswer = '';

  if (optionMatches.length >= 2) {
    type = 'MCQ';
    const opts = optionMatches.slice(0, 4).map(m => m[2].trim().substring(0, 200));
    optionsJson = JSON.stringify(opts);
    const ansMatch = block.match(/(?:Answer|Ans(?:wer)?|Sol(?:ution)?)[:\s.]+([A-D])/i)
      || block.match(/\*\*([A-D])\*\*/);
    correctAnswer = ansMatch ? optionLetterToIndex(ansMatch[1]) : '0';
  } else {
    const ansMatch = block.match(/(?:Answer|Ans(?:wer)?|Sol(?:ution)?)[:\s]+\*?\*?([0-9.,/\-]+)\*?\*?/i)
      || block.match(/\*\*([0-9.,/]+)\*\*/);
    correctAnswer = ansMatch ? ansMatch[1].trim() : '';
  }

  const expMatch = block.match(/(?:Solution|Explanation|Sol)[:\s]+([\s\S]+)/i);
  const explanation = expMatch
    ? expMatch[1].replace(/\n/g, ' ').trim().substring(0, 600)
    : '';

  const qtextClean = clean(questionText.split(/\(?[A-D]\)?[.)]\s+/)[0]).substring(0, 500);

  return { type, questionText: qtextClean, optionsJson, correctAnswer, explanation };
}

async function extractPdfQuestions(pdfPath) {
  const pdfParse = require('pdf-parse');

  const questions = [];
  const fileName = path.basename(pdfPath, '.pdf');
  const meta = inferMetaFromFilename(fileName);
  const dataBuffer = fs.readFileSync(pdfPath);

  let text = '';
  try {
    const data = await pdfParse(dataBuffer);
    text = data.text;
  } catch (e) {
    console.warn(`  ✗ ${fileName}: ${e.message.substring(0, 60)}`);
    return [];
  }

  const qBlocks = splitIntoQuestionBlocks(text);
  for (let i = 0; i < qBlocks.length; i++) {
    const parsed = parseQuestionBlock(qBlocks[i]);
    if (!parsed || parsed.questionText.length < 15) continue;

    questions.push({
      id: `${meta.prefix}-pdf-q${String(i + 1).padStart(3, '0')}`,
      section: meta.section,
      topic: meta.topic,
      subtopic: meta.subtopic,
      passage: null,
      type: parsed.type,
      questionText: parsed.questionText,
      optionsJson: parsed.optionsJson,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation || `From ${fileName}.`,
      shortcut: null,
      trap: null,
      difficulty: meta.difficulty,
      idealTime: meta.idealTime,
    });
  }

  console.log(`  ✓ ${fileName}: ${questions.length} questions`);
  return questions;
}

async function main() {
  console.log('\n📑 Extracting questions from all PDFs...\n');

  const allPdfs = [];
  for (const dir of ['Dilr', 'Quants', 'Rcs']) {
    const dirPath = path.join(BASE, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const f of fs.readdirSync(dirPath)) {
      if (f.toLowerCase().endsWith('.pdf')) {
        allPdfs.push(path.join(dirPath, f));
      }
    }
  }

  console.log(`Found ${allPdfs.length} PDF files\n`);

  let allQuestions = [];
  for (const pdf of allPdfs) {
    const qs = await extractPdfQuestions(pdf);
    allQuestions.push(...qs);
  }

  // Deduplicate
  const seen = new Set();
  const unique = allQuestions.filter(q => {
    if (!q.questionText || q.questionText.length < 15) return false;
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });

  console.log(`\n✅ Total unique PDF questions: ${unique.length}`);
  const bySection = {};
  for (const q of unique) bySection[q.section] = (bySection[q.section] || 0) + 1;
  for (const [s, c] of Object.entries(bySection)) console.log(`   ${s}: ${c}`);

  // Upsert
  console.log('\n💾 Inserting into database...');
  let inserted = 0, skipped = 0;
  const BATCH = 50;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    for (const q of batch) {
      try {
        await prisma.question.upsert({ where: { id: q.id }, update: q, create: q });
        inserted++;
      } catch (e) {
        skipped++;
      }
    }
    process.stdout.write(`\r  Progress: ${Math.min(i + BATCH, unique.length)}/${unique.length} (${skipped} skipped)`);
  }

  console.log(`\n\n🎉 Done!`);
  console.log(`   Inserted/Updated: ${inserted}`);
  console.log(`   Skipped:          ${skipped}`);
  const total = await prisma.question.count();
  console.log(`   Total in DB:      ${total}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
