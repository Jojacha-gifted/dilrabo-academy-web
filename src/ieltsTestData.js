// src/ieltsTestData.js
export const part1Data = {
  part: 1,
  title: "Listening Part 1",
  audioUrls: [
    "https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P1.1.mp3",
    "https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P1.2.mp3"
  ],
  sections: [
    {
      id: 1,
      instructions: [
        "Questions 1-6",
        "Complete the table below.",
        "Write ONE WORD AND/OR A NUMBER for each answer.",
        "Oyster Bay Sailing Club Courses"
      ],
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
      instructions: [
        "Questions 7-10",
        "Complete the notes below.",
        "Write ONE WORD ONLY for each answer."
      ],
      questions: [
        { id: 7, type: "text", text: "Bring suitable clothing, a __ and toiletries" },
        { id: 8, type: "text", text: "There is a __ at the club" },
        { id: 9, type: "text", text: "Online training __ are recommended" },
        { id: 10, type: "text", text: "__ are available for course participants" }
      ]
    }
  ]
};