import { ShieldCheck } from "lucide-react";
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
import { pct } from "../lib/format";
import type { ModelMetric } from "../types";

const TOOLTIP_STYLE = {
  background: "#101827",
  border: "1px solid #283449",
  borderRadius: 10,
};

export function ModelPerformance({ metrics }: { metrics: ModelMetric[] }) {
  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">HELD-OUT TEST EVALUATION</div>
          <h2>Model performance</h2>
          <p>
            Saved results from the chronological test set; no model retraining
            is performed.
          </p>
        </div>
        <span className="live-badge">TEST METRICS</span>
      </div>
      {metrics.length ? (
        <>
          <div className="model-metric-grid">
            {metrics.map((m) => (
              <div className="model-metric-card" key={m.Model}>
                <span className="panel-kicker">{m.Model}</span>
                <strong>{typeof m.F1 === "number" ? m.F1.toFixed(3) : "—"}</strong>
                <small>F1 score</small>
                <div className="metric-bars">
                  <div>
                    <span>ROC-AUC</span>
                    <b>
                      {typeof m.ROC_AUC === "number"
                        ? m.ROC_AUC.toFixed(4)
                        : "—"}
                    </b>
                  </div>
                  <div>
                    <span>PR-AUC</span>
                    <b>
                      {typeof m.PR_AUC === "number" ? m.PR_AUC.toFixed(4) : "—"}
                    </b>
                  </div>
                  <div>
                    <span>Precision</span>
                    <b>{pct(m.Precision)}</b>
                  </div>
                  <div>
                    <span>Recall</span>
                    <b>{pct(m.Recall)}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-grid">
            <div className="chart-card">
              <h3>Precision and recall</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={metrics}>
                  <CartesianGrid stroke="#263247" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="Model"
                    tick={{ fill: "#95a3b8", fontSize: 11 }}
                  />
                  <YAxis domain={[0, 1]} tick={{ fill: "#95a3b8" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Precision"
                    stroke="#8b9cff"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="Recall"
                    stroke="#43d6ad"
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>ROC-AUC and PR-AUC</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={metrics}>
                  <CartesianGrid stroke="#263247" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="Model"
                    tick={{ fill: "#95a3b8", fontSize: 11 }}
                  />
                  <YAxis domain={[0, 1]} tick={{ fill: "#95a3b8" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ROC_AUC"
                    stroke="#a78bfa"
                    fill="#a78bfa"
                    fillOpacity={0.14}
                  />
                  <Area
                    type="monotone"
                    dataKey="PR_AUC"
                    stroke="#43d6ad"
                    fill="#43d6ad"
                    fillOpacity={0.12}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          Evaluation metrics are unavailable. Ensure
          reports/tables/final_test_evaluation.csv exists at the project root.
        </div>
      )}
      <div className="method-note">
        <ShieldCheck size={18} />
        <p>
          <strong>Evaluation integrity</strong>
          <br />
          The saved metrics use the validation-selected thresholds on the
          chronological test set. Thresholds must not be tuned using test
          labels.
        </p>
      </div>
    </section>
  );
}
