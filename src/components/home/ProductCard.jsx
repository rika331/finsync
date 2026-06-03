import { useRef } from "react";
import { ChevronDown, ChevronUp, PencilLine, Trash2 } from "lucide-react";
import {
  formatAmount,
  formatSignedAmount,
  getInvestCycleLabel,
  getPlatformLabel,
  maskText,
} from "../../utils/product";

const MOVE_CANCEL_DISTANCE = 8;
const LONG_PRESS_DELAY = 500;

export default function ProductCard({
  product,
  expanded,
  hidden,
  actionOpen,
  onToggle,
  onLongPress,
  onCloseAction,
  onEdit,
  onDelete,
}) {
  const pressTimerRef = useRef(null);
  const startPointRef = useRef(null);
  const longPressedRef = useRef(false);
  const movedRef = useRef(false);

  const clearPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const startPress = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    startPointRef.current = { x: event.clientX, y: event.clientY };
    longPressedRef.current = false;
    movedRef.current = false;
    const card = event.currentTarget;

    clearPress();
    pressTimerRef.current = window.setTimeout(() => {
      const rect = card.getBoundingClientRect();
      longPressedRef.current = true;
      onLongPress(product, rect);
      clearPress();
    }, LONG_PRESS_DELAY);
  };

  const movePress = (event) => {
    if (!startPointRef.current) return;

    const dx = Math.abs(event.clientX - startPointRef.current.x);
    const dy = Math.abs(event.clientY - startPointRef.current.y);

    if (dx > MOVE_CANCEL_DISTANCE || dy > MOVE_CANCEL_DISTANCE) {
      movedRef.current = true;
      clearPress();
    }
  };

  const isDailyUp = product.dailyProfit >= 0;
  const isTotalUp = product.totalProfit >= 0;
  const detailItems = [];

  if (product.startDate) {
    detailItems.push(["起始日期", product.startDate]);
  }

  if (product.investAmount > 0) {
    detailItems.push(["定投金额", `¥${formatAmount(product.investAmount)}`]);
  }

  if (product.investCycle) {
    detailItems.push(["定投周期", getInvestCycleLabel(product.investCycle)]);
  }

  if (product.redeemableDate) {
    detailItems.push(["可赎回时间", product.redeemableDate]);
  }

  const handleCardClick = () => {
    if (longPressedRef.current || movedRef.current) {
      longPressedRef.current = false;
      movedRef.current = false;
      return;
    }

    onToggle(product.id);
  };

  return (
    <article
      className={`pixel-frame product-card ${expanded ? "product-card-expanded" : ""}`}
      onPointerDown={startPress}
      onPointerMove={movePress}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onContextMenu={(event) => {
        event.preventDefault();
        onLongPress(product, event.currentTarget.getBoundingClientRect());
      }}
    >
      <button className="product-card-main" type="button" onClick={handleCardClick}>
        <div className="product-left">
          <h3>{maskText(product.name, hidden)}</h3>
          <p>
            {maskText(
              product.type === "fund" ? product.code : getPlatformLabel(product.platform),
              hidden
            )}
          </p>
        </div>

        <div className="product-right">
          <strong>{maskText(formatAmount(product.currentValue), hidden)}</strong>
          <span>
            <em>今日</em>
            <b className={isDailyUp ? "text-profit-up" : "text-profit-down"}>
              {maskText(formatSignedAmount(product.dailyProfit), hidden)}
            </b>
          </span>
        </div>
      </button>

      <button className="product-metrics" type="button" onClick={handleCardClick}>
        <span>
          <small>投入本金</small>
          <b>{maskText(formatAmount(product.principal), hidden)}</b>
        </span>
        <span>
          <small>累计收益</small>
          <b className={isTotalUp ? "text-profit-up" : "text-profit-down"}>
            {maskText(formatSignedAmount(product.totalProfit), hidden)}
          </b>
        </span>
        <span>
          <small>{product.type === "fund" ? "年化收益" : "收益率(总)"}</small>
          <b className={isTotalUp ? "text-profit-up" : "text-profit-down"}>
            {hidden ? "****" : `${formatSignedAmount(product.totalProfitRate).replace(".00", "")}%`}
          </b>
        </span>
      </button>

      {expanded && detailItems.length > 0 && (
        <div
          className={`product-detail-box ${
            detailItems.length > 2 ? "product-detail-box-two" : "product-detail-box-one"
          }`}
        >
          {detailItems.map(([label, value]) => (
            <span key={label}>
              {label} <b>{maskText(value, hidden)}</b>
            </span>
          ))}
        </div>
      )}

      <button className="card-chevron" type="button" onClick={handleCardClick}>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {actionOpen && (
        <div
          className="product-action-overlay"
          onClick={(event) => {
            event.stopPropagation();
            onCloseAction();
          }}
        >
          <div className="product-action-menu" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={onEdit}>
              <PencilLine size={18} />
              编辑信息
            </button>
            <button type="button" className="danger" onClick={onDelete}>
              <Trash2 size={18} />
              删除产品
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
