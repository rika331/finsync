import { maskText } from "../../utils/product";

export default function DeleteConfirmSheet({ product, hidden, onCancel, onConfirm }) {
  if (!product) return null;

  return (
    <div className="modal-scrim">
      <div className="pixel-frame bottom-sheet confirm-sheet">
        <p>确认要删除{maskText(product.name, hidden)}么？</p>
        <div className="sheet-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="primary" onClick={onConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
