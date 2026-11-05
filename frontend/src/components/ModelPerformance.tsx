import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HiArrowsPointingOut,
  HiXMark,
  RiCpuLine,
  PhTrendUp,
} from "./icons";
import { pct } from "../lib/format";
import type { ModelMetric } from "../types";

const TOOLTIP_STYLE = {
  background: "rgba(18, 18, 22, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 8,
  color: "#ffffff",
  fontFamily: "'Google Sans', 'Plus Jakarta Sans', sans-serif",
  fontSize: 12,
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
};

const TICK = {
  fill: "#a1a1aa",
  fontSize: 11,
  fontFamily: "'Google Sans', 'Plus Jakarta Sans', sans-serif",
};

type ChartKind = "pr" | "auc";

function Confusion({ metric }: { metric: ModelMetric }) {
  return metric.confusion_matrix ? (
    <div className="confusion-mini" aria-label={`${metric.Model} confusion matrix`}>
      <span>TN <b>{metric.confusion_matrix.tn.toLocaleString()}</b></span>
      <span>FP <b>{metric.confusion_matrix.fp.toLocaleString()}</b></span>
      <span>FN <b>{metric.confusion_matrix.fn.toLocaleString()}</b></span>
      <span>TP <b>{metric.confusion_matrix.tp.toLocaleString()}</b></span>
    </div>
  ) : null;
}

function ModelCard({
  metric,
  onExpand,
}: {
  metric: ModelMetric;
  onExpand: () => void;
}) {
  return (
    <div className="model-metric-card">
      <div className="model-card-top">
        <div className="model-name-group">
          <RiCpuLine size={16} color="#a855f7" />
          <span className="model-name">{metric.Model}</span>
        </div>
        <button
          className="glass-icon-btn small"
          onClick={onExpand}
          aria-label={`Expand ${metric.Model} metrics`}
        >
          <HiArrowsPointingOut size={13} color="#a1a1aa" />
        </button>
      </div>

      <div className="model-f1-row">
        <strong className="f1-val">
          {typeof metric.F1 === "number" ? metric.F1.toFixed(3) : "—"}
        </strong>
        <small className="f1-lbl">F1 Score</small>
      </div>

      <div className="metric-bars">
        <div>
          <span>ROC-AUC</span>
          <b>{typeof metric.ROC_AUC === "number" ? metric.ROC_AUC.toFixed(4) : "—"}</b>
        </div>
        <div>
          <span>PR-AUC</span>
          <b>{typeof metric.PR_AUC === "number" ? metric.PR_AUC.toFixed(4) : "—"}</b>
        </div>
        <div>
          <span>Precision</span>
          <b>{pct(metric.Precision)}</b>
        </div>
        <div>
          <span>Recall</span>
          <b>{pct(metric.Recall)}</b>
        </div>
      </div>

      <Confusion metric={metric} />
    </div>
  );
}

