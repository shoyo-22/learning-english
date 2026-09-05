import { getTranslator } from "@/lib/i18n/server";
import { PageIntro } from "@/components/ui";
import { PracticeQuiz } from "@/components/practice-quiz";
export async function generateMetadata() {
  const { tr } = await getTranslator();
  return { title: tr("Practice Your English") };
}
export default async function Page() {
  const { tr } = await getTranslator();

  return (
    <div className="container page-content">
      <PageIntro
        eyebrow={tr("SMALL STEPS. STRONGER SKILLS.")}
        title={tr("Let’s put your English into practice.")}
        description={tr(
          "Try a question. Understand the answer. Build your confidence with focused practice at your level.",
        )}
      />
      <PracticeQuiz />
    </div>
  );
}
