import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function NotFound() {
  return (
    <div className="container section">
      <p className="eyebrow">LET’S FIND YOUR WAY BACK</p>
      <h1 style={{ fontSize: 40, marginBottom: 20 }}>
        This page isn’t in the lesson plan.
      </h1>
      <p className="muted" style={{ marginBottom: 25 }}>
        Choose a learning activity and pick up from there.
      </p>
      <Link className="button" href="/learn">
        Explore learning <ArrowRight size={17} />
      </Link>
    </div>
  );
}
