import { formatAmount, maskText } from "../../utils/product";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DistributionCard({ items, count, hidden, version }) {
  const arcs = items.reduce(
    (result, item) => {
      const length = (item.percent / 100) * CIRCUMFERENCE;
      result.items.push({
        ...item,
        length,
        dashOffset: -result.offset,
      });
      result.offset += length;
      return result;
    },
    { items: [], offset: 0 }
  ).items;

  return (
    <section className="distribution-wrap">
      <div className="section-title-row">
        <h2>资产分布</h2>
        <span>{hidden ? "****" : `${count}个产品`}</span>
      </div>

      <div className="pixel-frame distribution-card">
        <svg
          key={version}
          className="donut-chart"
          viewBox="0 0 120 120"
          aria-label="资产分布图"
        >
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#000" strokeWidth="18" />
          {arcs.map((item) => {
            return (
              <circle
                key={item.key}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke={item.color}
                strokeWidth="15"
                strokeDasharray={`${item.length} ${CIRCUMFERENCE - item.length}`}
                strokeDashoffset={item.dashOffset}
                strokeLinecap="butt"
                transform="rotate(-90 60 60)"
              />
            );
          })}
          <circle cx="60" cy="60" r="26" fill="#fff" />
        </svg>

        <div className="distribution-list">
          {items.map((item) => (
            <div className="distribution-item" key={item.key}>
              <span className="legend-dot" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
              <b>{maskText(`¥${formatAmount(item.value)}`, hidden)}</b>
              <span>{hidden ? "****" : `${item.percent}%`}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
