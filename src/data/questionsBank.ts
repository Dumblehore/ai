export interface Question {
  id: string;
  section: 'VARC' | 'DILR' | 'QA';
  topic: string;
  subtopic: string;
  passage?: string; // For RC or LRDI Caselets
  type: 'MCQ' | 'TITA'; // TITA = Type In The Answer (numeric/text input)
  questionText: string;
  options?: string[]; // MCQs only
  correctAnswer: string; // Option index (0-3) or numeric value for TITA
  explanation: string;
  shortcut: string;
  trap: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  idealTime: number; // in seconds
  avgAccuracy: number; // percentage (e.g. 65)
  videoUrl?: string;
}

export const initialQuestions: Question[] = [
  // ================= VARC =================
  {
    id: 'varc-rc-1-q1',
    section: 'VARC',
    topic: 'Reading Comprehension',
    subtopic: 'Philosophy & Science',
    passage: `The debate between determinism and free will has shifted from philosophy libraries to neurobiology laboratories. Experimenting in the 1980s, Benjamin Libet used EEG to monitor brain waves and discovered that a brain signal called the "readiness potential" occurred approximately 350 milliseconds before subjects reported a conscious decision to move their finger. This suggested that the motor cortex had already initiated the action before the subject became consciously aware of their intention to move, implying that consciousness might be an epiphenomenon—a decorative afterthought of neural processing rather than the author of action.\n\nHowever, this conclusion has been widely contested. Skeptics point out that Libet's experiments involved arbitrary, simple muscle movements (flexing a wrist) rather than deliberate, value-laden choices. Deciding to push a button when a dot reaches a certain point on a screen lacks the complexity, moral weight, and cognitive planning of choosing a career, signing a contract, or deciding to tell a lie. Furthermore, subsequent fMRI research by Haynes and others showed that while brain activity could predict choices up to several seconds in advance, the prediction accuracy was far from absolute, hovering around 60%—hardly a death knell for agency. Conscious deliberation might act as a filter, vetoing unconscious urges (what Libet himself called "free won't") or shaping long-term dispositions that eventually manifest in automatic actions.`,
    type: 'MCQ',
    questionText: 'Which of the following, if true, would most weaken the deterministic interpretation of Libet\'s readiness potential experiment?',
    options: [
      'Subjects are able to consciously abort a pre-planned finger movement even after the readiness potential has been initiated.',
      'The readiness potential is detected in subjects who are asked to perform complex mental arithmetic instead of finger flexing.',
      'Brain activity prediction rates in Haynes\' research rose to 98% when using advanced neural networks and deep learning models.',
      'The time gap between the readiness potential and the conscious decision remains constant across different age groups.'
    ],
    correctAnswer: '0',
    explanation: 'If subjects can consciously abort a movement after the readiness potential has started, it confirms the existence of Libet\'s "free won\'t"—the conscious veto power that overrides neural pre-programming. This directly weakens the hard deterministic claim that conscious awareness plays no causal role in actions.',
    shortcut: 'Look for the option that demonstrates conscious intervention AFTER the unconscious brain signal occurs, showing that neural initiation is not a sufficient condition for final action.',
    trap: 'Option 2 is a trap. Demonstrating readiness potential in other contexts does not weaken the deterministic argument; it might strengthen it by showing it is universal.',
    difficulty: 'Hard',
    idealTime: 120,
    avgAccuracy: 48,
    videoUrl: 'https://youtube.com/watch?v=mock-rc1'
  },
  {
    id: 'varc-rc-1-q2',
    section: 'VARC',
    topic: 'Reading Comprehension',
    subtopic: 'Philosophy & Science',
    passage: `The debate between determinism and free will has shifted from philosophy libraries to neurobiology laboratories. Experimenting in the 1980s, Benjamin Libet used EEG to monitor brain waves and discovered that a brain signal called the "readiness potential" occurred approximately 350 milliseconds before subjects reported a conscious decision to move their finger. This suggested that the motor cortex had already initiated the action before the subject became consciously aware of their intention to move, implying that consciousness might be an epiphenomenon—a decorative afterthought of neural processing rather than the author of action.\n\nHowever, this conclusion has been widely contested. Skeptics point out that Libet's experiments involved arbitrary, simple muscle movements (flexing a wrist) rather than deliberate, value-laden choices. Deciding to push a button when a dot reaches a certain point on a screen lacks the complexity, moral weight, and cognitive planning of choosing a career, signing a contract, or deciding to tell a lie. Furthermore, subsequent fMRI research by Haynes and others showed that while brain activity could predict choices up to several seconds in advance, the prediction accuracy was far from absolute, hovering around 60%—hardly a death knell for agency. Conscious deliberation might act as a filter, vetoing unconscious urges (what Libet himself called "free won't") or shaping long-term dispositions that eventually manifest in automatic actions.`,
    type: 'MCQ',
    questionText: 'What is the primary purpose of the author in citing the fMRI research by Haynes and others?',
    options: [
      'To provide absolute empirical proof that determinism is scientifically invalid.',
      'To contrast Libet\'s simple experimental setup with the complexity of modern fMRI systems.',
      'To argue that the low prediction rate of neural activity leaves room for conscious agency.',
      'To demonstrate that long-term moral choices are also initiated by the motor cortex.'
    ],
    correctAnswer: '2',
    explanation: 'The author notes that Haynes\' fMRI research has a prediction accuracy of only 60%, describing it as "hardly a death knell for agency." This is cited to support the skeptic\'s case that neural prediction is not absolute, and thus conscious agency remains possible.',
    shortcut: 'Identify how the Haynes citation supports the paragraph\'s theme of questioning deterministic conclusions.',
    trap: 'Option 1 is a trap. "Absolute empirical proof" is too strong; the passage itself says the prediction is "far from absolute".',
    difficulty: 'Medium',
    idealTime: 90,
    avgAccuracy: 65,
    videoUrl: 'https://youtube.com/watch?v=mock-rc2'
  },
  {
    id: 'varc-pj-1',
    section: 'VARC',
    topic: 'Para Jumbles',
    subtopic: 'Sentence Rearrangement',
    type: 'TITA',
    questionText: 'Arrange the following sentences in a logical sequence to form a coherent paragraph. Enter the correct order of sentences (e.g., 1234).\n\n1. By organizing databases around associations rather than tables, search speeds can be exponentially improved.\n2. In traditional relational databases, querying highly connected data requires expensive table join operations.\n3. Graph databases, however, represent data entities directly as nodes and relations as edges.\n4. This direct mapping makes them exceptionally suited for social networks, recommendation engines, and fraud detection.',
    correctAnswer: '2314',
    explanation: 'Sentence 2 sets the context by describing the limitation of traditional relational databases (expensive table joins). Sentence 3 introduces "Graph databases" as a contrast ("however") that models relationships directly. Sentence 1 explains the technical benefit of this structure (faster search via associations). Sentence 4 concludes by noting the specific applications (social networks, recommendation engines) where this speed and association-based mapping are most useful.',
    shortcut: 'Sentence 2 and 3 form a classic contrast pair (Relational vs. Graph databases). Sentence 1 explains the mechanism, and Sentence 4 begins with "This direct mapping" which refers back to "associations" and "nodes/edges" in 3 and 1, linking them as 2-3-1-4.',
    trap: 'Starting with 3 is a trap. The "however" in 3 requires 2 to come first to establish what it is contrasting against.',
    difficulty: 'Medium',
    idealTime: 120,
    avgAccuracy: 52
  },
  {
    id: 'varc-ps-1',
    section: 'VARC',
    topic: 'Para Summary',
    subtopic: 'Summary Identification',
    type: 'MCQ',
    questionText: 'Read the paragraph below and choose the option that best summarizes it:\n\nFor years, economic theory assumed that humans are perfectly rational agents—homo economicus—who weigh utility, minimize costs, and make optimal decisions. However, behavioral economics has dismantled this idealized view. Pioneered by Kahneman and Tversky, it demonstrates that humans rely on cognitive shortcuts (heuristics) that lead to systematic biases, such as loss aversion and anchoring. These deviations from rationality are not random errors but predictable patterns that dictate financial and personal choices.',
    options: [
      'Traditional economic theories are entirely wrong and should be replaced by psychological models of decision making.',
      'Behavioral economics reveals that human decision-making is governed by predictable cognitive biases rather than perfect rationality.',
      'Kahneman and Tversky proved that loss aversion is the main reason why economic models fail to predict market crashes.',
      'Humans are irrational beings whose financial choices are chaotic and cannot be captured by mathematical economic frameworks.'
    ],
    correctAnswer: '1',
    explanation: 'The passage outlines the shift from the classical economic view of humans as rational agents to the behavioral economics view that shows predictable biases. Option 2 (index 1) captures this perfectly, stating that choices are governed by predictable biases instead of perfect rationality.',
    shortcut: 'A good summary must capture both the rejected premise (perfect rationality) and the proposed alternative (predictable heuristic biases).',
    trap: 'Option 4 is a trap. It calls human choices "chaotic", whereas the text explicitly states these deviations are "predictable patterns".',
    difficulty: 'Easy',
    idealTime: 75,
    avgAccuracy: 78
  },

  // ================= DILR =================
  {
    id: 'dilr-set-1-q1',
    section: 'DILR',
    topic: 'Venn Diagrams',
    subtopic: 'Set Theory & Logic',
    passage: `In a business school class of 100 students, three optional certification tracks are offered: Finance (F), Marketing (M), and Operations (O). The following information is known:\n- 50 students took Finance, 45 took Marketing, and 40 took Operations.\n- 15 students took both Finance and Marketing.\n- 18 students took both Marketing and Operations.\n- 12 students took both Finance and Operations.\n- 5 students took all three certifications.`,
    type: 'MCQ',
    questionText: 'How many students did not opt for any of the three certification tracks?',
    options: [
      '5',
      '10',
      '15',
      '20'
    ],
    correctAnswer: '0',
    explanation: 'Using the Principle of Inclusion-Exclusion for three sets:\nTotal (At least one) = F + M + O - (F∩M + M∩O + F∩O) + (F∩M∩O)\nTotal (At least one) = 50 + 45 + 40 - (15 + 18 + 12) + 5 = 135 - 45 + 5 = 95.\nSince there are 100 students in total, the number of students who did not take any certification is 100 - 95 = 5.',
    shortcut: 'Always draw the 3-loop Venn Diagram. Fill from the center outwards: Center = 5. Finance/Marketing only = 15 - 5 = 10. Marketing/Operations only = 18 - 5 = 13. Finance/Operations only = 12 - 5 = 7. Finance only = 50 - (10 + 7 + 5) = 28. Marketing only = 45 - (10 + 13 + 5) = 17. Operations only = 40 - (7 + 13 + 5) = 15. Sum all regions: 28+17+15+10+13+7+5 = 95. Leftover = 100 - 95 = 5.',
    trap: 'Forgetting to add back the triple intersection (5) in the Inclusion-Exclusion formula leads to an answer of 10, which is incorrect.',
    difficulty: 'Medium',
    idealTime: 180,
    avgAccuracy: 70
  },
  {
    id: 'dilr-set-1-q2',
    section: 'DILR',
    topic: 'Venn Diagrams',
    subtopic: 'Set Theory & Logic',
    passage: `In a business school class of 100 students, three optional certification tracks are offered: Finance (F), Marketing (M), and Operations (O). The following information is known:\n- 50 students took Finance, 45 took Marketing, and 40 took Operations.\n- 15 students took both Finance and Marketing.\n- 18 students took both Marketing and Operations.\n- 12 students took both Finance and Operations.\n- 5 students took all three certifications.`,
    type: 'TITA',
    questionText: 'How many students chose exactly two certifications?',
    correctAnswer: '30',
    explanation: 'From the Venn diagram regions:\n- Students taking F and M only = 15 - 5 = 10\n- Students taking M and O only = 18 - 5 = 13\n- Students taking F and O only = 12 - 5 = 7\nSum of students taking exactly two certifications = 10 + 13 + 7 = 30.',
    shortcut: 'Sum of double intersections - 3 * (triple intersection) = (15 + 18 + 12) - 3(5) = 45 - 15 = 30.',
    trap: 'Directly adding (15 + 18 + 12) = 45 is a trap because the 5 students taking all three are counted in each intersection. You must subtract 3 * 5 = 15 to get the correct number for "exactly two".',
    difficulty: 'Medium',
    idealTime: 120,
    avgAccuracy: 58
  },
  {
    id: 'dilr-set-2-q1',
    section: 'DILR',
    topic: 'Games and Tournaments',
    subtopic: 'Knockout Tournaments',
    passage: `In a tennis tournament, 64 players participate. The tournament is a single-elimination knockout tournament. The players are seeded from 1 to 64, with Seed 1 being the strongest and Seed 64 being the weakest. In the first round, Seed 1 plays Seed 64, Seed 2 plays Seed 63, and in general, Seed X plays Seed (65 - X). In subsequent rounds, matches are played between winners of previous rounds such that if there are no upsets, the top-seeded player always wins against any lower-seeded player. An upset occurs when a lower-seeded player defeats a higher-seeded player.`,
    type: 'MCQ',
    questionText: 'If there are no upsets throughout the tournament, which seed will play Seed 5 in the Quarter-Finals (Round of 8)?',
    options: [
      'Seed 12',
      'Seed 13',
      'Seed 4',
      'Seed 28'
    ],
    correctAnswer: '2',
    explanation: 'In a standard knockout tournament with no upsets, the seeds that reach the Quarter-Finals are Seeds 1 through 8.\nIn the Quarter-Finals, the matchups are structured such that the highest remaining seed plays the lowest remaining seed. Thus, the matchups are:\n- Seed 1 vs Seed 8\n- Seed 2 vs Seed 7\n- Seed 3 vs Seed 6\n- Seed 4 vs Seed 5\nSo, Seed 5 plays Seed 4 (option 2, index 2) in the Quarter-Finals.',
    shortcut: 'In any round of N players, Seed X plays Seed (N + 1 - X). In the Quarter-Finals, there are 8 players. So Seed 5 plays (8 + 1 - 5) = Seed 4.',
    trap: 'Confusing the Quarter-Final match format with the Round of 16 (where Seed 5 plays Seed 12) is a common mistake.',
    difficulty: 'Hard',
    idealTime: 200,
    avgAccuracy: 42
  },

  // ================= QA =================
  {
    id: 'qa-arith-1',
    section: 'QA',
    topic: 'Arithmetic',
    subtopic: 'Time, Speed and Distance',
    type: 'MCQ',
    questionText: 'A train starts from Delhi to Mumbai at 8:00 AM at a speed of 60 km/h. Another train starts from Mumbai to Delhi at 9:00 AM at a speed of 90 km/h. If the distance between Delhi and Mumbai is 510 km, at what time will the two trains cross each other?',
    options: [
      '11:00 AM',
      '12:00 PM',
      '12:30 PM',
      '1:00 PM'
    ],
    correctAnswer: '1',
    explanation: '1. By 9:00 AM, the first train has traveled for 1 hour at 60 km/h, covering 60 km.\n2. The remaining distance between the two trains at 9:00 AM is 510 - 60 = 450 km.\n3. Since they are traveling towards each other, their relative speed is 60 + 90 = 150 km/h.\n4. The time taken to meet after 9:00 AM is Remaining Distance / Relative Speed = 450 / 150 = 3 hours.\n5. Therefore, they cross each other 3 hours after 9:00 AM, which is 12:00 PM (noon).',
    shortcut: 'Reduce the problem to a single starting time. Distance at 9:00 AM is 450 km. Time = 450/150 = 3 hrs. 9 AM + 3 hours = 12 PM.',
    trap: 'Calculating time taken using the full 510 km (510 / 150 = 3.4 hours) and adding it to 8:00 AM or 9:00 AM is a common trap.',
    difficulty: 'Easy',
    idealTime: 90,
    avgAccuracy: 84
  },
  {
    id: 'qa-alg-1',
    section: 'QA',
    topic: 'Algebra',
    subtopic: 'Quadratic Equations',
    type: 'TITA',
    questionText: 'Find the value of k for which the quadratic equation x^2 - 2(k - 1)x + (k + 5) = 0 has equal real roots.',
    correctAnswer: '4',
    explanation: 'For a quadratic equation ax^2 + bx + c = 0 to have equal roots, its discriminant D = b^2 - 4ac must equal 0.\nHere, a = 1, b = -2(k - 1), c = k + 5.\nD = [-2(k - 1)]^2 - 4(1)(k + 5) = 0\n4(k - 1)^2 - 4(k + 5) = 0\n(k - 1)^2 - (k + 5) = 0\nk^2 - 2k + 1 - k - 5 = 0\nk^2 - 3k - 4 = 0\n(k - 4)(k + 1) = 0\nk = 4 or k = -1.\nUsually in CAT questions of this type, they ask for the positive value or list options. If they ask for the positive value, it is 4.',
    shortcut: 'Fast factorization of k^2 - 3k - 4 = 0 gives roots 4 and -1 directly. Select 4.',
    trap: 'Forgetting to square the "-2" prefix in the coefficient b, resulting in a wrong equation (k - 1)^2 - (k + 5) = 0, is a common algebraic error.',
    difficulty: 'Medium',
    idealTime: 100,
    avgAccuracy: 72
  },
  {
    id: 'qa-geom-1',
    section: 'QA',
    topic: 'Geometry',
    subtopic: 'Triangles',
    type: 'MCQ',
    questionText: 'In a triangle ABC, the length of the sides AB and AC are 8 cm and 15 cm respectively. If the area of the triangle is 60 sq.cm, what is the length of the side BC?',
    options: [
      '17 cm',
      'sqrt(289) cm',
      '19 cm',
      'None of the above'
    ],
    correctAnswer: '0',
    explanation: 'The area of a triangle can be represented as: Area = 0.5 * b * c * sin(A)\nHere, Area = 60, b = 15, c = 8.\n60 = 0.5 * 15 * 8 * sin(A)\n60 = 60 * sin(A)\nsin(A) = 1.\nSince sin(A) = 1, angle A must be 90 degrees. This means ABC is a right-angled triangle with the right angle at A.\nUsing Pythagoras theorem: BC^2 = AB^2 + AC^2 = 8^2 + 15^2 = 64 + 225 = 289.\nBC = sqrt(289) = 17 cm.',
    shortcut: 'Recognize that 8 and 15 form a right triangle with area 0.5 * 8 * 15 = 60. The hypotenuse of the 8-15-17 Pythagorean triplet is 17.',
    trap: 'Option 1 (17) is correct. Option 3 is a trap for those who guess without checking the sine value.',
    difficulty: 'Medium',
    idealTime: 90,
    avgAccuracy: 75
  },
  {
    id: 'qa-num-1',
    section: 'QA',
    topic: 'Number System',
    subtopic: 'Remainders',
    type: 'TITA',
    questionText: 'Find the remainder when 2^100 is divided by 101.',
    correctAnswer: '1',
    explanation: 'By Fermat\'s Little Theorem, if p is a prime number and a is not divisible by p, then a^(p - 1) ≡ 1 (mod p).\nHere, p = 101, which is a prime number, and a = 2.\nTherefore, 2^(101 - 1) = 2^100 ≡ 1 (mod 101).\nThe remainder is 1.',
    shortcut: 'Fermat\'s Little Theorem directly states 2^(p-1) mod p = 1 since 101 is prime. Instantly write 1.',
    trap: 'Trying to calculate powers of 2 or using cyclicity without noticing that 101 is prime and 100 = 101 - 1 leads to wasted time.',
    difficulty: 'Medium',
    idealTime: 45,
    avgAccuracy: 80
  },
  {
    id: 'qa-mod-1',
    section: 'QA',
    topic: 'Modern Math',
    subtopic: 'Permutations & Combinations',
    type: 'MCQ',
    questionText: 'In how many ways can 5 identical chocolates be distributed among 3 children such that each child gets at least one chocolate?',
    options: [
      '6',
      '10',
      '15',
      '21'
    ],
    correctAnswer: '0',
    explanation: 'This is a standard stars-and-bars problem. We are distributing n identical items among r groups.\nWhen each group must receive at least 1 item, the formula is (n - 1) C (r - 1).\nHere, n = 5 (chocolates) and r = 3 (children).\nWays = (5 - 1) C (3 - 1) = 4 C 2 = 6.',
    shortcut: 'Place 5 stars in a row: * * * * *. There are 4 gaps. We need to place 2 bars in these gaps to divide them into 3 parts. 4 C 2 = 6.',
    trap: 'Using the formula (n + r - 1) C (r - 1), which is for the case where children can get zero chocolates, gives 7 C 2 = 21, a common error.',
    difficulty: 'Easy',
    idealTime: 60,
    avgAccuracy: 88
  }
];