function EvaluationChart({
  kind,
  metrics,
  large,
  onExpand,
}: {
  kind: ChartKind;
  metrics: ModelMetric[];
  large?: boolean;
  onExpand?: () => void;
}) {
  const precisionRecall = kind === "pr";
  const title = precisionRecall ? "Precision vs Recall Curve" : "ROC-AUC vs PR-AUC Metric";
  const height = large ? 480 : 260;

  const common = (
    <>
      <CartesianGrid stroke="rgba(255, 255, 255, 0.07)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="Model"
        tick={TICK}
        tickLine={false}
        axisLine={{ stroke: "rgba(255, 255, 255, 0.12)" }}
      />
      <YAxis
        domain={[0, 1]}
        tick={TICK}
        tickLine={false}
        axisLine={false}
        width={38}
      />
      <Tooltip
        contentStyle={TOOLTIP_STYLE}
        labelStyle={{ color: "#ffffff", fontWeight: 600, marginBottom: 4 }}
        formatter={(value: number, name: string) => [
          value.toFixed(4),
          name.replace("_", "-"),
        ]}
      />
      <Legend
        wrapperStyle={{
          fontFamily: "'Google Sans', sans-serif",
          fontSize: 11,
          paddingTop: 10,
        }}
      />
    </>
  );

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        {onExpand && (
          <button
            className="glass-icon-btn small"
            onClick={onExpand}
            aria-label={`Expand ${title}`}
          >
            <HiArrowsPointingOut size={13} color="#38bdf8" />
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {precisionRecall ? (
          <LineChart data={metrics} margin={{ top: 12, right: 14, left: 2, bottom: 4 }}>
            {common}
            <Line
              type="monotone"
              dataKey="Precision"
              stroke="#38bdf8"
              strokeWidth={2.4}
              dot={{ r: 4, fill: "#38bdf8" }}
              activeDot={{ r: 5, fill: "#ffffff" }}
            />
            <Line
              type="monotone"
              dataKey="Recall"
              stroke="#34d399"
              strokeWidth={2.4}
              dot={{ r: 4, fill: "#34d399" }}
              activeDot={{ r: 5, fill: "#ffffff" }}
            />
          </LineChart>
        ) : (
          <AreaChart data={metrics} margin={{ top: 12, right: 14, left: 2, bottom: 4 }}>
            {common}
            <Area
              type="monotone"
              dataKey="ROC_AUC"
              stroke="#a855f7"
              strokeWidth={2}
              fill="#a855f7"
              fillOpacity={0.16}
            />
            <Area
              type="monotone"
              dataKey="PR_AUC"
              stroke="#06b6d4"
              strokeWidth={1.8}
              fill="#06b6d4"
              fillOpacity={0.14}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function ModelModal({
  metric,
  onClose,
}: {
  metric: ModelMetric;
  onClose: () => void;
}) {
  return (
    <div className="station-modal-backdrop" onMouseDown={onClose}>
      <section
        className="model-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${metric.Model} metrics`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="station-modal-header">
          <div>
            <h2>{metric.Model}</h2>
            <span className="modal-subtitle">
              Cutoff Threshold {typeof metric.Threshold === "number" ? `${(metric.Threshold * 100).toFixed(2)}%` : "—"} · F1 Score {typeof metric.F1 === "number" ? metric.F1.toFixed(3) : "—"}
            </span>
          </div>
          <button
            className="glass-icon-btn close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <HiXMark size={18} color="#e4e4e7" />
          </button>
        </div>

        <div className="model-modal-body">
          <div className="model-stat-grid">
            <div>
              <span>ROC-AUC</span>
              <strong>{metric.ROC_AUC?.toFixed(4) ?? "—"}</strong>
            </div>
            <div>
              <span>PR-AUC</span>
              <strong>{metric.PR_AUC?.toFixed(4) ?? "—"}</strong>
            </div>
            <div>
              <span>Precision</span>
              <strong>{pct(metric.Precision)}</strong>
            </div>
            <div>
              <span>Recall</span>
              <strong>{pct(metric.Recall)}</strong>
            </div>
          </div>

          <h3 className="section-subheading">Confusion Matrix</h3>
          <Confusion metric={metric} />

          <h3 className="section-subheading">Feature Importance</h3>
          <div className="modal-importance">
            {metric.feature_importance?.map((item) => (
              <div className="importance-row" key={item.feature}>
                <span>{item.feature.replace(/_/g, " ")}</span>
                <i>
                  <b style={{ width: `${Math.min(100, item.importance * 100)}%` }} />
                </i>
                <strong>{item.importance.toFixed(3)}</strong>
              </div>
            )) ?? (
              <p className="empty-subtext">Feature importance values are unavailable for this estimator.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ModelPerformance({ metrics }: { metrics: ModelMetric[] }) {
  const [expandedChart, setExpandedChart] = useState<ChartKind | null>(null);
  const [expandedModel, setExpandedModel] = useState<ModelMetric | null>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedChart(null);
        setExpandedModel(null);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const chartTitle =
    expandedChart === "pr" ? "Precision vs Recall Curve" : "ROC-AUC vs PR-AUC Metric";

  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <h2>Model Evaluation</h2>
          <span className="panel-subtitle">Holdout test evaluation & benchmark comparative metrics</span>
        </div>
        <div className="glass-badge">
          <span className="badge-dot-green" />
          <span>{metrics.length} Trained Models</span>
        </div>
      </div>

      {metrics.length ? (
        <>
          <div className="model-metric-grid">
            {metrics.map((metric) => (
              <ModelCard
                metric={metric}
                key={metric.Model}
                onExpand={() => setExpandedModel(metric)}
              />
            ))}
          </div>

          <div className="importance-section">
            <div className="importance-heading">
              <div className="importance-title-row">
                <PhTrendUp size={16} color="#38bdf8" />
                <h3>Feature Importance</h3>
              </div>
              <span className="importance-sub">Top contributing predictive features</span>
            </div>
            <div className="importance-grid">
              {metrics.map((metric) => (
                <div className="importance-card" key={`${metric.Model}-importance`}>
                  <strong>{metric.Model}</strong>
                  {metric.feature_importance?.slice(0, 5).map((item) => (
                    <div className="importance-row" key={item.feature}>
                      <span>{item.feature.replace(/_/g, " ")}</span>
                      <i>
                        <b style={{ width: `${Math.min(100, item.importance * 100)}%` }} />
                      </i>
                    </div>
                  )) ?? (
                    <small className="empty-subtext">Importance unavailable for estimator.</small>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="chart-grid">
            <EvaluationChart
              kind="pr"
              metrics={metrics}
              onExpand={() => setExpandedChart("pr")}
            />
            <EvaluationChart
              kind="auc"
              metrics={metrics}
              onExpand={() => setExpandedChart("auc")}
            />
          </div>
        </>
      ) : (
        <div className="empty-state">
          Evaluation metrics unavailable.
        </div>
      )}

      {expandedChart && (
        <div className="station-modal-backdrop" onMouseDown={() => setExpandedChart(null)}>
          <section
            className="history-modal single-chart-modal"
            role="dialog"
            aria-modal="true"
            aria-label={chartTitle}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="station-modal-header">
              <div>
                <h2>{chartTitle}</h2>
                <span className="modal-subtitle">Benchmark Evaluation Comparison</span>
              </div>
              <button
                className="glass-icon-btn close-btn"
                onClick={() => setExpandedChart(null)}
                aria-label="Close chart"
              >
                <HiXMark size={18} color="#e4e4e7" />
              </button>
            </div>
            <div className="single-chart-wrap">
              <EvaluationChart kind={expandedChart} metrics={metrics} large />
            </div>
          </section>
        </div>
      )}

      {expandedModel && (
        <ModelModal metric={expandedModel} onClose={() => setExpandedModel(null)} />
      )}
    </section>
  );
}
