import PixelButton from "./PixelButton";
import { PLATFORM_OPTIONS } from "../../data/products";

export default function PlatformTabs({ active, onChange }) {
  return (
    <div className="platform-tabs" role="tablist" aria-label="产品平台">
      <PixelButton active={active === "all"} onClick={() => onChange("all")}>
        全部
      </PixelButton>

      {PLATFORM_OPTIONS.map((item) => (
        <PixelButton
          key={item.value}
          active={active === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </PixelButton>
      ))}
    </div>
  );
}
