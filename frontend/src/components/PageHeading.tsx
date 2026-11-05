import { MODELS, type AppPage, type ModelName } from "../types";
import { ThresholdSlider } from "./ThresholdSlider";

const PAGE_TITLES: Record<AppPage, string> = {
  overview: "National Overview",
  stations: "Station Explorer",
  models: "Model Evaluation",
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
      <div className="heading-title-group">
        <h1>{PAGE_TITLES[activePage]}</h1>
      </div>

      {activePage === "overview" && (
        <div className="heading-controls">
          <div className="heading-control">
            <label className="control-label" htmlFor="prediction-model">
              MODEL
            </label>
            <div className="glass-select-wrap">
              <select
                id="prediction-model"
                value={model}
                onChange={(e) => onModelChange(e.target.value as ModelName)}
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <ThresholdSlider value={threshold} onChange={onThresholdChange} />
        </div>
      )}
    </section>
  );
}
