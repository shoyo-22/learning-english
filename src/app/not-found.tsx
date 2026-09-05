import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default async function NotFound() {
  const { tr } = await getTranslator();

  return (
    <div className="container section">
      <p className="eyebrow">{tr("LET’S FIND YOUR WAY BACK")}</p>
      <h1 style={{ fontSize: 40, marginBottom: 20 }}>
        {tr("This page isn’t in the lesson plan.")}
      </h1>
      <p className="muted" style={{ marginBottom: 25 }}>
        {tr("Choose a learning activity and pick up from there.")}
      </p>
      <Link className="button" href="/learn">
        {tr("Explore learning")}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
