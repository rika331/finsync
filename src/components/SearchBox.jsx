export default function SearchBox({
  value,
  onChange,
  results = [],
  onSelect,
  onAdd,
}) {
  return (
    <div className="relative mb-5">
      <div className="flex items-center gap-4">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;

            event.preventDefault();
            onAdd();
          }}
          placeholder="输入基金代码/名称"
          className="flex-1 h-[56px] bg-white rounded-[16px] px-4 text-[16px] outline-none shadow-sm placeholder:text-[#a1a1aa]"
        />

        <button
          onClick={onAdd}
          className="w-[56px] h-[56px] rounded-[16px] bg-black text-white text-[24px] leading-none pb-1 shrink-0"
        >
          +
        </button>
      </div>

      {results.length > 0 && (
        <div className="absolute left-0 right-[72px] top-[64px] z-20 overflow-hidden rounded-[16px] bg-white shadow-lg">
          {results.map((item) => (
            <button
              key={item.code}
              onClick={() => onSelect(item)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-black">
                  {item.name}
                </span>
                <span className="mt-1 block text-[12px] text-[#8E8E93]">
                  {item.code}
                </span>
              </span>

              {item.type && (
                <span className="ml-3 shrink-0 text-[12px] text-[#A1A1AA]">
                  {item.type}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
