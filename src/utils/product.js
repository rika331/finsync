import {
  DEFAULT_PRODUCTS,
  INVEST_CYCLE_OPTIONS,
  LEGACY_FUNDS_KEY,
  PLATFORM_OPTIONS,
  PRODUCT_TYPES,
  STORAGE_KEY,
} from "../data/products";

const MONEY_PRECISION = 100;
const CODE_PATTERN = /^\d{6}$/;

export const toNumber = (value) => {
  const normalized = typeof value === "string" ? value.replace(/[,\s¥]/g, "") : value;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

export const createId = (type = "product") =>
  `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const isFundCode = (value) => CODE_PATTERN.test(String(value || ""));

export const formatAmount = (value) =>
  toNumber(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatSignedAmount = (value) => {
  const number = toNumber(value);
  return `${number >= 0 ? "+" : ""}${formatAmount(number)}`;
};

export const maskText = (value, hidden) => {
  if (!hidden) return value;
  return "****";
};

export const getPlatform = (platform) =>
  PLATFORM_OPTIONS.find((item) => item.value === platform) || PLATFORM_OPTIONS[0];

export const getPlatformLabel = (platform) => getPlatform(platform).label;

export const getInvestCycleLabel = (cycle) =>
  INVEST_CYCLE_OPTIONS.find((item) => item.value === cycle)?.label || cycle;

const roundMoney = (value) => Math.round(toNumber(value) * MONEY_PRECISION) / MONEY_PRECISION;

export const calculateProduct = (product) => {
  const currentValue = roundMoney(product.currentValue);
  const principal = roundMoney(product.principal);
  const totalProfit = roundMoney(currentValue - principal);
  const totalProfitRate = principal > 0 ? roundMoney((totalProfit / principal) * 100) : 0;
  const dailyProfit =
    product.type === PRODUCT_TYPES.FUND
      ? roundMoney((currentValue * toNumber(product.dailyRate)) / 100)
      : roundMoney(product.dailyProfit);

  return {
    ...product,
    currentValue,
    principal,
    totalProfit,
    totalProfitRate,
    dailyProfit,
  };
};

export const normalizeProduct = (product) => {
  const type = product.type === PRODUCT_TYPES.FINANCE ? PRODUCT_TYPES.FINANCE : PRODUCT_TYPES.FUND;
  const code = type === PRODUCT_TYPES.FUND ? String(product.code || "") : "";

  return {
    id: product.id || createId(type),
    type,
    platform: product.platform || (type === PRODUCT_TYPES.FUND ? "tiantian" : "bank"),
    code,
    name: String(product.name || (code ? `基金 ${code}` : "未命名产品")).trim(),
    currentValue: roundMoney(product.currentValue ?? product.amount),
    principal: roundMoney(product.principal ?? product.amount),
    dailyRate: toNumber(product.dailyRate),
    dailyProfit: roundMoney(product.dailyProfit),
    netValue: toNumber(product.netValue),
    investAmount: product.investAmount === "" ? "" : roundMoney(product.investAmount),
    investCycle: product.investCycle || "",
    startDate: product.startDate || "",
    redeemableDate: product.redeemableDate || "",
    updateTime: product.updateTime || "--",
  };
};

const loadJsonArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const loadProducts = () => {
  const products = loadJsonArray(STORAGE_KEY);
  if (products) return products.map(normalizeProduct).map(calculateProduct);

  const legacyFunds = loadJsonArray(LEGACY_FUNDS_KEY);
  if (legacyFunds) {
    const migrated = legacyFunds
      .filter((fund) => isFundCode(fund.code))
      .map((fund) =>
        normalizeProduct({
          ...fund,
          id: `fund-${fund.code}`,
          type: PRODUCT_TYPES.FUND,
          platform: "tiantian",
          currentValue: fund.amount,
          principal: fund.amount,
        })
      );

    if (migrated.length > 0) return migrated.map(calculateProduct);
  }

  return DEFAULT_PRODUCTS.map(normalizeProduct).map(calculateProduct);
};

export const saveProducts = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products.map(normalizeProduct)));
};

export const getPortfolioSummary = (products) => {
  const enriched = products.map(calculateProduct);
  const totalValue = roundMoney(enriched.reduce((sum, item) => sum + item.currentValue, 0));
  const totalProfit = roundMoney(enriched.reduce((sum, item) => sum + item.totalProfit, 0));
  const dailyProfit = roundMoney(enriched.reduce((sum, item) => sum + item.dailyProfit, 0));

  return { products: enriched, totalValue, totalProfit, dailyProfit };
};

export const getPlatformDistribution = (products) => {
  const total = products.reduce((sum, item) => sum + item.currentValue, 0);

  return PLATFORM_OPTIONS.map((platform) => {
    const value = roundMoney(
      products
        .filter((item) => item.platform === platform.value)
        .reduce((sum, item) => sum + item.currentValue, 0)
    );

    return {
      key: platform.value,
      ...platform,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    };
  }).filter((item) => item.value > 0);
};

export const getReminderText = (products) => {
  const dated = products
    .filter((item) => item.redeemableDate)
    .sort((a, b) => new Date(a.redeemableDate) - new Date(b.redeemableDate));

  if (dated.length > 0) {
    const item = dated[0];
    const monthDay = item.redeemableDate.slice(5).replace("-", "月");
    return `${item.name}将在${monthDay}日可赎回`;
  }

  return "浦发银行定投将在6月1日到期";
};

export const buildProductFromFund = (fund) =>
  normalizeProduct({
    id: `fund-${fund.code}`,
    type: PRODUCT_TYPES.FUND,
    platform: "tiantian",
    code: fund.code,
    name: fund.name,
    currentValue: 0,
    principal: 0,
    netValue: fund.netValue,
    dailyRate: fund.dailyRate,
    updateTime: fund.updateTime || "--",
  });
