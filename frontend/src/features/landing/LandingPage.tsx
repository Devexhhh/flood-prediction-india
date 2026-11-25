import { motion } from "motion/react";
import { useEffect } from "react";
import { warmUpApi } from "../../lib/api";
import { Activity, ArrowRight, Cpu, MapPin, SlidersHorizontal } from "lucide-react";
import {
  AnimatedGridPattern,
  AnimatedShinyText,
  BlurFade,
  BorderBeam,
  DotPattern,
  Marquee,
  NumberTicker,
  PulseDot,
  ShimmerButton,
} from "../../components/magicui";
import { Card } from "../../components/ui/card";
import { LinkButton } from "../../components/ui/button";
import { Logo } from "../../components/ui/logo";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { pageHref } from "../../hooks/useHashRoute";
import { FEATURES, MODEL_RESULTS, PIPELINE, SPLITS } from "./content";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#models", label: "Models" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#scope", label: "Scope" },
];

const STATS = [
  { value: 703, decimals: 0, suffix: "", label: "stations after quality control" },
  { value: 3.29, decimals: 2, suffix: "M", label: "station-day rows" },
  { value: 17, decimals: 0, suffix: "", label: "predictive features" },
  { value: 0.9965, decimals: 4, suffix: "", label: "best test ROC-AUC (XGBoost)" },
];

const PINS = [
  [62, 30, true], [70, 44, false], [55, 52, true], [78, 36, false],
  [66, 62, false], [84, 56, true], [58, 72, false], [74, 24, false],
] as const;

function SectionLabel({ children }: { children: string }) {
  return <p className="m-0 mb-3 text-[13px] font-medium text-accent">{children}</p>;
}

