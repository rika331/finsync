export default function DeletePopover({
  target,
  onClose,
  onDelete,
}) {
  if (!target) return null;

  const position = target.position || {
    top: 0,
    left: 0,
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="fixed z-50"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="bg-white shadow-lg rounded-[14px] w-[88px] h-[44px] text-[#ff4d4f] text-[16px] font-semibold"
        >
          删除
        </button>
      </div>
    </>
  );
}
