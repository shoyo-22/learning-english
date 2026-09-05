import { getTranslator } from "@/lib/i18n/server";
import { PageIntro } from "@/components/ui";
import { projectInfo as p } from "@/data/project";
import { FlaskConical, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
export async function generateMetadata() {
  const { tr } = await getTranslator();
  return { title: tr("About the Research Project") };
}
export default async function Page() {
  const { tr } = await getTranslator();

  return (
    <div className="container page-content">
      <PageIntro
        eyebrow={tr("CURIOSITY, WITH A PURPOSE")}
        title={tr("A school project. A real question.")}
        description={tr(
          "Exploring the possibilities of AI-assisted English learning through practice, observation, and honest research.",
        )}
      />
      <div className="about-layout">
        <article className="panel about-main">
          <div className="skill-icon mint">
            <FlaskConical size={24} />
          </div>
          <p className="eyebrow">{tr("RESEARCH TOPIC")}</p>
          <h2>{tr(p.title)}</h2>
          {[
            ["Aim of the Research", p.aim],
            ["Hypothesis", p.hypothesis],
          ].map(([t, c]) => (
            <section key={t}>
              <h3>{tr(t)}</h3>
              <p>{tr(c)}</p>
            </section>
          ))}
          <section>
            <h3>{tr("Research objectives")}</h3>
            <ol className="steps-list">
              {p.objectives.map((s, i) => (
                <li key={s}>
                  <span>0{i + 1}</span>
                  {tr(s)}
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h3>{tr("Practical significance")}</h3>
            <p>{tr(p.practicalSignificance)}</p>
          </section>
          <section>
            <h3>{tr("Conclusion · awaiting final results")}</h3>
            <p>{tr(p.conclusion)}</p>
          </section>
        </article>
        <aside>
          <div className="panel project-people">
            <p className="eyebrow">{tr("BEHIND THE PROJECT")}</p>
            <label>{tr("Student researcher")}</label>
            <strong>{tr(p.author)}</strong>
            <label>{tr("Research supervisor")}</label>
            <strong>{tr(p.supervisor)}</strong>
            <span className="tag">{tr("Project details to be finalized")}</span>
          </div>
          <div className="panel privacy-card" id="privacy">
            <ShieldCheck size={25} />
            <h3>{tr("Learning with care")}</h3>
            <p>
              {tr(
                "We use an anonymous browser identifier to associate practice and assessment results. We do not ask for your name, email, location, or a student account.",
              )}
            </p>
            <p>
              {tr(
                "Practice answers are scored; the database stores answer correctness and scores. The assistant uses prepared demo responses. Messages are processed by this application, are not sent to OpenAI, and are not saved in the research database. Demo replies are excluded from real AI usage.",
              )}
            </p>
            <p>
              {tr(
                "Browser identifiers are not verified people. Clearing cookies or changing browsers creates a new identifier. Activity is stored when the research database is connected. You can explore educational content without participating in the assessment.",
              )}
            </p>
            <p>
              {tr(
                "AI can be wrong. Use it as a study aid alongside teachers and trusted learning materials.",
              )}
            </p>
            <Link href="/research" className="text-link">
              {tr("Read the methodology")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
