import { useEffect, useMemo, useRef, useState } from "react";
import SearchBox from "../components/SearchBox";
import AssetCard from "../components/AssetCard";
import AmountModal from "../components/AmountModal";
import AllInsightBar from "../components/AllInsightBar";
import DeletePopover from "../components/DeletePopover";
import { searchFund, getFundDetail } from "../api/fund";
import { calcDailyProfitValue } from "../utils/calc";

const FUND_CODE_PATTERN = /^\d{6}$/;

const isValidFundCode = (code) => FUND_CODE_PATTERN.test(String(code || ""));

const normalizeFund = (fund) => ({
  ...fund,
  amount: Number(fund.amount || 0),
});

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [toast, setToast] = useState("");
  const [editingFund, setEditingFund] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [funds, setFunds] = useState(() => {
    const cache = localStorage.getItem("funds");

    if (cache) {
      try {
        const cachedFunds = JSON.parse(cache);

        if (Array.isArray(cachedFunds)) {
          return cachedFunds
            .filter((fund) => isValidFundCode(fund.code))
            .map(normalizeFund);
        }
      } catch {
        return [];
      }
    }

    return [
      {
        code: "110007",
        name: "易方达稳健收益债券A",
        amount: 1,
        netValue: 1,
        dailyRate: 0,
        updateTime: "--",
      },
      {
        code: "003547",
        name: "鹏华丰禄债券",
        amount: 1111,
        netValue: 1,
        dailyRate: 0,
        updateTime: "--",
      },
    ];
  });
  const fundsRef = useRef(funds);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    fundsRef.current = funds;
  }, [funds]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // 总资产
  const totalAssets = useMemo(() => {
    return funds.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [funds]);

  // 今日收益
  const totalProfit = useMemo(() => {
    return funds.reduce((sum, item) => {
      return sum + calcDailyProfitValue(item.amount, item.dailyRate);
    }, 0);
  }, [funds]);

  useEffect(() => {
    if (!keyword.trim()) {
      return;
    }

    let isActive = true;

    const timer = setTimeout(async () => {
      const result = await searchFund(keyword);

      if (isActive) {
        setSearchResults(result);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [keyword]);

  // 自动保存
  useEffect(() => {
    localStorage.setItem("funds", JSON.stringify(funds));
  }, [funds]);

  // 自动刷新净值
  useEffect(() => {
    const fetchLatest = async () => {
      const updated = await Promise.all(
        fundsRef.current.map(async (fund) => {
          const detail = await getFundDetail(fund.code);

          return {
            ...fund,
            name: detail?.name || fund.name,
            netValue: detail?.netValue ?? fund.netValue,
            dailyRate: detail?.dailyRate ?? fund.dailyRate,
            updateTime: detail?.updateTime || fund.updateTime,
          };
        })
      );

      setFunds(updated);
    };

    fetchLatest();

    const timer = setInterval(fetchLatest, 30000);

    return () => clearInterval(timer);
  }, []);

  const showToast = (message) => {
    setToast(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const handleKeywordChange = (nextKeyword) => {
    setKeyword(nextKeyword);

    if (!nextKeyword.trim()) {
      setSearchResults([]);
    }
  };

  // 添加基金
  const addFund = async (item) => {
    if (!isValidFundCode(item?.code)) {
      showToast("请选择有效基金");
      return;
    }

    const exists = funds.some((fund) => fund.code === item.code);

    if (exists) {
      setKeyword("");
      setSearchResults([]);
      showToast("基金已在列表中");
      return;
    }

    const detail = await getFundDetail(item.code);

    if (!detail && !item.name) {
      showToast("暂未找到该基金");
      return;
    }

    setFunds((prev) => [
      ...prev,
      {
        code: item.code,
        name: detail?.name || item.name,
        amount: 0,
        netValue: detail?.netValue ?? item.netValue ?? 0,
        dailyRate: detail?.dailyRate ?? item.dailyRate ?? 0,
        updateTime: detail?.updateTime || item.updateTime || "--",
      },
    ]);

    setKeyword("");
    setSearchResults([]);
  };

  const addFundByKeyword = async () => {
    const text = keyword.trim();

    if (!text) {
      showToast("请输入基金代码或名称");
      setSearchResults([]);
      return;
    }

    if (/^\d+$/.test(text) && !isValidFundCode(text)) {
      showToast("基金代码应为6位数字");
      return;
    }

    const latestResults = searchResults.length > 0 ? searchResults : await searchFund(text);
    const candidate = isValidFundCode(text)
      ? latestResults.find((item) => item.code === text) || { code: text }
      : latestResults[0];

    if (!candidate) {
      showToast("未找到匹配基金");
      return;
    }

    await addFund(candidate);
  };

  // 修改持有金额
  const updateAmount = (code, amount) => {
    setFunds((prev) =>
      prev.map((item) =>
        item.code === code
          ? {
            ...item,
            amount: Math.max(0, Number(amount) || 0),
          }
          : item
      )
    );
  };

  // 删除基金
  const deleteFund = (code) => {
    setFunds((prev) => prev.filter((item) => item.code !== code));
  };

  const isProfitUp = totalProfit >= 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[480px] mx-auto px-3 pt-5 pb-10">
        {/* 顶部资产卡 */}
        <div className="rounded-[28px] bg-black px-5 pt-5 pb-6">
          <div className="text-[14px] text-white/80 font-medium">
            总资产
          </div>

          <div className="mt-5 text-[28px] leading-none font-bold text-white">
            ¥{totalAssets.toFixed(2)}
          </div>

          <div className="mt-6 flex items-center">
            <span className="text-[16px] text-white font-regular">
              今日趋势:
            </span>

            <span
              className={`ml-2 text-[16px] font-bold ${isProfitUp ? "text-[#FF4D4F]" : "text-[#12B981]"
                }`}
            >
              {totalProfit >= 0 ? "+" : ""}
              {totalProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 搜索 */}
        <div className="mt-5">
          <SearchBox
            value={keyword}
            onChange={handleKeywordChange}
            results={searchResults}
            onSelect={addFund}
            onAdd={addFundByKeyword}
          />
        </div>

        {/* AI 分析 */}
        <div className="mt-5">
          <AllInsightBar funds={funds} />
        </div>

        {/* 到期提醒 */}
        <div className="mt-4 rounded-[16px] bg-[#fffcd0] px-4 py-4">
          <div className="text-[15px] font-semibold text-[#333333]">
            ⏰ 有产品即将到期，请注意查看
          </div>
        </div>

        {/* 表头 */}
        <div className="mt-8 flex items-center justify-between px-1">
          <div className="text-[12px] font-regular text-[#999999]">
            名称
          </div>

          <div className="text-[12px] font-regular text-[#999999]">
            金额 / 昨日收益
          </div>
        </div>

        {/* 卡片 */}
        <div className="mt-4 space-y-4">
          {funds.map((fund) => (
            <AssetCard
              key={fund.code}
              fund={fund}
              onDeleteClick={setDeleteTarget}
              onEdit={(fundItem) =>
                setEditingFund({
                  ...fundItem,
                })
              }
            />
          ))}
        </div>
      </div>

      {/* 修改金额弹窗 */}
      <AmountModal
        key={editingFund?.code ?? "closed"}
        fund={editingFund}
        onClose={() => setEditingFund(null)}
        onConfirm={(code, amount) => {
          updateAmount(code, amount);
          setEditingFund(null);
        }}
      />

      <DeletePopover
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={() => {
          if (!deleteTarget?.fund) return;

          deleteFund(deleteTarget.fund.code);
          setDeleteTarget(null);
        }}
      />

      {toast && (
        <div className="fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-[14px] bg-black px-4 py-3 text-[14px] font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
