import { Suspense } from "react";
import { PageIntro } from "@/components/ui";
import { LearningTabs } from "@/components/learning-tabs";
export const metadata = { title: "Learn with ChatGPT" };
export default function Page() {
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="YOUR LEARNING TOOLKIT"
        title="A new way to learn English."
        description="Five skills. Simple methods. Discover how to make AI a useful part of your learning routine."
      />
      <Suspense fallback={<div className="skeleton" />}>
        <LearningTabs />
      </Suspense>
    </div>
  );
}
