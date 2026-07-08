// ieltsTestData.js
export const ieltsTest1 = [
  {
    part: 1,
    audioUrl: "/audio/test1_part1.mp3",
    questions: [
      { id: 1, type: "table", text: "Small groups (max __ people)", answer: "..." },
      { id: 2, type: "table", text: "basic theory e.g. understanding the __ and tides", answer: "..." },
      // ... continue until question 10
    ]
  },
  {
    part: 2,
    audioUrl: "/audio/test1_part2.mp3",
    questions: [
      { id: 11, type: "multiple-choice", text: "What should trainees always expect...", options: ["A...", "B...", "C..."], answer: "..." },
      // ... continue until question 20
    ]
  }
  // ... continue for parts 3 and 4
];