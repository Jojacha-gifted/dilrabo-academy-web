import { ieltsExamParts } from './ieltsTestData.js'

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
  if (correctCount >= 8) return 3.5
  if (correctCount >= 6) return 3.0
  if (correctCount >= 4) return 2.5
  return 1.0
}

export function getBandDescription(bandScore) {
  if (bandScore >= 9) return 'Expert user'
  if (bandScore >= 8) return 'Very good user'
  if (bandScore >= 7) return 'Good user'
  if (bandScore >= 6) return 'Competent user'
  if (bandScore >= 5) return 'Modest user'
  if (bandScore >= 4) return 'Limited user'
  if (bandScore >= 3) return 'Extremely limited user'
  if (bandScore >= 2) return 'Intermittent user'
  return 'Non-user'
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

function getAnswerEntries(parts) {
  return parts.flatMap((part) => {
    return Object.entries(part.answers ?? {}).map(([questionId, expectedAnswer]) => ({
      questionId,
      expectedAnswer,
    }))
  })
}

function getAnswerGroupKey(expectedAnswer) {
  if (!Array.isArray(expectedAnswer)) return null
  return expectedAnswer.map((answer) => normalizeAnswer(answer)).sort().join('|')
}

function countGroupedAnswers(entries, userAnswers) {
  let correctCount = 0
  const groupedEntries = new Map()

  entries.forEach((entry) => {
    const groupKey = getAnswerGroupKey(entry.expectedAnswer)

    if (!groupKey) {
      correctCount += Number(isAnswerCorrect(userAnswers[entry.questionId], entry.expectedAnswer))
      return
    }

    const group = groupedEntries.get(groupKey) ?? {
      expectedAnswer: entry.expectedAnswer,
      questionIds: [],
    }

    group.questionIds.push(entry.questionId)
    groupedEntries.set(groupKey, group)
  })

  groupedEntries.forEach((group) => {
    const usedAnswers = new Set()

    group.questionIds.forEach((questionId) => {
      const studentAnswer = userAnswers[questionId]
      const comparableAnswers = getComparableAnswers(studentAnswer)
      const matchedAnswer = group.expectedAnswer.find((expectedAnswer) => {
        const expectedComparables = getComparableAnswers(expectedAnswer)
        return [...expectedComparables].some((answer) => comparableAnswers.has(answer))
      })
      const normalizedMatch = normalizeAnswer(matchedAnswer)

      if (normalizedMatch && !usedAnswers.has(normalizedMatch)) {
        usedAnswers.add(normalizedMatch)
        correctCount += 1
      }
    })
  })

  return correctCount
}

export function calculateCorrectCount(userAnswers, parts = ieltsExamParts) {
  return countGroupedAnswers(getAnswerEntries(parts), userAnswers)
}