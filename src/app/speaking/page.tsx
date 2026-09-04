import { PageIntro } from "@/components/ui";
import { SpeakingPractice } from "@/components/speaking-practice";
export const metadata = { title: "Speaking Practice" };
export default function Page() {
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="LET’S GET TALKING"
        title="Your voice. A little more confident."
        description="Choose a topic, take a breath, and say your answer aloud. You don’t need perfect English to start."
      />
      <SpeakingPractice />
    </div>
  );
}
