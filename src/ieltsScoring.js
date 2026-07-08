export function calculateListeningBand(correctCount) {
  if (correctCount >= 39) return 9.0
  if (correctCount >= 37) return 8.5
  if (correctCount >= 35) return 8.0
  if (correctCount >= 32) return 7.5
  if (correctCount >= 30) return 7.0
  if (correctCount >= 26) return 6.5
  if (correctCount >= 23) return 6.0
  if (correctCount >= 18) return 5.5
  if (correctCount >= 16) return 5.0
  if (correctCount >= 13) return 4.5
  if (correctCount >= 11) return 4.0
  return 0
}

export function normalizeAnswer(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function isAnswerCorrect(studentAnswer, expectedAnswer) {
  if (expectedAnswer === undefined || expectedAnswer === null) return false

  const acceptedAnswers = Array.isArray(expectedAnswer) ? expectedAnswer : [expectedAnswer]
  return acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(studentAnswer))
}