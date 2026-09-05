import { getTranslator } from "@/lib/i18n/server";
import { PageIntro } from "@/components/ui";
import { SpeakingPractice } from "@/components/speaking-practice";
export async function generateMetadata() {
  const { tr } = await getTranslator();
  return { title: tr("Speaking Practice") };
}
export default async function Page() {
  const { tr } = await getTranslator();

  return (
    <div className="container page-content">
      <PageIntro
        eyebrow={tr("LET’S GET TALKING")}
        title={tr("Your voice. A little more confident.")}
        description={tr(
          "Choose a topic, take a breath, and say your answer aloud. You don’t need perfect English to start.",
        )}
      />
      <SpeakingPractice />
    </div>
  );
}
