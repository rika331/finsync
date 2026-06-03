import { useRef, useState } from "react";
import { Calendar, ChevronsUpDown } from "lucide-react";
import { INVEST_CYCLE_OPTIONS, PLATFORM_OPTIONS, PRODUCT_TYPES } from "../../data/products";

const getInitialState = (product) => ({
  name: product?.name || "",
  code: product?.code || "",
  type: product?.type || PRODUCT_TYPES.FINANCE,
  platform: product?.platform || (product?.type === PRODUCT_TYPES.FUND ? "tiantian" : "bank"),
  currentValue: product?.currentValue ? String(product.currentValue) : "",
  principal: product?.principal ? String(product.principal) : "",
  investAmount: product?.investAmount ? String(product.investAmount) : "",
  investCycle: product?.investCycle || "",
  startDate: product?.startDate || "",
  redeemableDate: product?.redeemableDate || "",
  dailyRate: product?.dailyRate || 0,
  netValue: product?.netValue || 0,
  updateTime: product?.updateTime || "--",
});

const formatDateText = (value) => (value ? value.replaceAll("-", "/") : "选填");
const formatCycleText = (value) =>
  INVEST_CYCLE_OPTIONS.find((item) => item.value === value)?.label || "选填";

export default function ProductFormSheet({ product, onCancel, onConfirm }) {
  const [form, setForm] = useState(() => getInitialState(product));
  const nameInputRef = useRef(null);
  const isFund = form.type === PRODUCT_TYPES.FUND;
  const title = isFund ? product?.name : form.name || "新增理财产品";

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-scrim">
      <form
        className={`pixel-frame bottom-sheet product-form ${
          isFund ? "product-form-fund" : "product-form-finance"
        }`}
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(form);
        }}
      >
        <div className="form-heading">
          <div>
            {isFund ? (
              <>
                <h2>{title}</h2>
                <p>{form.code}</p>
              </>
            ) : (
              <input
                ref={nameInputRef}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="输入产品名称"
                autoFocus
              />
            )}
          </div>
          <input
            className="form-current-input"
            value={form.currentValue}
            onChange={(event) => updateField("currentValue", event.target.value)}
            inputMode="decimal"
            placeholder="输入目前持有金额"
          />
        </div>

        <label>
          <span>本金</span>
          <input
            value={form.principal}
            onChange={(event) => updateField("principal", event.target.value)}
            inputMode="decimal"
            placeholder="0.00"
          />
        </label>

        {isFund ? (
          <>
            <label>
              <span>定投金额</span>
              <input
                value={form.investAmount}
                onChange={(event) => updateField("investAmount", event.target.value)}
                inputMode="decimal"
                placeholder="选填"
              />
            </label>

            <label>
              <span>定投周期</span>
              <div className="select-field">
                <span className="select-field-display">
                  {formatCycleText(form.investCycle)}
                  <ChevronsUpDown size={16} strokeWidth={2} />
                </span>
                <select
                  value={form.investCycle}
                  onChange={(event) => updateField("investCycle", event.target.value)}
                >
                  <option value="">选填</option>
                  {INVEST_CYCLE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label>
              <span>起始日期</span>
              <div className={`date-field ${!form.startDate ? "date-field-empty" : ""}`}>
                <span className="date-field-display">
                  {formatDateText(form.startDate)}
                  <Calendar size={16} strokeWidth={2} />
                </span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => updateField("startDate", event.target.value)}
                />
              </div>
            </label>
          </>
        ) : (
          <label>
            <span>可赎回时间</span>
            <div className={`date-field ${!form.redeemableDate ? "date-field-empty" : ""}`}>
              <span className="date-field-display">
                {formatDateText(form.redeemableDate)}
                <Calendar size={16} strokeWidth={2} />
              </span>
              <input
                type="date"
                value={form.redeemableDate}
                onChange={(event) => updateField("redeemableDate", event.target.value)}
              />
            </div>
          </label>
        )}

        <div className="platform-picker">
          <span>平台</span>
          <div>
            {PLATFORM_OPTIONS.map((item) => (
              <button
                type="button"
                key={item.value}
                className={form.platform === item.value ? "active" : ""}
                onClick={() => updateField("platform", item.value)}
              >
                {item.formLabel || item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="primary">
            确认
          </button>
        </div>
      </form>
    </div>
  );
}
