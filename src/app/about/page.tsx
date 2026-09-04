import { PageIntro } from "@/components/ui";
import { projectInfo as p } from "@/data/project";
import { FlaskConical, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
export const metadata = { title: "About the Research Project" };
export default function Page() {
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="CURIOSITY, WITH A PURPOSE"
        title="A school project. A real question."
        description="Exploring the possibilities of AI-assisted English learning through practice, observation, and honest research."
      />
      <div className="about-layout">
        <article className="panel about-main">
          <div className="skill-icon mint">
            <FlaskConical size={24} />
          </div>
          <p className="eyebrow">RESEARCH TOPIC</p>
          <h2>{p.title}</h2>
          {[
            ["Aim of the Research", p.aim],
            ["Hypothesis", p.hypothesis],
          ].map(([t, c]) => (
            <section key={t}>
              <h3>{t}</h3>
              <p>{c}</p>
            </section>
          ))}
          <section>
            <h3>Research objectives</h3>
            <ol className="steps-list">
              {p.objectives.map((s, i) => (
                <li key={s}>
                  <span>0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h3>Practical significance</h3>
            <p>{p.practicalSignificance}</p>
          </section>
          <section>
            <h3>Conclusion · awaiting final results</h3>
            <p>{p.conclusion}</p>
          </section>
        </article>
        <aside>
          <div className="panel project-people">
            <p className="eyebrow">BEHIND THE PROJECT</p>
            <label>Student researcher</label>
            <strong>{p.author}</strong>
            <label>Research supervisor</label>
            <strong>{p.supervisor}</strong>
            <span className="tag">Project details to be finalized</span>
          </div>
          <div className="panel privacy-card" id="privacy">
            <ShieldCheck size={25} />
            <h3>Learning with care</h3>
            <p>
              We use an anonymous browser identifier to associate practice and
              assessment results. We do not ask for your name, email, location,
              or a student account.
            </p>
            <p>
              Practice answers are scored; the database stores answer
              correctness and scores. The assistant uses prepared demo
              responses. Messages are processed by this application, are not
              sent to OpenAI, and are not saved in the research database. Demo
              replies are excluded from real AI usage.
            </p>
            <p>
              Browser identifiers are not verified people. Clearing cookies or
              changing browsers creates a new identifier. Activity is stored
              when the research database is connected. You can explore
              educational content without participating in the assessment.
            </p>
            <p>
              AI can be wrong. Use it as a study aid alongside teachers and
              trusted learning materials.
            </p>
            <Link href="/research" className="text-link">
              Read the methodology <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
