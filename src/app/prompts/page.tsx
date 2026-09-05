import { getTranslator } from "@/lib/i18n/server";
import { PageIntro, Notice } from "@/components/ui";
import { PromptLibrary } from "@/components/prompt-library";
export async function generateMetadata() {
  const { tr } = await getTranslator();
  return { title: tr("Useful ChatGPT Prompts") };
}
export default async function Page() {
  const { tr } = await getTranslator();

  return (
    <div className="container page-content">
      <PageIntro
        eyebrow={tr("BETTER QUESTIONS. BETTER PRACTICE.")}
        title={tr("A little inspiration goes a long way.")}
        description={tr(
          "Copy a prompt, make it your own, and start a conversation that helps you learn.",
        )}
      />
      <PromptLibrary />
      <Notice>
        {tr(
          "Replace text in [brackets] with your own work. Keep personal information out of your prompts, and check important corrections with your teacher.",
        )}
      </Notice>
    </div>
  );
}
