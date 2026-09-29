import { getTranslator } from "@/lib/i18n/server";
import { PageIntro } from "@/components/ui";
import { PracticeQuiz } from "@/components/practice-quiz";
import { ParticipantName } from "@/components/participant-name";
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
      <div className="panel participant-panel">
        <ParticipantName />
        <p className="muted">
          {tr(
            "A name is optional for practice. You can start without saving it.",
          )}
        </p>
      </div>
      <PracticeQuiz />
    </div>
  );
}
