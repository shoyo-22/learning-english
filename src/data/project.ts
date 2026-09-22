export const projectInfo = {
  title: "The Importance of ChatGPT in Learning English",
  author: "Muratbek Kausar",
  supervisor: "Tastanbek Diana",
  aim: "Explore how guided use of ChatGPT can support independent English learning and compare performance on a short assessment before and after practice.",
  objectives: [
    "Explore practical uses of AI across five English skills.",
    "Build an accessible platform for independent English practice.",
    "Compare paired Before and After assessment scores.",
    "Discuss the benefits, limitations, and responsible use of AI.",
  ],
  hypothesis:
    "Students may achieve higher scores on a comparable English assessment after a period of guided AI-assisted practice.",
  practicalSignificance:
    "This platform gives students concrete ways to use AI for explanations, feedback, and independent practice, while giving the research project a reproducible way to record learning activity.",
  conclusion:
    "Final conclusions will be written after data collection and analysis. Usage alone does not demonstrate learning improvement, and a Before/After comparison without a control group cannot establish that AI caused a change.",
};
export const projectPeople = [
  {
    name: projectInfo.author,
    role: "Grade 10 “A” student · Website developer",
    photo: "/people/muratbek-kausar.jpg",
  },
  {
    name: projectInfo.supervisor,
    role: "English teacher · Project supervisor",
    photo: "/people/tastanbek-diana.jpg",
  },
];
// Illustrative values only. Never seeded into the research database.
export const demoResearch = [
  { skill: "Vocabulary" as const, before: 50, after: 75 },
  { skill: "Grammar" as const, before: 45, after: 70 },
  { skill: "Speaking" as const, before: 55, after: 75 },
  { skill: "Writing" as const, before: 50, after: 70 },
];
