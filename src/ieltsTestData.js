// src/ieltsTestData.js

export const part1Data = {
  part: 1,
  title: "Listening Part 1",
  audioUrls: ["https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P1.1.mp3"],
  sections: [
    {
      id: 1,
      instructions: ["Complete the table below.", "Write ONE WORD AND/OR A NUMBER."],
      questions: [
        { id: 1, type: "text", text: "Small groups (max __ people)" },
        { id: 2, type: "text", text: "Basic theory e.g. understanding the __ and tides" },
        { id: 3, type: "text", text: "Basic sailing skills including __ information" },
        { id: 4, type: "text", text: "£__ available for club members" },
        { id: 5, type: "text", text: "All inclusive (plus a useful __)" },
        { id: 6, type: "text", text: "A __ at the end of the course for all participants" }
      ]
    },
    {
      id: 2,
      instructions: ["Complete the notes below.", "Write ONE WORD ONLY."],
      questions: [
        { id: 7, type: "text", text: "Bring suitable clothing, a __ and toiletries" },
        { id: 8, type: "text", text: "There is a __ at the club" },
        { id: 9, type: "text", text: "Online training __ are recommended" },
        { id: 10, type: "text", text: "__ are available for course participants" }
      ]
    }
  ]
};

export const part2Data = {
  part: 2,
  title: "Listening Part 2",
  audioUrls: ["https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P2.mp3"],
  sections: [
    {
      id: 1,
      instructions: ["Questions 11-14", "Choose the correct letter, A, B or C."],
      questions: [
        { id: 11, type: "text", text: "Why did the speaker decide to start a cycle tour company?" },
        { id: 12, type: "text", text: "What is special about the 'cycle tour' experience offered?" },
        { id: 13, type: "text", text: "How does the speaker ensure the safety of the tour participants?" },
        { id: 14, type: "text", text: "What is the main advantage of the tour routes?" }
      ]
    },
    {
      id: 2,
      instructions: ["Questions 15-20", "Choose TWO letters, A-E."],
      questions: [
        { id: 15, type: "text", text: "Which TWO things must participants bring?" },
        { id: 16, type: "text", text: "Which TWO aspects are included in the price?" },
        { id: 17, type: "text", text: "Which TWO services are available at the base camp?" },
        { id: 18, type: "text", text: "Which TWO rules are strictly enforced?" },
        { id: 19, type: "text", text: "Which TWO areas are visited during the trip?" },
        { id: 20, type: "text", text: "Which TWO activities are optional?" }
      ]
    }
  ]
};

export const part3Data = {
  part: 3,
  title: "Listening Part 3",
  audioUrls: ["https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P3.mp3"],
  sections: [
    {
      id: 1,
      instructions: ["Questions 21-26", "Choose the correct letter, A, B or C."],
      questions: [
        { id: 21, type: "text", text: "What does the research focus on?" },
        { id: 22, type: "text", text: "What was the initial hypothesis?" },
        { id: 23, type: "text", text: "How was the data collected?" },
        { id: 24, type: "text", text: "What were the unexpected results?" },
        { id: 25, type: "text", text: "How did the participants react?" },
        { id: 26, type: "text", text: "What does the speaker conclude?" }
      ]
    },
    {
      id: 2,
      instructions: ["Questions 27-30", "Match the researchers with the findings."],
      questions: [
        { id: 27, type: "text", text: "Dr. Smith: __" },
        { id: 28, type: "text", text: "Prof. Jones: __" },
        { id: 29, type: "text", text: "Dr. Lee: __" },
        { id: 30, type: "text", text: "Prof. Brown: __" }
      ]
    }
  ]
};
export const part4Data = {
  part: 4,
  title: "Listening Part 4",
  audioUrls: ["https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P4.mp3"],
  sections: [
    {
      id: 1,
      instructions: ["Questions 31-40", "Complete the notes below.", "Write ONE WORD ONLY."],
      questions: [
        { id: 31, type: "text", text: "Early methods of __ were inefficient." },
        { id: 32, type: "text", text: "The impact of __ was underestimated." },
        { id: 33, type: "text", text: "New technology allows for better __." },
        { id: 34, type: "text", text: "The cost of __ has decreased significantly." },
        { id: 35, type: "text", text: "Future developments will focus on __." },
        { id: 36, type: "text", text: "Problems with the current __ must be addressed." },
        { id: 37, type: "text", text: "Experts suggest using a different __." },
        { id: 38, type: "text", text: "The role of __ is critical in the process." },
        { id: 39, type: "text", text: "Public __ is essential for success." },
        { id: 40, type: "text", text: "The final __ will be published next year." }
      ]
    }
  ]
};

export const ieltsExamParts = [part1Data, part2Data, part3Data, part4Data];
