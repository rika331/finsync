import { useEffect, useState } from "react";

function mockFetchFunds() {
  return Promise.resolve([
    {
      code: "000001",
      name: "示例基金A",
      amount: 10000,
      profit: 120,
      updateTime: "13:20",
    },
    {
      code: "000002",
      name: "示例基金B",
      amount: 8000,
      profit: -60,
      updateTime: "13:18",
    },
  ]);
}

export default function Home() {
  console.log("Home 渲染了");
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalAsset = funds.reduce((sum, f) => sum + f.amount, 0);
  const totalProfit = funds.reduce((sum, f) => sum + f.profit, 0);

  const refresh = async () => {
    setLoading(true);
    const data = await mockFetchFunds();
    setFunds(data);
    localStorage.setItem("lastRefresh", Date.now().toString());
    setLoading(false);
  };

  useEffect(() => {
    const last = localStorage.getItem("lastRefresh");
    if (!last || Date.now() - Number(last) > 600000) {
      refresh();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="p-4 max-w-md mx-auto space-y-4">
      {/* 资产卡 */}
      <div className="bg-black text-white p-4 rounded-2xl">
        <div className="text-sm opacity-70">总资产 (CNY)</div>
        <div className="text-3xl font-bold">¥{totalAsset}</div>
        <div className="text-sm mt-1">
          今日收益：
          <span className={totalProfit >= 0 ? "text-green-400" : "text-red-400"}>
            {totalProfit >= 0 ? "+" : ""}
            {totalProfit}
          </span>
        </div>
        <button
          onClick={refresh}
          className="mt-3 bg-white text-black px-3 py-1 rounded-lg text-sm"
        >
          {loading ? "刷新中..." : "刷新"}
        </button>
      </div>

      {/* AI总结卡 */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <div className="font-semibold mb-2">🧠 AI总结</div>
        <div className="text-sm text-gray-600">
          你的组合偏稳健，目前整体波动较低。
        </div>
        <ul className="text-sm mt-2 list-disc ml-4 text-gray-700">
          <li>可以适当增加权益类资产</li>
          <li>当前无需频繁操作</li>
        </ul>
      </div>

      {/* 提醒 */}
      <div className="bg-yellow-100 p-4 rounded-2xl">
        <div className="font-semibold">⏰ 提醒</div>
        <div className="text-sm mt-1">暂无待处理事项</div>
      </div>

      {/* 持仓列表 */}
      <div className="space-y-3">
        {funds.map((f) => (
          <div key={f.code} className="bg-white p-4 rounded-2xl shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{f.name}</div>
                <div className="text-xs text-gray-400">{f.code}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">¥{f.amount}</div>
                <div className={f.profit >= 0 ? "text-green-500" : "text-red-500"}>
                  {f.profit >= 0 ? "+" : ""}
                  {f.profit}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-3 text-xs text-gray-400">
              <span>更新：{f.updateTime}</span>
              <div className="space-x-2">
                <button className="text-blue-500">AI</button>
                <button className="text-gray-500">详情</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
