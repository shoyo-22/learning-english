import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Check,
  BookOpen,
  MessageCircle,
  PenLine,
  Mic,
  SpellCheck,
  Zap,
  SlidersHorizontal,
  Clock3,
  MessagesSquare,
  FlaskConical,
} from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { HomeStats } from "@/components/stats";
const skills = [
  {
    title: "Vocabulary",
    icon: BookOpen,
    color: "mint",
    desc: "Turn new words into everyday language.",
  },
  {
    title: "Grammar",
    icon: SpellCheck,
    color: "peach",
    desc: "Understand the rules. Find your flow.",
  },
  {
    title: "Speaking",
    icon: Mic,
    color: "lavender",
    desc: "Build confidence, one conversation at a time.",
  },
  {
    title: "Writing",
    icon: PenLine,
    color: "blue",
    desc: "Express your ideas clearly and naturally.",
  },
  {
    title: "Reading",
    icon: BookOpen,
    color: "sand",
    desc: "Read with curiosity. Understand more.",
  },
];
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="pill">
            <span className="status-dot" /> YOUR ENGLISH. A NEW POSSIBILITY.
          </div>
          <h1>
            Learn English
            <br />
            smarter with
            <br />
            <span>
              ChatGPT<span className="headline-period">.</span>
            </span>
          </h1>
          <p>
            Your curiosity meets a little AI. Explore new words, build
            confidence, and make progress—one conversation at a time.
          </p>
          <div className="button-row">
            <Link href="/learn" className="button">
              Start Learning <ArrowUpRight size={18} />
            </Link>
            <Link href="/research" className="button secondary">
              Explore Research <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span>
              <Check size={15} /> Free to explore
            </span>
            <span>
              <Check size={15} /> No account needed
            </span>
            <span>
              <Check size={15} /> A1–B2 levels
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-grid" />
          <div className="floating-label">
            <span className="mini-icon lavender">
              <MessageCircle size={17} />
            </span>
            A little feedback. A big difference.
          </div>
          <div className="conversation-card">
            <div className="conversation-header">
              <span className="brand-mark">
                <Sparkles size={20} />
              </span>
              <div>
                <strong>Your English companion</strong>
                <span>Learn by asking. Grow by doing.</span>
              </div>
              <span className="example-label">EXAMPLE</span>
            </div>
            <div className="conversation-body">
              <div className="student-label">YOU</div>
              <div className="student-bubble">I go to school yesterday.</div>
              <div className="tutor-label">
                <Sparkles size={14} /> ENGLISH LAB
              </div>
              <div className="tutor-bubble">
                <div className="corrected">
                  <span className="check-circle">
                    <Check size={14} />
                  </span>
                  I <mark>went</mark> to school yesterday.
                </div>
                <p>
                  “Yesterday” tells us this happened in the past. Use{" "}
                  <strong>went</strong>, the past form of “go”.
                </p>
                <div className="example-sentence">
                  One more example
                  <br />
                  <strong>She went to the library last week.</strong>
                </div>
              </div>
            </div>
            <Link href="/assistant" className="conversation-footer">
              Let’s try your sentence{" "}
              <span>
                <ArrowRight size={18} />
              </span>
            </Link>
          </div>
          <div className="floating-note">
            <span className="mini-icon mint">
              <Zap size={19} />
            </span>
            <div>
              <strong>Small steps. Real understanding.</strong>
              <span>Your next “aha!” moment starts here.</span>
            </div>
          </div>
          <span className="decor-star">✳</span>
        </div>
      </section>
      <HomeStats />
      <section className="container section">
        <SectionHeading
          eyebrow="FIVE SKILLS. ENDLESS POSSIBILITIES."
          title="Find your starting point."
          description="A better way to practice, whatever you want to work on."
        >
          <Link className="text-link" href="/learn">
            Explore all skills <ArrowRight size={16} />
          </Link>
        </SectionHeading>
        <div className="skill-grid">
          {skills.map(({ title, icon: Icon, color, desc }, i) => (
            <Link
              href={`/learn?skill=${title}`}
              className="skill-card"
              key={title}
            >
              <div className={`skill-icon ${color}`}>
                <Icon size={24} />
              </div>
              <span className="card-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="card-bottom">
                Let’s learn <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="why-section">
        <div className="container section">
          <SectionHeading
            eyebrow="A STUDY PARTNER THAT KEEPS UP"
            title="Less hesitation. More learning."
            description="Use AI to ask questions, try things out, and understand your mistakes."
          />
          <div className="benefits-grid">
            {[
              {
                icon: Zap,
                title: "Feedback in the moment",
                desc: "Get a correction and a simple explanation while your question is still fresh.",
              },
              {
                icon: SlidersHorizontal,
                title: "Learning at your level",
                desc: "Ask for simpler examples or a bigger challenge. Make the practice your own.",
              },
              {
                icon: Clock3,
                title: "Practice on your schedule",
                desc: "A few minutes after school or a longer weekend session. You choose.",
              },
              {
                icon: MessagesSquare,
                title: "An active conversation",
                desc: "Go beyond memorizing. Ask, respond, experiment, and try again.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <article key={title}>
                <Icon size={24} />
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="research-banner">
          <div>
            <span className="pill">
              <FlaskConical size={14} /> LEARNING MEETS RESEARCH
            </span>
            <h2>A question worth exploring.</h2>
            <p>
              How can ChatGPT support English learning? Our research connects
              hands-on practice with a transparent Before & After experiment.
            </p>
            <Link href="/research" className="button">
              See the research <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="experiment-mini">
            <div>
              <span>01</span>Before test
            </div>
            <ArrowRight />
            <div>
              <span>02</span>AI practice
            </div>
            <ArrowRight />
            <div>
              <span>03</span>After test
            </div>
            <p>Observe the difference. Understand the limitations.</p>
          </div>
        </div>
      </section>
    </>
  );
}
