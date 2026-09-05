import { getTranslator } from "@/lib/i18n/server";
import { Suspense } from "react";
import { PageIntro } from "@/components/ui";
import { LearningTabs } from "@/components/learning-tabs";
export async function generateMetadata() {
  const { tr } = await getTranslator();
  return { title: tr("Learn with ChatGPT") };
}
export default async function Page() {
  const { tr } = await getTranslator();

  return (
    <div className="container page-content">
      <PageIntro
        eyebrow={tr("YOUR LEARNING TOOLKIT")}
        title={tr("A new way to learn English.")}
        description={tr(
          "Five skills. Simple methods. Discover how to make AI a useful part of your learning routine.",
        )}
      />
      <Suspense fallback={<div className="skeleton" />}>
        <LearningTabs />
      </Suspense>
    </div>
  );
}
