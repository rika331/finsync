import { useState } from "react";

export default function AmountModal({
  fund,
  onClose,
  onConfirm,
}) {
  const [value, setValue] = useState(() => String(fund?.amount ?? ""));

  if (!fund) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center px-4 pb-6">
      <div className="bg-white rounded-[32px] w-full max-w-[480px] p-6 animate-slideUp">
        <div className="text-[16px] font-bold">
          修改持有金额
        </div>

        <div className="mt-3 text-[14px] text-[#7c7f8a] font-medium">
          {fund.name}
        </div>

        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full mt-4 h-[54px] rounded-[16px] bg-[#f8f8fa] px-4 text-[16px] outline-none"
        />

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-[56px] rounded-[16px] bg-[#f3f4f6] text-[16px] font-semibold"
          >
            取消
          </button>

          <button
            onClick={() => {
              const num = Number(value);

              if (Number.isNaN(num)) return;

              onConfirm(fund.code, num);
            }}
            className="flex-1 h-[56px] rounded-[16px] bg-black text-white text-[16px] font-semibold"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
