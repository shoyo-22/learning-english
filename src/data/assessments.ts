import type { AssessmentType, Question, Skill } from "@/lib/types";
type AssessmentRow = [Skill, string, string[], string];
const forms: Record<AssessmentType, AssessmentRow[]> = {
  before: [
    [
      "Vocabulary",
      "Which word means “not expensive”?",
      ["affordable", "reliable", "crowded", "distant"],
      "affordable",
    ],
    [
      "Vocabulary",
      "Choose the best word: Please ___ the instructions carefully.",
      ["read", "say", "watch", "hear"],
      "read",
    ],
    [
      "Grammar",
      "She ___ breakfast when the phone rang.",
      ["has", "was having", "have", "is having"],
      "was having",
    ],
    [
      "Grammar",
      "I have been here ___ Monday.",
      ["for", "since", "during", "until"],
      "since",
    ],
    [
      "Speaking",
      "You did not hear a question. What is an appropriate response?",
      [
        "Could you repeat that, please?",
        "You are wrong.",
        "I agree.",
        "You must leave.",
      ],
      "Could you repeat that, please?",
    ],
    [
      "Speaking",
      "Choose a natural way to ask for someone’s opinion.",
      [
        "What do you think about it?",
        "Where you opinion?",
        "Why you are opinion?",
        "You opinion now.",
      ],
      "What do you think about it?",
    ],
    [
      "Writing",
      "Choose the correctly punctuated sentence.",
      [
        "However, the results were different.",
        "However the, results were different.",
        "However the results, were different.",
        "However. the results were different.",
      ],
      "However, the results were different.",
    ],
    [
      "Writing",
      "Choose the clearest opening for a formal email.",
      [
        "Dear Ms Smith, I am writing to ask about the course.",
        "Hey!!! Tell me stuff.",
        "Course? Now!",
        "Dear Ms Smith I writing ask course.",
      ],
      "Dear Ms Smith, I am writing to ask about the course.",
    ],
  ],
  after: [
    [
      "Vocabulary",
      "Which word means “very important”?",
      ["essential", "temporary", "distant", "ordinary"],
      "essential",
    ],
    [
      "Vocabulary",
      "Choose the best word: Please ___ attention to the explanation.",
      ["pay", "make", "do", "take"],
      "pay",
    ],
    [
      "Grammar",
      "They ___ dinner when the lights went out.",
      ["have", "were having", "are having", "has"],
      "were having",
    ],
    [
      "Grammar",
      "We have lived here ___ September.",
      ["for", "during", "since", "until"],
      "since",
    ],
    [
      "Speaking",
      "Someone speaks too quickly. What is an appropriate response?",
      [
        "Could you speak more slowly, please?",
        "Stop forever.",
        "I disagree.",
        "That is my opinion.",
      ],
      "Could you speak more slowly, please?",
    ],
    [
      "Speaking",
      "Choose a natural way to invite someone’s view.",
      [
        "How do you feel about this idea?",
        "What you idea is?",
        "You must idea.",
        "Where opinion goes?",
      ],
      "How do you feel about this idea?",
    ],
    [
      "Writing",
      "Choose the correctly punctuated sentence.",
      [
        "Therefore, we need more information.",
        "Therefore we, need more information.",
        "Therefore we need, more information.",
        "Therefore. we need more information.",
      ],
      "Therefore, we need more information.",
    ],
    [
      "Writing",
      "Choose the clearest opening for a formal email.",
      [
        "Dear Mr Brown, I am writing to enquire about the workshop.",
        "Hi!!! Give workshop.",
        "Workshop now please!!!",
        "Dear Mr Brown I writing workshop enquire.",
      ],
      "Dear Mr Brown, I am writing to enquire about the workshop.",
    ],
  ],
};
export function assessmentQuestions(type: AssessmentType): Question[] {
  return forms[type].map(([skill, question, options, answer], i) => ({
    id: `${type}-v1-${i + 1}`,
    level: "B1",
    category: "Choose the Correct Answer",
    skill,
    question,
    options: (() => {
      const choices = options.filter((o) => o !== answer);
      choices.splice((i * 3 + 2) % 4, 0, answer);
      return choices;
    })(),
    answer,
    explanation: "Assessment feedback is withheld to protect the comparison.",
  }));
}
export const assessmentVersion = "v1";
