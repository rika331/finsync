import eyeCloseIcon from "../../assets/icons/ic_eyeclose.svg";
import eyeOpenIcon from "../../assets/icons/ic_eyeopen.svg";
import refreshIcon from "../../assets/icons/ic_refresh.svg";

export function EyeIcon({ closed = false, size = 16 }) {
  return (
    <img
      src={closed ? eyeCloseIcon : eyeOpenIcon}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}

export function RefreshIcon({ size = 16 }) {
  return (
    <img src={refreshIcon} width={size} height={size} alt="" aria-hidden="true" />
  );
}

export function RiseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M1.5 9.5 5.2 5.8l2.2 2.2L12 3.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.8"
      />
      <path
        d="M8.4 3.5H12v3.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.8"
      />
    </svg>
  );
}
