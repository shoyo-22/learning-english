import { getTranslator } from "@/lib/i18n/server";
import { PageIntro } from "@/components/ui";
import { ResearchDashboard } from "@/components/research-dashboard";
export async function generateMetadata() {
  const { tr } = await getTranslator();
  return { title: tr("Research Results") };
}
export default async function Page() {
  const { tr } = await getTranslator();

  return (
    <div className="container page-content">
      <PageIntro
        eyebrow={tr("FROM CURIOSITY TO EVIDENCE")}
        title={tr("What can we learn from learning?")}
        description={tr(
          "Explore the experiment, compare Before & After scores, and see the story the data actually tells.",
        )}
      />
      <ResearchDashboard />
    </div>
  );
}
