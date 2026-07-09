export function calculateListeningBand(correctCount) {
  if (correctCount >= 39) return 9.0;
  if (correctCount >= 37) return 8.5;
  if (correctCount >= 35) return 8.0;
  if (correctCount >= 32) return 7.5;
  if (correctCount >= 30) return 7.0;
  if (correctCount >= 26) return 6.5;
  if (correctCount >= 23) return 6.0;
  if (correctCount >= 18) return 5.5;
  if (correctCount >= 16) return 5.0;
  if (correctCount >= 13) return 4.5;
  if (correctCount >= 11) return 4.0;
  if (correctCount >= 8) return 3.5;
  if (correctCount >= 6) return 3.0;
  if (correctCount >= 4) return 2.5;
  return 1.0; // Returns 1.0 for scores 0-3
}

function extractChoiceLetter(value) {
  const text = String(value ?? '').trim()
  const match = text.match(/^([a-z])(?:[\s.)\-:]+|$)/i)
  return match ? match[1].toLowerCase() : ''
}

export function normalizeAnswer(value) {
  return String(value ?? '').trim().toLowerCase()
}

function getComparableAnswers(value) {
  const values = Array.isArray(value) ? value : [value]
  return values.reduce((answers, item) => {
    const normalized = normalizeAnswer(item)
    const letter = extractChoiceLetter(item)

    if (normalized) answers.add(normalized)
    if (letter) answers.add(letter)

    return answers
  }, new Set())
}

export function isAnswerCorrect(studentAnswer, expectedAnswer) {
  if (expectedAnswer === undefined || expectedAnswer === null) return false

  const studentAnswers = getComparableAnswers(studentAnswer)
  const acceptedAnswers = Array.isArray(expectedAnswer) ? expectedAnswer : [expectedAnswer]

  return acceptedAnswers.some((answer) => {
    const comparableAnswers = getComparableAnswers(answer)
    return [...comparableAnswers].some((comparableAnswer) => studentAnswers.has(comparableAnswer))
  })
}