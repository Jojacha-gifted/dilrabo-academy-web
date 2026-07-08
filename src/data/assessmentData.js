export const DIAGNOSTIC_LENGTH = 30
export const QUESTIONS_PER_TIER = 10
const TIER_KEYS = ['tier1', 'tier2', 'tier3']

export const assessmentQuestionBanks = {
  englishBank: {
    tier1: [
      {
        prompt: "Which sentence is grammatically correct?",
        options: [
          "She go to school every morning.",
          "She goes to school every morning.",
          "She going to school every morning.",
        ],
        correct: 1,
      },
      {
        prompt: "Choose the word closest in meaning to 'careful'.",
        options: ["Thoughtless", "Attentive", "Noisy"],
        correct: 1,
      },
      {
        prompt: "Which reply best completes the question: 'How often do you read in English?'",
        options: [
          "I read in English three times a week.",
          "Because my teacher is kind.",
          "At the library yesterday.",
        ],
        correct: 0,
      },
      {
        prompt: "Choose the correct past tense sentence.",
        options: [
          "They visited their grandmother last weekend.",
          "They visit their grandmother last weekend.",
          "They visiting their grandmother last weekend.",
        ],
        correct: 0,
      },
      {
        prompt: "Which word best completes the sentence: 'The movie was so ___ that everyone laughed.'",
        options: ["funny", "hungry", "early"],
        correct: 0,
      },
      {
        prompt: "What is the opposite of 'arrive'?",
        options: ["Enter", "Leave", "Travel"],
        correct: 1,
      },
      {
        prompt: "Which sentence uses the article correctly?",
        options: [
          "I saw an elephant at the zoo.",
          "I saw a elephant at the zoo.",
          "I saw the elephant at zoo.",
        ],
        correct: 0,
      },
      {
        prompt: "Choose the best meaning of 'borrow'.",
        options: [
          "To give something to someone forever",
          "To take something for a short time and return it",
          "To pay money for a product",
        ],
        correct: 1,
      },
      {
        prompt: "Which answer fits: 'Where does your brother work?'",
        options: [
          "He works in a hospital.",
          "He is working yesterday.",
          "Because he likes science.",
        ],
        correct: 0,
      },
      {
        prompt: "Identify the correct plural form.",
        options: ["Childs", "Childes", "Children"],
        correct: 2,
      },
      {
        prompt: "Which sentence is correct?",
        options: ["He doesn't like tea.", "He don't likes tea.", "He not like tea."],
        correct: 0,
      },
      {
        prompt: "Choose the best word to complete the sentence: 'My sister is very ___ and always says thank you.'",
        options: ["polite", "empty", "curly"],
        correct: 0,
      },
    ],
    tier2: [
      {
        prompt: "Which sentence is punctuated correctly?",
        options: [
          "After dinner, we played chess.",
          "After dinner we played chess.",
          "After dinner; we played chess.",
        ],
        correct: 0,
      },
      {
        prompt: "Choose the word that best completes the sentence: 'I need to ___ my homework before dinner.'",
        options: ["finish", "finishes", "finished"],
        correct: 0,
      },
      {
        prompt: "Which phrase is a polite request?",
        options: [
          "Open the window.",
          "Could you open the window, please?",
          "You open the window now.",
        ],
        correct: 1,
      },
      {
        prompt: "What does 'usually' mean?",
        options: ["Every day without fail", "Most of the time", "Only once"],
        correct: 1,
      },
      {
        prompt: "Which sentence shows the future tense?",
        options: [
          "I am eating breakfast now.",
          "I ate breakfast early.",
          "I will eat breakfast at 8 o'clock.",
        ],
        correct: 2,
      },
      {
        prompt: "Choose the sentence with the correct preposition.",
        options: [
          "We walked across the bridge.",
          "We walked between the bridge.",
          "We walked under the school to get home.",
        ],
        correct: 0,
      },
      {
        prompt: "Which word is a synonym for 'rapid'?",
        options: ["Slow", "Quick", "Silent"],
        correct: 1,
      },
      {
        prompt: "Complete the sentence: 'There ___ two books on the table.'",
        options: ["is", "are", "be"],
        correct: 1,
      },
      {
        prompt: "Which sentence is in the present continuous tense?",
        options: [
          "She writes every day.",
          "She is writing a letter now.",
          "She wrote a letter yesterday.",
        ],
        correct: 1,
      },
      {
        prompt: "What is the main idea of a paragraph?",
        options: [
          "A small detail that is not important",
          "The central point the writer wants to communicate",
          "The final word in the paragraph",
        ],
        correct: 1,
      },
      {
        prompt: "Which sentence uses a possessive form correctly?",
        options: [
          "The students books are on the table.",
          "The student's books are on the table.",
          "The students' books are on the table.",
        ],
        correct: 2,
      },
      {
        prompt: "Which transition word best shows contrast?",
        options: ["However", "Therefore", "Finally"],
        correct: 0,
      },
    ],
    tier3: [
      {
        prompt: "Choose the correct comparative form.",
        options: ["more tall", "taller", "tallest"],
        correct: 1,
      },
      {
        prompt: "Which response best fits: 'Why were you late?'",
        options: [
          "Because the bus arrived late.",
          "At seven o'clock.",
          "Near the market.",
        ],
        correct: 0,
      },
      {
        prompt: "Select the correctly spelled word.",
        options: ["Beautifull", "Beautiful", "Beutiful"],
        correct: 1,
      },
      {
        prompt: "Which sentence contains a conjunction?",
        options: [
          "I like apples and oranges.",
          "The box is heavy.",
          "She sang loudly.",
        ],
        correct: 0,
      },
      {
        prompt: "What does the pronoun 'they' replace in the sentence 'Mina and Sara finished their work, and they went home.'?",
        options: ["The work", "Mina and Sara", "The home"],
        correct: 1,
      },
      {
        prompt: "Choose the sentence with correct subject-verb agreement.",
        options: [
          "My friends likes football.",
          "My friend like football.",
          "My friends like football.",
        ],
        correct: 2,
      },
      {
        prompt: "Which word best completes the sentence: 'Please speak more ___ so everyone can hear you.'",
        options: ["clearly", "clear", "clearest"],
        correct: 0,
      },
      {
        prompt: "What is the purpose of a question mark?",
        options: [
          "To show strong feeling",
          "To end a question",
          "To separate items in a list",
        ],
        correct: 1,
      },
      {
        prompt: "Choose the best summary sentence for a student who studies every day and gets better marks.",
        options: [
          "The student is lazy.",
          "The student improves through regular study.",
          "The student never does homework.",
        ],
        correct: 1,
      },
      {
        prompt: "Which sentence is most appropriate in a formal message to a teacher?",
        options: [
          "Hey, send me the homework.",
          "Could you please share the homework task?",
          "Give me the homework now.",
        ],
        correct: 1,
      },
      {
        prompt: "Which sentence best combines the ideas clearly?",
        options: [
          "The test was difficult, but the students stayed calm.",
          "The test was difficult, so calm the students stayed.",
          "The difficult test because students stayed calm.",
        ],
        correct: 0,
      },
      {
        prompt: "Which sentence has the clearest academic tone?",
        options: [
          "The results show a steady improvement over time.",
          "The results are kinda getting better.",
          "The results did a nice job.",
        ],
        correct: 0,
      },
    ],
  },
  mathBank: {
    tier1: [
      {
        prompt: "Solve for x: 2x + 5 = 17",
        options: ["x = 5", "x = 6", "x = 7"],
        correct: 1,
      },
      {
        prompt: "A rectangle has length 8 cm and width 3 cm. What is its area?",
        options: ["11 cm^2", "24 cm^2", "22 cm^2"],
        correct: 1,
      },
      {
        prompt: "What is 3/4 of 20?",
        options: ["12", "15", "18"],
        correct: 1,
      },
      {
        prompt: "What is 45 + 27?",
        options: ["62", "72", "82"],
        correct: 1,
      },
      {
        prompt: "What is 9 x 7?",
        options: ["56", "63", "72"],
        correct: 1,
      },
      {
        prompt: "What is 84 divided by 12?",
        options: ["6", "7", "8"],
        correct: 1,
      },
      {
        prompt: "Which fraction is equal to 1/2?",
        options: ["2/3", "3/6", "4/10"],
        correct: 1,
      },
      {
        prompt: "Solve: 5x = 35",
        options: ["x = 5", "x = 6", "x = 7"],
        correct: 2,
      },
      {
        prompt: "What is the perimeter of a square with side length 6 cm?",
        options: ["12 cm", "24 cm", "36 cm"],
        correct: 1,
      },
      {
        prompt: "Which number is prime?",
        options: ["21", "29", "39"],
        correct: 1,
      },
      {
        prompt: "What is 6 + 7 x 2?",
        options: ["20", "26", "19"],
        correct: 0,
      },
      {
        prompt: "Which decimal is greater?",
        options: ["0.45", "0.405", "They are equal"],
        correct: 0,
      },
    ],
    tier2: [
      {
        prompt: "What is 0.8 + 0.35?",
        options: ["1.15", "1.05", "0.115"],
        correct: 0,
      },
      {
        prompt: "Find the value of 3^2.",
        options: ["6", "9", "12"],
        correct: 1,
      },
      {
        prompt: "A shop sells 4 notebooks for $12. How much does 1 notebook cost?",
        options: ["$2", "$3", "$4"],
        correct: 1,
      },
      {
        prompt: "What is 25% of 80?",
        options: ["15", "20", "25"],
        correct: 1,
      },
      {
        prompt: "Solve: 18 - (6 + 4)",
        options: ["8", "10", "12"],
        correct: 0,
      },
      {
        prompt: "Which angle is obtuse?",
        options: ["45 degrees", "90 degrees", "120 degrees"],
        correct: 2,
      },
      {
        prompt: "What is the next number in the pattern: 2, 5, 8, 11, ...?",
        options: ["12", "13", "14"],
        correct: 2,
      },
      {
        prompt: "If y = 4 and x = 3, what is 2x + y?",
        options: ["9", "10", "11"],
        correct: 1,
      },
      {
        prompt: "Convert 2.5 to a fraction in simplest form.",
        options: ["2/5", "5/2", "25/100"],
        correct: 1,
      },
      {
        prompt: "What is the mean of 4, 6, and 8?",
        options: ["5", "6", "7"],
        correct: 1,
      },
      {
        prompt: "If 3 notebooks cost $9, how much do 5 notebooks cost at the same rate?",
        options: ["$12", "$15", "$18"],
        correct: 1,
      },
      {
        prompt: "What is the value of 2(7 - 3) + 5?",
        options: ["8", "11", "13"],
        correct: 2,
      },
    ],
    tier3: [
      {
        prompt: "A triangle has angles 50 degrees and 60 degrees. What is the third angle?",
        options: ["60 degrees", "70 degrees", "80 degrees"],
        correct: 1,
      },
      {
        prompt: "What is 15% of 200?",
        options: ["25", "30", "35"],
        correct: 1,
      },
      {
        prompt: "Which expression is equivalent to 4(a + 2)?",
        options: ["4a + 2", "4a + 8", "a + 8"],
        correct: 1,
      },
      {
        prompt: "What is the value of 7^0?",
        options: ["0", "1", "7"],
        correct: 1,
      },
      {
        prompt: "A bag contains 5 red balls and 3 blue balls. How many balls are there in total?",
        options: ["8", "10", "15"],
        correct: 0,
      },
      {
        prompt: "What is the circumference formula for a circle?",
        options: ["C = 2pi r", "C = pi r^2", "C = d^2"],
        correct: 0,
      },
      {
        prompt: "If a book costs $18 after a $6 discount, what was the original price?",
        options: ["$20", "$22", "$24"],
        correct: 2,
      },
      {
        prompt: "Solve the inequality: x + 4 > 9",
        options: ["x > 5", "x < 5", "x = 5"],
        correct: 0,
      },
      {
        prompt: "What is the area of a triangle with base 10 cm and height 6 cm?",
        options: ["30 cm^2", "60 cm^2", "16 cm^2"],
        correct: 0,
      },
      {
        prompt: "A car travels 180 km in 3 hours. What is its average speed?",
        options: ["50 km/h", "60 km/h", "70 km/h"],
        correct: 1,
      },
      {
        prompt: "If 4x - 3 = 21, what is x?",
        options: ["5", "6", "7"],
        correct: 1,
      },
      {
        prompt: "A ratio of boys to girls is 3:4. If there are 28 students in total, how many are girls?",
        options: ["12", "16", "20"],
        correct: 1,
      },
    ],
  },
}

