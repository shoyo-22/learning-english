import { PageIntro } from "@/components/ui";
import { ResearchDashboard } from "@/components/research-dashboard";
export const metadata = { title: "Research Results" };
export default function Page() {
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="FROM CURIOSITY TO EVIDENCE"
        title="What can we learn from learning?"
        description="Explore the experiment, compare Before & After scores, and see the story the data actually tells."
      />
      <ResearchDashboard />
    </div>
  );
}
