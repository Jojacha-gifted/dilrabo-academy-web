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
  audioUrls: ["https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P2.1.mp3", "https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P2.2.mp3"],
  sections: [
    {
      id: 1,
      instructions: ["Questions 11-16", "Choose the correct letter, A, B or C."],
      questions: [
        { id: 11, type: "multiple-choice", text: "What should trainees always expect to get when working on low budget short films?", options: ["A. travel expenses", "B. a minimum wage", "C. meals"] },
        { id: 12, type: "multiple-choice", text: "According to the speaker, on big budget films trainees may get experience of", options: ["A. makeup for special effects.", "B. working with different ethnicities.", "C. creating a variety of hair styles."] },
        { id: 13, type: "multiple-choice", text: "The speaker says a problem for makeup artists is", options: ["A. dealing with difficult directors.", "B. being shouted at by their supervisor.", "C. waiting around for hours doing nothing."] },
        { id: 14, type: "multiple-choice", text: "How did the speaker feel when she met famous actors for the first time?", options: ["A. very shy", "B. very proud", "C. very disappointed"] },
        { id: 15, type: "multiple-choice", text: "What advice does the speaker give about makeup kits?", options: ["A. Always carry a basic kit with you.", "B. Only buy the best products for a makeup kit.", "C. Ask other makeup artists to check your kit."] },
        { id: 16, type: "multiple-choice", text: "What advice does the speaker give about creating a portfolio?", options: ["A. Keep print and digital photos.", "B. Only include a small selection of photos.", "C. Get permission to use photos."] }
      ]
    },
    {
      id: 2,
      instructions: ["Questions 17-20", "What ability is required for each of the following duties?", "Write the correct letter, A, B or C, next to Questions 17-20."],
      note: "A: being well-organised, B: being flexible, C: working quickly",
      questions: [
        { id: 17, type: "text", text: "17. Prepping an actor" },
        { id: 18, type: "text", text: "18. Continuity" },
        { id: 19, type: "text", text: "19. General" },
        { id: 20, type: "text", text: "20. Applying makeup" }
      ]
    }
  ]
};

export const part3Data = {
  part: 3,
  title: "Listening Part 3",
  audioUrls: ["https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P3.1.mp3", "https://jufawgkygh9xq4ka.public.blob.vercel-storage.com/IELTS%2021%20AUDIO/C21T1P3.2.mp3"],
  sections: [
    {
      id: 1,
      instructions: ["Questions 21 and 22", "Choose TWO letters, A-E.", "Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?"],
      options: [
        "A. the references to local problems",
        "B. the broad focus of the examples",
        "C. the practical suggestions for solutions",
        "D. the type of issues discussed",
        "E. the implications for government policy"
      ],
      questions: [
        { id: 21, type: "checkbox", text: "21" },
        { id: 22, type: "checkbox", text: "22" }
      ]
    },
    {
      id: 2,
      instructions: ["Questions 23 and 24", "Choose TWO letters, A-E.", "Which TWO details about the research project particularly impressed the students?"],
      options: [
        "A. the team's previous successes",
        "B. its wide geographical scale",
        "C. the use of new technology",
        "D. the extensive statistical evidence",
        "E. the large range of specialists involved"
      ],
      questions: [
        { id: 23, type: "checkbox", text: "23" },
        { id: 24, type: "checkbox", text: "24" }
      ]
    },
    {
      id: 3,
      instructions: ["Questions 25-30", "What is the students' opinion of each of the following resources related to ocean biodiversity?", "Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30."],
      box: [
        "A. This is aimed at a very specialist audience.",
        "B. This is now rather outdated.",
        "C. This was an effective description of a new danger.",
        "D. This suggests possible ways to improve the situation.",
        "E. This does not give a balanced account.",
        "F. This is too predictable to be useful.",
        "G. This gives insufficient evidence for its claims.",
        "H. This gives a clear explanation of the problems."
      ],
      questions: [
        { id: 25, type: "text", text: "25. Article on invasive lionfish" },
        { id: 26, type: "text", text: "26. Documentary on microplastics" },
        { id: 27, type: "text", text: "27. Podcast on ocean pollution" },
        { id: 28, type: "text", text: "28. Book on coastal ecosystems" },
        { id: 29, type: "text", text: "29. Article on metal toxicity" },
        { id: 30, type: "text", text: "30. Podcast on floating marine cities" }
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
      instructions: ["Questions 31-40", "Complete the notes below.", "Write ONE WORD ONLY for each answer."],
      questions: [
        { id: 31, type: "text", text: "31. Three resources which are essential for industrial civilisation: __" },
        { id: 32, type: "text", text: "32. The supply of natural rubber is limited because the growth of the tree is __" },
        { id: 33, type: "text", text: "33. Production cannot easily be adjusted because of increasing or decreasing __" },
        { id: 34, type: "text", text: "34. The tree only grows near the __" },
        { id: 35, type: "text", text: "35. It is very difficult to __ rubber after production." },
        { id: 36, type: "text", text: "36. New threats include lack of genetic diversity, leading to danger of disease caused by a __" },
        { id: 37, type: "text", text: "37. extreme __ events." },
        { id: 38, type: "text", text: "38. Synthetic rubber is less __ than natural rubber" },
        { id: 39, type: "text", text: "39. A wild flower (a type of dandelion) has rubber in its __" },
        { id: 40, type: "text", text: "40. It can be grown in many locations and does not require good __" }
      ]
    }
  ]
};

export const ieltsExamParts = [part1Data, part2Data, part3Data, part4Data];