export const assessmentSubjects = {
  english: {
    label: 'English confidence',
    kicker: 'English diagnostic',
    bankKey: 'englishBank',
    description:
      'Launch a 30-question sequence that checks grammar, vocabulary awareness, and reading accuracy through multiple-choice questions.',
  },
  math: {
    label: 'Mathematics readiness',
    kicker: 'Mathematics diagnostic',
    bankKey: 'mathBank',
    description:
      'Open a 30-question sequence of algebra, geometry, arithmetic, and reasoning prompts to estimate mathematical control and response accuracy.',
  },
}

export const academicIndependencePaths = [
  {
    title: 'Teacher-guided',
    description: 'Best for learners who need close support, regular modelling, and step-by-step structure.',
  },
  {
    title: 'Supported independent',
    description: 'Best for learners who can work alone in parts of a lesson but still benefit from routines and check-ins.',
  },
  {
    title: 'Self-directed',
    description: 'Best for learners who stay organised, follow instructions well, and manage tasks with minimal prompting.',
  },
]

export const assessmentLevelMap = {
  beginner: {
    label: 'Beginner',
    note: 'Your Beginner score suggests you will benefit from a Teacher-guided study path.',
  },
  intermediate: {
    label: 'Intermediate',
    note: 'Your Intermediate score suggests you are ready for a Supported independent study path.',
  },
  advanced: {
    label: 'Advanced',
    note: 'Your Advanced score suggests you are ready for a Self-directed study path.',
  },
}

export function getAssessmentLevel(score) {
  if (score <= 10) return assessmentLevelMap.beginner
  if (score <= 20) return assessmentLevelMap.intermediate
  return assessmentLevelMap.advanced
}

function shuffleArray(items) {
  const clone = [...items]

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]]
  }

  return clone
}

export function generateBalancedQuiz(bank, length = DIAGNOSTIC_LENGTH) {
  if (!bank) throw new Error('Question bank is missing')

  const selectedQuestions = TIER_KEYS.flatMap((tierKey) => {
    const tier = bank[tierKey]

    if (!Array.isArray(tier) || tier.length < QUESTIONS_PER_TIER) {
      throw new Error(`Question bank tier "${tierKey}" must contain at least ${QUESTIONS_PER_TIER} questions.`)
    }

    return shuffleArray(tier).slice(0, QUESTIONS_PER_TIER)
  })

  if (selectedQuestions.length !== length) {
    throw new Error(`Expected ${length} questions, received ${selectedQuestions.length}`)
  }

  return shuffleArray(selectedQuestions)
}