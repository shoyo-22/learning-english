import { PageIntro } from "@/components/ui";
import { PracticeQuiz } from "@/components/practice-quiz";
export const metadata = { title: "Practice Your English" };
export default function Page() {
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="SMALL STEPS. STRONGER SKILLS."
        title="Let’s put your English into practice."
        description="Try a question. Understand the answer. Build your confidence with focused practice at your level."
      />
      <PracticeQuiz />
    </div>
  );
}
