import { questions } from '@/data/questions';
import { normalizeAnswer } from './scoring';
import { speakingTopics } from '@/data/speaking';
type Message = { role: 'user' | 'assistant'; content: string };
const speakingIntro = 'Speaking practice — prepared questions';
export function demoTutor(messages: Message[]): string {
  const input = messages.at(-1)!.content.trim();
  const lower = input.toLowerCase();
  const sentence = normalizeAnswer(input.replace(/^(correct my (sentence|english)|check my paragraph|rewrite correctly)\s*:\s*/i, '').replace(/^[“"‘]|[”"’]$/g, ''));
  const match = questions.find(q => q.category === 'Correct the Mistake' && normalizeAnswer(q.question.replace(/^Rewrite correctly:\s*/,'')).replace(/[‘’]/g,"'") === sentence);
  if (match) return `Corrected sentence:\n${match.answer}\n\nExplanation:\n${match.explanation}\n\nThis is a prepared correction for this specific example. Try making another sentence using the same rule.`;
  if (sentence === 'i go to school yesterday') return 'Corrected sentence:\nI went to school yesterday.\n\nExplanation:\n“Yesterday” refers to a finished action in the past. Use “went”, the past form of “go”.\n\nAnother example:\nShe went to the library last week.';
  if (/present perfect/.test(lower)) return 'Present Perfect — a prepared mini-lesson\n\nUse have/has + past participle to connect a past experience or action to the present.\n\nI have visited London. (An experience; no finished time is stated.)\nShe has finished her homework. (It is finished now.)\nWe have lived here for two years. (We still live here.)\n\nWith a finished time such as “yesterday”, use Past Simple: “I visited London yesterday.”\n\nTry this: I ___ never eaten sushi. (have / has)';
  if (messages.at(-2)?.content.includes('I ___ never eaten sushi') && /^(have|has)[.!]?$/i.test(input)) return lower.startsWith('have') ? 'Correct! “I have never eaten sushi.” Use “have” with I, you, we, and they. Use “has” with he, she, and it.' : 'Try again: “I have never eaten sushi.” Use “have” with “I”.';
  if (/words|vocabulary/.test(lower)) {
    if (/technology/.test(lower)) return 'Five technology words — prepared examples\n\n1. Device — a piece of equipment. “My tablet is a useful device.”\n2. Reliable — able to be trusted. “We need a reliable internet connection.”\n3. Privacy — control over personal information. “Protect your privacy online.”\n4. Download — copy a file from the internet. “I downloaded an English lesson.”\n5. Improve — make something better. “Practice can improve your skills.”\n\nWrite a sentence using “reliable”. This demo cannot evaluate arbitrary sentences.';
    if (/travel/.test(lower)) return 'Travel vocabulary — prepared examples\n\nJourney — travelling from one place to another. “The journey took two hours.”\nDestination — the place you are travelling to. “Our destination is London.”\nLuggage — bags you take when travelling. “Keep your luggage with you.”\nDeparture — the act of leaving. “Our departure is at nine.”\nExplore — learn about a place by visiting it. “We explored the old town.”\n\nTry using two words in a sentence. Ask a teacher to check your answer.';
    return 'Vocabulary demo\n\nTry “Give me five B1 words about technology” or “Give me words about travelling”. This demo has prepared vocabulary lists for those topics only.';
  }
  const previous = messages.filter(m=>m.role==='assistant').at(-1)?.content;
  if (/speaking|conversation|talk to me|friend|hobbies/.test(lower) || previous?.startsWith(speakingIntro)) {
    const topic = speakingTopics.find(t => lower.includes(t.name.toLowerCase())) || speakingTopics.find(t=>messages.some(m=>m.content.includes(`${speakingIntro}: ${t.name}`))) || speakingTopics[2];
    const index = previous?.startsWith(speakingIntro) ? messages.filter(m=>m.role==='assistant'&&m.content.startsWith(`${speakingIntro}: ${topic.name}`)).length % topic.questions.length : 0;
    return `${speakingIntro}: ${topic.name}\n\n${topic.questions[index]}\n\nAnswer aloud, then type a sentence to move to the next question. Try giving a reason and an example. This demo does not judge your answer or pronunciation.`;
  }
  if (/paragraph|writing|email|correct|mistake|sentence/.test(lower)) return 'Writing and correction demo\n\nI can show prepared corrections, but cannot reliably review arbitrary writing. Try one of these exact examples:\n\n“I go to school yesterday.”\n“She like music.”\n“He didn’t went home.”\n“I look forward to hear from you.”\n\nFor your own paragraph, check verb tense, subject–verb agreement, and punctuation, then ask a teacher for feedback. I have not assessed your paragraph.';
  return 'This is a scripted learning demo, not a live AI model. I cannot answer every request.\n\nTry one of these activities:\n• Correct my sentence: I go to school yesterday.\n• Explain Present Perfect simply.\n• Give me five B1 words about technology.\n• Ask me an English speaking question.\n\nFor other topics, explore Learn, Practice, or the prompt library.';
}
