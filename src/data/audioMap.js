export const IELTS_QUESTIONS_PER_PART = 10

export const audioMap = {
  ielts: {
    cambridge21: {
      test1: {
        // Use fullTest when your assessment uses one long recording for all 40 questions.
        // Leave part-level urls in place when each IELTS part has its own audio file.
        fullTest: {
          title: 'Cambridge IELTS 21 - Test 1 Full Listening Test',
          url: '',
        },
        part1: {
          title: 'Cambridge IELTS 21 - Test 1 Listening Part 1',
          url: 'https://your-vercel-blob-url-here/cambridge-21-test-1-part-1.mp3',
          questionStart: 1,
          questionEnd: 10,
          startTime: 0,
          endTime: null,
        },
        part2: {
          title: 'Cambridge IELTS 21 - Test 1 Listening Part 2',
          url: 'https://your-vercel-blob-url-here/cambridge-21-test-1-part-2.mp3',
          questionStart: 11,
          questionEnd: 20,
          startTime: null,
          endTime: null,
        },
        part3: {
          title: 'Cambridge IELTS 21 - Test 1 Listening Part 3',
          url: 'https://your-vercel-blob-url-here/cambridge-21-test-1-part-3.mp3',
          questionStart: 21,
          questionEnd: 30,
          startTime: null,
          endTime: null,
        },
        part4: {
          title: 'Cambridge IELTS 21 - Test 1 Listening Part 4',
          url: 'https://your-vercel-blob-url-here/cambridge-21-test-1-part-4.mp3',
          questionStart: 31,
          questionEnd: 40,
          startTime: null,
          endTime: null,
        },
      },
    },
    test1: {
      fullTest: {
        title: 'Test 1 Full Listening Test',
        url: '',
      },
      part1: {
        title: 'Test 1 Part 1',
        url: 'https://your-vercel-blob-url-here/test-1-part-1.mp3',
        questionStart: 1,
        questionEnd: 10,
        startTime: 0,
        endTime: null,
      },
      part2: {
        title: 'Test 1 Part 2',
        url: 'https://your-vercel-blob-url-here/test-1-part-2.mp3',
        questionStart: 11,
        questionEnd: 20,
        startTime: null,
        endTime: null,
      },
      part3: {
        title: 'Test 1 Part 3',
        url: 'https://your-vercel-blob-url-here/test-1-part-3.mp3',
        questionStart: 21,
        questionEnd: 30,
        startTime: null,
        endTime: null,
      },
      part4: {
        title: 'Test 1 Part 4',
        url: 'https://your-vercel-blob-url-here/test-1-part-4.mp3',
        questionStart: 31,
        questionEnd: 40,
        startTime: null,
        endTime: null,
      },
    },
  },
}

export function getIeltsPartAudio(testSet, partKey) {
  const partAudio = testSet?.[partKey]
  const fullTestAudio = testSet?.fullTest

  if (!partAudio) {
    return null
  }

  if (partAudio.url) {
    return partAudio
  }

  if (fullTestAudio?.url) {
    return {
      ...partAudio,
      url: fullTestAudio.url,
      title: partAudio.title || fullTestAudio.title,
    }
  }

  return null
}
