// src/ieltsTestData.js
export const ieltsTest1 = [
  {
    part: 1,
    audioUrl: "/audio/test1_part1.mp3",
    questions: [
      { id: 1, type: "text", text: "Small groups (max __ people)" },
      // ... continue until Q10
    ]
  },
  {
    part: 2,
    audioUrl: "/audio/test1_part2.mp3",
    questions: [
      { id: 11, type: "multiple-choice", text: "What should trainees...", options: ["A", "B", "C"] },
      // ... continue until Q20
    ]
  },
  // ... continue for Part 3 and 4
];