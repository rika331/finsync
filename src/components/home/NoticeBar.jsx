import { X } from "lucide-react";
import attentionIcon2x from "../../assets/icons/ic_attention@2x.png";
import attentionIcon3x from "../../assets/icons/ic_attention@3x.png";

export default function NoticeBar({ text, hidden }) {
  return (
    <section className="notice-bar">
      <img
        className="notice-icon"
        src={attentionIcon2x}
        srcSet={`${attentionIcon2x} 2x, ${attentionIcon3x} 3x`}
        alt=""
        aria-hidden="true"
      />
      <span>{hidden ? "****" : text}</span>
      <button type="button" aria-label="关闭提醒">
        <X size={14} />
      </button>
    </section>
  );
}
