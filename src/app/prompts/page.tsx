import { PageIntro, Notice } from "@/components/ui";
import { PromptLibrary } from "@/components/prompt-library";
export const metadata = { title: "Useful ChatGPT Prompts" };
export default function Page() {
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="BETTER QUESTIONS. BETTER PRACTICE."
        title="A little inspiration goes a long way."
        description="Copy a prompt, make it your own, and start a conversation that helps you learn."
      />
      <PromptLibrary />
      <Notice>
        Replace text in [brackets] with your own work. Keep personal information
        out of your prompts, and check important corrections with your teacher.
      </Notice>
    </div>
  );
}
