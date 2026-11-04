import { MODELS, type AppPage, type ModelName } from "../types";
import { ThresholdSlider } from "./ThresholdSlider";

const PAGE_COPY: Record<AppPage, { title: string }> = {
  overview: { title: "National overview" },
  stations: { title: "Station explorer" },
  models: { title: "Model performance" },
};

export function PageHeading({
  activePage,
  model,
  onModelChange,
  threshold,
  onThresholdChange,
}: {
  activePage: AppPage;
  model: ModelName;
  onModelChange: (model: ModelName) => void;
  threshold: number;
  onThresholdChange: (value: number) => void;
}) {
  return (
    <section className="page-heading">
      <div>
        <div className="eyebrow">
          <span className="eyebrow-dot" /> HYDROLOGICAL INTELLIGENCE{" "}
          <span className="eyebrow-divider">/</span> INDIA
        </div>
        <h1>{PAGE_COPY[activePage].title}</h1>
        <p>
          Monitor river stations and assess next-day danger-level exceedance
          risk.
        </p>
      </div>
      <div className="heading-controls">
        <div className="heading-control">
          <label className="control-label" htmlFor="prediction-model">
            PREDICTION MODEL
          </label>
          <select
            id="prediction-model"
            value={model}
            onChange={(e) => onModelChange(e.target.value as ModelName)}
          >
            {MODELS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <ThresholdSlider value={threshold} onChange={onThresholdChange} />
      </div>
    </section>
  );
}