export function LandingPage() {
  // Wake the free-tier API while the visitor reads the landing page.
  useEffect(() => warmUpApi(), []);
  const dashboard = pageHref("overview");
  const best = Math.max(...MODEL_RESULTS.map((m) => m.f1));

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Logo />
          <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded-lg px-3 py-2 transition-colors hover:bg-muted hover:text-foreground">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LinkButton href={dashboard}>Open dashboard</LinkButton>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-6 pt-24 pb-20">
          <AnimatedGridPattern className="mask-radial" numSquares={16} />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <BlurFade inView={false}>
              <a
                href="#models"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-3.5 pl-3 text-[13px] transition-colors hover:border-muted-foreground"
              >
                <PulseDot className="text-risk" />
                <AnimatedShinyText className="font-medium">
                  Next-day danger-level prediction · CWC network
                </AnimatedShinyText>
                <ArrowRight size={14} className="text-muted-foreground" />
              </a>
            </BlurFade>
            <BlurFade inView={false} delay={0.08}>
              <h1 className="m-0 text-[42px] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[68px]">
                Know which rivers cross the danger line tomorrow.
              </h1>
            </BlurFade>
            <BlurFade inView={false} delay={0.16}>
              <p className="m-0 max-w-xl text-lg leading-relaxed text-muted-foreground">
                RiverWatch scores every monitored gauge in India’s Central Water Commission
                network for the chance its next-day mean water level reaches the published
                danger level — tune the alert cutoff and see the trade-off live.
              </p>
            </BlurFade>
            <BlurFade inView={false} delay={0.24} className="mt-2 flex flex-wrap justify-center gap-3">
              <ShimmerButton href={dashboard}>
                Open the dashboard <ArrowRight size={16} />
              </ShimmerButton>
              <LinkButton href="#pipeline" variant="outline" size="lg">
                Read the methodology
              </LinkButton>
            </BlurFade>
          </div>

          <BlurFade delay={0.32} className="relative mx-auto mt-20 max-w-5xl">
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-4">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col gap-1.5 px-7 py-6 ${i % 2 ? "" : "border-r"} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i < 3 ? "lg:border-r" : ""} border-border`}
                >
                  <NumberTicker
                    value={s.value}
                    decimals={s.decimals}
                    suffix={s.suffix}
                    className="text-[32px] font-medium tracking-tight"
                  />
                  <span className="text-[13px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </BlurFade>
        </section>

        {/* Feature marquee */}
        <section aria-label="Model features" className="pb-20">
          <p className="m-0 mb-5 text-center text-xs tracking-[0.12em] text-muted-foreground uppercase">
            17 engineered features per station-day
          </p>
          <Marquee duration={45}>
            {FEATURES.map((f) => (
              <span
                key={f}
                className="rounded-full border border-border bg-card px-3.5 py-2 font-mono text-[13px] whitespace-nowrap text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Bento */}
        <section id="features" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <BlurFade className="mb-10 max-w-xl">
              <SectionLabel>Features</SectionLabel>
              <h2 className="m-0 text-4xl leading-tight font-semibold tracking-[-0.035em]">
                One quiet surface for a noisy river network.
              </h2>
            </BlurFade>

            <div className="grid gap-4 md:grid-cols-3">
              <BlurFade className="md:col-span-2">
                <Card className="group h-full min-h-[300px] overflow-hidden p-7 transition-transform duration-300 hover:-translate-y-1">
                  <BorderBeam duration={7} />
                  <DotPattern className="[mask-image:radial-gradient(circle_at_70%_40%,#000,transparent_70%)]" />
                  <div aria-hidden="true" className="absolute inset-0">
                    {PINS.map(([x, y, alert], i) => (
                      <span key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                        <PulseDot ping={alert} className={alert ? "size-2.5 text-risk" : "size-2.5 text-muted-foreground"} />
                      </span>
                    ))}
                  </div>
                  <div className="relative flex h-full flex-col justify-between gap-10">
                    <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <MapPin size={16} strokeWidth={1.8} /> Live station map
                    </span>
                    <div className="max-w-sm">
                      <h3 className="m-0 mb-2 text-xl font-semibold tracking-tight">Every gauge, ranked by tomorrow’s risk</h3>
                      <p className="m-0 text-sm leading-relaxed text-muted-foreground">
                        Stations above the cutoff pulse orange. Map tiles follow the theme, so it
                        reads in a dark control room or on a bright laptop.
                      </p>
                    </div>
                  </div>
                </Card>
              </BlurFade>

              <BlurFade delay={0.08}>
                <Card className="flex h-full min-h-[300px] flex-col justify-between p-7 transition-transform duration-300 hover:-translate-y-1">
                  <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <SlidersHorizontal size={16} strokeWidth={1.8} /> Threshold tuning
                  </span>
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] text-muted-foreground">Alert cutoff</span>
                      <span className="font-mono text-[28px] tracking-tight">90.4%</span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-muted">
                      <motion.div
                        className="h-full origin-left rounded-full bg-foreground"
                        style={{ width: "90.4%" }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
                      />
                    </div>
                    <p className="m-0 text-sm leading-relaxed text-muted-foreground">
                      Slide the decision boundary and watch alerts, misses and false alarms move together.
                    </p>
                  </div>
                </Card>
              </BlurFade>

              <BlurFade>
                <Card id="models" className="flex h-full min-h-[300px] scroll-mt-24 flex-col gap-5 p-7 transition-transform duration-300 hover:-translate-y-1">
                  <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Cpu size={16} strokeWidth={1.8} /> Three models, one test set · F1
                  </span>
                  {MODEL_RESULTS.map((m) => (
                    <div key={m.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[13px]">
                        <span>{m.name}</span>
                        <span className="font-mono text-muted-foreground">{m.f1.toFixed(4)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <motion.div
                          className={`h-full origin-left rounded-full ${m.f1 === best ? "bg-foreground" : "bg-muted-foreground"}`}
                          style={{ width: `${m.f1 * 100}%` }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="m-0 mt-auto text-sm leading-relaxed text-muted-foreground">
                    Random Forest leads on F1; XGBoost on ROC-AUC and PR-AUC.
                  </p>
                </Card>
              </BlurFade>

              <BlurFade delay={0.08} className="md:col-span-2">
                <Card className="flex h-full min-h-[300px] flex-col justify-between gap-6 overflow-hidden p-7 transition-transform duration-300 hover:-translate-y-1">
                  <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Activity size={16} strokeWidth={1.8} /> Station history
                  </span>
                  <svg viewBox="0 0 640 140" preserveAspectRatio="none" role="img" aria-label="Illustration: water level rising toward a station's danger line" className="h-36 w-full overflow-visible">
                    <line x1="0" y1="34" x2="640" y2="34" stroke="var(--risk)" strokeWidth="1.2" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
                    <text x="636" y="24" textAnchor="end" fontSize="11" fill="var(--risk)" fontFamily="Geist Mono, monospace">danger level</text>
                    <motion.path
                      d="M0 110 C 60 100, 100 118, 160 96 S 260 104, 320 84 S 420 70, 480 52 S 580 40, 640 34"
                      fill="none"
                      stroke="var(--foreground)"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.8, ease: [0.2, 0.7, 0.2, 1] }}
                    />
                  </svg>
                  <p className="m-0 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Water level, daily rainfall and the station’s warning and danger levels on one
                    chart — for any selected gauge.
                  </p>
                </Card>
              </BlurFade>
            </div>
          </div>
        </section>

        {/* Pipeline */}
        <section id="pipeline" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2">
            <BlurFade className="flex flex-col gap-4">
              <SectionLabel>Pipeline</SectionLabel>
              <h2 className="m-0 text-4xl leading-tight font-semibold tracking-[-0.035em]">
                Split by time, not at random.
              </h2>
              <p className="m-0 text-base leading-relaxed text-muted-foreground">
                Models train on history through 2022, pick thresholds on 2023–2024, and are scored
                once on 2025 to 10 Sep 2026 — closer to how a forecast meets the future.
              </p>
              <Card className="mt-2 overflow-hidden">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Split</th>
                      <th className="px-4 py-3 font-medium">Period</th>
                      <th className="px-4 py-3 text-right font-medium">Rows</th>
                      <th className="px-4 py-3 text-right font-medium">Positives</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {SPLITS.map((s) => (
                      <tr key={s.split} className="border-t border-border">
                        <td className="px-4 py-3 font-sans">{s.split}</td>
                        <td className="px-4 py-3">{s.period}</td>
                        <td className="px-4 py-3 text-right">{s.rows.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right">{s.positives.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </BlurFade>

            <ol className="m-0 flex list-none flex-col p-0">
              {PIPELINE.map((step, i) => (
                <BlurFade key={step.title} delay={i * 0.06}>
                  <li className="grid grid-cols-[40px_1fr] gap-4 pb-7">
                    <span className="grid size-10 place-items-center rounded-xl border border-border bg-card font-mono text-[13px] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="pt-2">
                      <h3 className="m-0 mb-1.5 text-base font-semibold tracking-tight">{step.title}</h3>
                      <p className="m-0 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                </BlurFade>
              ))}
            </ol>
          </div>
        </section>

        {/* Scope */}
        <section id="scope" className="scroll-mt-20 px-6 pt-12 pb-24">
          <BlurFade className="mx-auto max-w-6xl">
            <Card className="flex flex-wrap items-center justify-between gap-8 rounded-[20px] p-8 sm:p-12">
              <BorderBeam duration={8} />
              <div className="flex max-w-2xl flex-col gap-3">
                <h2 className="m-0 text-3xl font-semibold tracking-[-0.03em]">
                  A risk signal, not an inundation forecast.
                </h2>
                <p className="m-0 text-[15px] leading-relaxed text-muted-foreground">
                  Predictions cover monitored stations with enough history. They don’t map flood
                  extent, affected people, or risk at arbitrary locations, and haven’t been
                  validated on unseen stations.
                </p>
              </div>
              <ShimmerButton href={pageHref("stations")}>
                Explore stations <ArrowRight size={16} />
              </ShimmerButton>
            </Card>
          </BlurFade>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-6 py-7 text-[13px] text-muted-foreground">
          <span>RiverWatch · Data: Central Water Commission, India</span>
          <span className="font-mono">Test window ends 2026-09-10</span>
        </div>
      </footer>
    </div>
  );
}
