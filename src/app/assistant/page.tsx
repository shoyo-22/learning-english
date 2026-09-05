import { getTranslator } from "@/lib/i18n/server";
import { Suspense } from "react";
import { PageIntro } from "@/components/ui";
import { AssistantChat } from "@/components/assistant-chat";
export async function generateMetadata() {
  const { tr } = await getTranslator();
  return { title: tr("AI English Assistant") };
}
export default async function Page() {
  const { tr } = await getTranslator();

  return (
    <div className="container page-content">
      <PageIntro
        eyebrow={tr("YOUR CURIOSITY HAS COMPANY")}
        title={tr("A conversation that helps you grow.")}
        description={tr(
          "Get a clearer explanation, work through a tricky sentence, or just practice your English. Start wherever you are.",
        )}
      />
      <Suspense fallback={<div className="skeleton" />}>
        <AssistantChat />
      </Suspense>
    </div>
  );
}
