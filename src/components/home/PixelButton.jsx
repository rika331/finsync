export default function PixelButton({
  children,
  active = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`pixel-button ${active ? "pixel-button-active" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
