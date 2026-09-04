import { Suspense } from "react";
import { PageIntro } from "@/components/ui";
import { AssistantChat } from "@/components/assistant-chat";
export const metadata = { title: "AI English Assistant" };
export default function Page() {
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="YOUR CURIOSITY HAS COMPANY"
        title="A conversation that helps you grow."
        description="Get a clearer explanation, work through a tricky sentence, or just practice your English. Start wherever you are."
      />
      <Suspense fallback={<div className="skeleton" />}>
        <AssistantChat />
      </Suspense>
    </div>
  );
}
