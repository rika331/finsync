import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { getFundDetail, searchFund } from "../../api/fund";

export default function ProductSearchOverlay({
  open,
  existingProducts,
  onClose,
  onSelectFund,
  onCreateFinance,
  showToast,
}) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const trimmedKeyword = keyword.trim();

  const existingCodes = useMemo(
    () => new Set(existingProducts.map((item) => item.code).filter(Boolean)),
    [existingProducts]
  );

  useEffect(() => {
    if (!open || !trimmedKeyword) return undefined;

    let active = true;
    const timer = window.setTimeout(async () => {
      const nextResults = await searchFund(trimmedKeyword);
      if (active) setResults(nextResults);
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, trimmedKeyword]);

  if (!open) return null;

  const handleFund = (fund) => {
    if (existingCodes.has(fund.code)) {
      showToast("该产品已在列表中");
      return;
    }

    onSelectFund(fund);
  };

  const handleAdd = async () => {
    const text = trimmedKeyword;

    if (!text) {
      showToast("请输入产品名称或基金代码");
      return;
    }

    const exact = results.find((item) => item.code === text || item.name === text);

    if (exact) {
      handleFund(exact);
      return;
    }

    if (/^\d+$/.test(text)) {
      if (/^\d{6}$/.test(text)) {
        const detail = await getFundDetail(text);

        if (detail) {
          handleFund(detail);
          return;
        }
      }

      showToast("未找到匹配基金");
      return;
    }

    if (text.length < 2) {
      showToast("请输入更完整的产品名称");
      return;
    }

    onCreateFinance(text);
  };

  return (
    <div className="search-overlay" onPointerDown={onClose}>
      <div className="search-panel" onPointerDown={(event) => event.stopPropagation()}>
        <div className="search-bar">
          <Search size={18} />
          <input
            value={keyword}
            onChange={(event) => {
              const nextKeyword = event.target.value;
              setKeyword(nextKeyword);
              if (!nextKeyword.trim()) setResults([]);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            autoFocus
            placeholder="输入基金代码/名称"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setResults([]);
              }}
              aria-label="清空搜索"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button type="button" className="search-add" onClick={handleAdd}>
          添加
        </button>
      </div>

      <div className="pixel-frame search-results" onPointerDown={(event) => event.stopPropagation()}>
        {results.length > 0 ? (
          results.map((item) => (
            <button key={item.code} type="button" onClick={() => handleFund(item)}>
              <span>
                <b>{item.name}</b>
                <small>{item.code}</small>
              </span>
              <em>{item.type || "指数型-股票"}</em>
            </button>
          ))
        ) : (
          <div className="search-empty">
            {trimmedKeyword ? "没有匹配基金，可作为理财产品添加" : "输入代码或名称开始搜索"}
          </div>
        )}
      </div>

    </div>
  );
}
