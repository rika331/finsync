import { PencilLine, MoreHorizontal } from "lucide-react";
import { formatMoney } from "../utils/format";
import { calcDailyProfit } from "../utils/calc";

export default function AssetCard({
  fund,
  onEdit,
  onDeleteClick,
}) {
  // 今日收益
  const profit = calcDailyProfit(
    fund.amount,
    fund.dailyRate || 0
  );

  const isUp = Number(profit) >= 0;

  // 当前持仓总额
  const totalMoney = fund.amount;

  return (
    <div className="bg-white rounded-[28px] px-6 pt-5 pb-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      {/* 顶部 */}
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="text-[16px] leading-[22px] font-semibold text-black">
            {fund.name} →
          </div>

          <div className="mt-2 text-[12px] text-[#A1A1AA]">
            {fund.code}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[16px] font-semibold text-black">
            ¥{formatMoney(totalMoney)}
          </div>

          <div
            className={`mt-4 text-[14px] font-semibold ${isUp
              ? "text-[#FF4D4F]"
              : "text-[#12B981]"
              }`}
          >
            {isUp ? "+" : ""}
            {profit}
          </div>

          <div className="mt-1 text-[12px] text-[#A1A1AA]">
            昨日收益
          </div>
        </div>
      </div>

      {/* 底部 */}
      <div className="flex items-center justify-between mt-8">
        <div className="text-[13px] text-[#8E8E93] font-semibold">
          更新：{fund.updateTime || "--"}
        </div>

        <button
          onClick={() => onEdit(fund)}
          className="flex items-center gap-2"
        >
          <PencilLine size={18} />

          <span className="text-[14px] text-[#666] font-medium">
            持有金额
          </span>
        </button>

        <button
          onClick={(event) => {
            event.stopPropagation();
            const rect = event.currentTarget.getBoundingClientRect();
            const width = 88;

            onDeleteClick({
              fund,
              position: {
                top: rect.bottom + 8,
                left: Math.min(
                  Math.max(12, rect.right - width),
                  window.innerWidth - width - 12
                ),
              },
            });
          }}
        >
          <MoreHorizontal size={22} color="#A1A1AA" />
        </button>
      </div>
    </div>
  );
}
