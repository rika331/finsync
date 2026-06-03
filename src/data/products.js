export const STORAGE_KEY = "finsync_products_v2";
export const LEGACY_FUNDS_KEY = "funds";

export const PRODUCT_TYPES = {
  FUND: "fund",
  FINANCE: "finance",
};

export const PLATFORM_OPTIONS = [
  { value: "alipay", label: "支付宝", formLabel: "支付宝", color: "#3D6CFF" },
  { value: "tiantian", label: "天天基金", formLabel: "天天基金", color: "#FF8743" },
  { value: "bank", label: "银行定期", formLabel: "银行定投", color: "#57C6E5" },
];

export const INVEST_CYCLE_OPTIONS = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
  { value: "biweekly", label: "每2周" },
  { value: "monthly", label: "每月" },
];

export const DEFAULT_PRODUCTS = [
  {
    id: "fund-003547",
    type: PRODUCT_TYPES.FUND,
    platform: "tiantian",
    code: "003547",
    name: "鹏华丰禄债券",
    currentValue: 20200,
    principal: 20000,
    dailyRate: 0.0595,
    investAmount: 100,
    investCycle: "daily",
    startDate: "2024-11-01",
    updateTime: "09:30",
  },
  {
    id: "fund-110007",
    type: PRODUCT_TYPES.FUND,
    platform: "alipay",
    code: "110007",
    name: "易方达稳健收益债券A",
    currentValue: 15938,
    principal: 15000,
    dailyRate: 1.2423,
    updateTime: "09:30",
  },
  {
    id: "finance-bank-001",
    type: PRODUCT_TYPES.FINANCE,
    platform: "bank",
    name: "浦发银行定投",
    currentValue: 15062,
    principal: 15000,
    redeemableDate: "2026-06-01",
    updateTime: "09:30",
  },
];
