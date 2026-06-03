import { EyeIcon, RefreshIcon, RiseIcon } from "../icons/PixelIcons";
import { formatAmount, formatSignedAmount, maskText } from "../../utils/product";

export default function SummaryCard({
  hidden,
  onToggleHidden,
  totalValue,
  totalProfit,
  dailyProfit,
  onRefresh,
}) {
  return (
    <section className={`pixel-frame summary-card ${hidden ? "summary-card-hidden" : ""}`}>
      <div className="summary-card-top">
        <button className="summary-eye" type="button" onClick={onToggleHidden}>
          <span>总资产估值(CNY)</span>
          <EyeIcon closed={hidden} size={16} />
        </button>

        <button className="summary-update" type="button" onClick={onRefresh}>
          <span>更新于 09:30</span>
          <RefreshIcon size={16} />
        </button>
      </div>

      <div className="summary-value">
        {maskText(formatAmount(totalValue), hidden)}
      </div>

      <div className="summary-metrics">
        <span>
          累积收益
          <b className={totalProfit >= 0 ? "text-profit-up" : "text-profit-down"}>
            {maskText(formatSignedAmount(totalProfit), hidden)}
          </b>
        </span>

        <span>
          <RiseIcon size={14} />
          昨日
          <b className={dailyProfit >= 0 ? "text-profit-up" : "text-profit-down"}>
            {maskText(formatSignedAmount(dailyProfit), hidden)}
          </b>
        </span>
      </div>
    </section>
  );
}
