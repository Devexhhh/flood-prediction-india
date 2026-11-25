import type { ReactNode } from "react";
import { BlurFade, BorderBeam, NumberTicker, PulseDot } from "../../components/magicui";
import { Card } from "../../components/ui/card";
import type { Station } from "../../types";

function Kpi({
  label,
  children,
  foot,
  beam,
  delay,
}: {
  label: ReactNode;
  children: ReactNode;
  foot: ReactNode;
  beam?: boolean;
  delay: number;
}) {
  return (
    <BlurFade inView={false} delay={delay}>
      <Card className="flex h-full flex-col gap-2.5 rounded-[14px] p-[18px]">
        {beam && <BorderBeam />}
        <span className="flex items-center gap-2 text-[13px] text-muted-foreground">{label}</span>
        <div className="text-[30px] leading-none tracking-tight">{children}</div>
        <span className="truncate text-xs text-muted-foreground">{foot}</span>
      </Card>
    </BlurFade>
  );
}

export function KpiGrid({
  stationCount,
  alertCount,
  stations,
}: {
  stationCount: number;
  alertCount: number;
  /** Sorted by probability, highest first. */
  stations: Station[];
  threshold: number;
}) {
  const peak = stations[0];
  const share = stations.length ? (alertCount / stations.length) * 100 : 0;
  return (
    <section aria-label="Key figures" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi label="Monitored stations" foot="Scored for next day" delay={0}>
        <NumberTicker value={stationCount} />
      </Kpi>
      <Kpi
        beam={alertCount > 0}
        delay={0.05}
        label={<><PulseDot ping={alertCount > 0} className="size-[7px] text-risk" /> Exceedance alerts</>}
        foot={`${share.toFixed(1)}% of stations`}
      >
        <NumberTicker value={alertCount} duration={0.6} className="text-risk" />
      </Kpi>
      <Kpi label="Below cutoff" foot="Watch list" delay={0.1}>
        <NumberTicker value={stations.length - alertCount} duration={0.6} />
      </Kpi>
      <Kpi label="Peak risk score" foot={peak?.station_name || peak?.station_code || "—"} delay={0.15}>
        <NumberTicker value={(peak?.probability ?? 0) * 100} decimals={1} suffix="%" />
      </Kpi>
    </section>
  );
}
