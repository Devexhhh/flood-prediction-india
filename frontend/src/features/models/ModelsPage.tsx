import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "../../app/providers/ThemeProvider";
import { BlurFade, BorderBeam } from "../../components/magicui";
import { Card, CardHeader } from "../../components/ui/card";
import { pct } from "../../lib/format";
import { DEFAULT_THRESHOLDS, formatThresholdPct } from "../../lib/threshold";
import { cn } from "../../lib/utils";
import { MODELS, type ModelMetric, type ModelName } from "../../types";

function confusion(m: ModelMetric) {
  if (m.confusion_matrix) return m.confusion_matrix;
  if (
    [m.True_Negatives, m.False_Positives, m.False_Negatives, m.True_Positives].every(
      (v) => typeof v === "number",
    )
  ) {
    return { tn: m.True_Negatives!, fp: m.False_Positives!, fn: m.False_Negatives!, tp: m.True_Positives! };
  }
  return null;
}

const num = (v: number | undefined, d = 4) => (typeof v === "number" ? v.toFixed(d) : "—");

function MetricBar({ label, value, display }: { label: string; value?: number; display: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-2 text-xs whitespace-nowrap text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground">{display}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${(value ?? 0) * 100}%` }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

export function ModelsPage({
  metrics,
  model,
  onModelChange,
}: {
  metrics: ModelMetric[];
  model: ModelName;
  onModelChange: (m: ModelName) => void;
}) {
  const c = useChartColors();

  if (!metrics.length) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        Model metrics aren’t available yet. Run the evaluation notebook to generate them.
      </Card>
    );
  }

  const bestF1 = Math.max(...metrics.map((m) => m.F1 ?? 0));
  const bestAuc = Math.max(...metrics.map((m) => m.PR_AUC ?? 0));
  const bestRecall = Math.max(...metrics.map((m) => m.Recall ?? 0));
  const active = metrics.find((m) => m.Model === model) ?? metrics[0];
  const cm = confusion(active);
  const importance = (active.feature_importance ?? []).slice(0, 8);
  const maxImp = Math.max(...importance.map((i) => i.importance), 0.0001);

  const chartData = metrics.map((m) => ({
    model: m.Model === "Logistic Regression" ? "Logistic" : m.Model,
    Precision: m.Precision ?? 0,
    Recall: m.Recall ?? 0,
    F1: m.F1 ?? 0,
  }));

  const tick = { fill: c.muted, fontSize: 11, fontFamily: "Geist, sans-serif" };

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((m, i) => {
          const name = m.Model as ModelName;
          const isActive = m.Model === active.Model;
          const tag =
            m.F1 === bestF1 ? "Best F1" : m.PR_AUC === bestAuc ? "Best PR-AUC" : m.Recall === bestRecall ? "Best recall" : null;
          const thr = m.Threshold ?? (MODELS.includes(name) ? DEFAULT_THRESHOLDS[name] : undefined);
          return (
            <BlurFade key={m.Model} inView={false} delay={i * 0.06}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => MODELS.includes(name) && onModelChange(name)}
                className={cn(
                  "relative flex h-full w-full cursor-pointer flex-col gap-4 rounded-2xl border bg-card p-5 text-left transition-colors",
                  isActive ? "border-foreground" : "border-border hover:border-muted-foreground",
                )}
              >
                {isActive && <BorderBeam />}
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="min-w-0 text-[15px] font-semibold">{m.Model}</span>
                  {tag && (
                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] whitespace-nowrap text-muted-foreground">{tag}</span>
                  )}
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[36px] leading-none tracking-[-0.04em]">{num(m.F1)}</span>
                  <span className="text-[13px] whitespace-nowrap text-muted-foreground">F1 score</span>
                </span>
                <span className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <MetricBar label="ROC-AUC" value={m.ROC_AUC} display={num(m.ROC_AUC)} />
                  <MetricBar label="PR-AUC" value={m.PR_AUC} display={num(m.PR_AUC)} />
                  <MetricBar label="Precision" value={m.Precision} display={pct(m.Precision)} />
                  <MetricBar label="Recall" value={m.Recall} display={pct(m.Recall)} />
                </span>
                {typeof thr === "number" && (
                  <span className="font-mono text-xs text-muted-foreground">Validated cutoff {formatThresholdPct(thr)}</span>
                )}
              </button>
            </BlurFade>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={`Confusion matrix · ${active.Model}`} subtitle="Test station-days at the validated cutoff" />
          {cm ? (
            <div className="grid grid-cols-2 gap-2 p-5">
              {[
                { label: "True negatives", value: cm.tn, hint: "Correctly quiet", bad: false },
                { label: "False positives", value: cm.fp, hint: "False alarms", bad: true },
                { label: "False negatives", value: cm.fn, hint: "Missed exceedances", bad: true },
                { label: "True positives", value: cm.tp, hint: "Caught exceedances", bad: false },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl border p-3.5",
                    cell.bad ? "border-transparent bg-risk-soft" : "border-border bg-muted",
                  )}
                >
                  <span className="text-xs text-muted-foreground">{cell.label}</span>
                  <span className="font-mono text-2xl tracking-tight">{cell.value.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-muted-foreground">{cell.hint}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="m-0 p-8 text-center text-sm text-muted-foreground">No confusion matrix reported.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Precision, recall and F1" subtitle="Higher is better" />
          <div className="px-2 pt-4 pb-3">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="model" tick={tick} tickLine={false} axisLine={{ stroke: c.border }} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={40} domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip
                  cursor={{ fill: c.border, opacity: 0.35 }}
                  contentStyle={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, color: c.foreground, fontSize: 12 }}
                  formatter={(v: number) => pct(v)}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: c.muted }} />
                <Bar dataKey="Precision" fill={c.muted} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Recall" fill={c.accent} radius={[3, 3, 0, 0]} />
                <Bar dataKey="F1" fill={c.foreground} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {importance.length > 0 && (
        <Card>
          <CardHeader title={`Feature importance · ${active.Model}`} subtitle="Describes model behaviour, not causation" />
          <ul className="m-0 grid list-none gap-x-8 gap-y-3 p-5 md:grid-cols-2">
            {importance.map((f) => (
              <li key={f.feature} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="font-mono">{f.feature}</span>
                  <span className="font-mono text-muted-foreground">{(f.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-foreground"
                    initial={{ width: 0 }}
                    animate={{ width: `${(f.importance / maxImp) * 100}%` }}
                    transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
