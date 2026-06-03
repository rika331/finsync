import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { getFundDetail } from "../api/fund";
import DeleteConfirmSheet from "../components/home/DeleteConfirmSheet";
import DistributionCard from "../components/home/DistributionCard";
import NoticeBar from "../components/home/NoticeBar";
import PlatformTabs from "../components/home/PlatformTabs";
import ProductCard from "../components/home/ProductCard";
import ProductFormSheet from "../components/home/ProductFormSheet";
import ProductSearchOverlay from "../components/home/ProductSearchOverlay";
import SummaryCard from "../components/home/SummaryCard";
import { PRODUCT_TYPES } from "../data/products";
import {
  buildProductFromFund,
  calculateProduct,
  createId,
  getPlatformDistribution,
  getPortfolioSummary,
  getReminderText,
  loadProducts,
  normalizeProduct,
  saveProducts,
  toNumber,
} from "../utils/product";

const DEFAULT_ACTIVE_TAB = "all";

export default function Home() {
  const [products, setProducts] = useState(loadProducts);
  const [activePlatform, setActivePlatform] = useState(DEFAULT_ACTIVE_TAB);
  const [hidden, setHidden] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [formProduct, setFormProduct] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");
  const [chartVersion, setChartVersion] = useState(0);
  const productsRef = useRef(products);
  const toastTimerRef = useRef(null);

  const showToast = (message) => {
    setToast(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 2200);
  };

  useEffect(() => {
    productsRef.current = products;
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const refreshFunds = useCallback(async () => {
    const latest = await Promise.all(
      productsRef.current.map(async (product) => {
        if (product.type !== PRODUCT_TYPES.FUND || !product.code) return product;

        const detail = await getFundDetail(product.code);
        if (!detail) return product;

        return calculateProduct({
          ...product,
          name: detail.name || product.name,
          netValue: detail.netValue || product.netValue,
          dailyRate: detail.dailyRate ?? product.dailyRate,
          updateTime: detail.updateTime || product.updateTime,
        });
      })
    );

    setProducts(latest);
    setChartVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    refreshFunds();
    const timer = window.setInterval(refreshFunds, 30000);
    return () => clearInterval(timer);
  }, [refreshFunds]);

  const portfolio = useMemo(() => getPortfolioSummary(products), [products]);
  const visibleProducts = useMemo(() => {
    if (activePlatform === DEFAULT_ACTIVE_TAB) return portfolio.products;
    return portfolio.products.filter((item) => item.platform === activePlatform);
  }, [activePlatform, portfolio.products]);
  const distribution = useMemo(
    () => getPlatformDistribution(portfolio.products),
    [portfolio.products]
  );
  const reminderText = useMemo(() => getReminderText(portfolio.products), [portfolio.products]);

  const validateProductForm = (form) => {
    if (!String(form.name || "").trim()) return "请输入产品名称";
    if (form.type === PRODUCT_TYPES.FUND && !form.code) return "基金产品缺少基金代码";
    if (toNumber(form.currentValue) <= 0) return "请输入当前持有金额";
    if (toNumber(form.principal) <= 0) return "请输入本金";
    if (!form.platform) return "请选择平台";

    if (form.type === PRODUCT_TYPES.FUND && form.investAmount) {
      if (toNumber(form.investAmount) <= 0) return "定投金额需大于0";
      if (!form.investCycle) return "请选择定投周期";
      if (!form.startDate) return "请选择起始日期";
    }

    return "";
  };

  const submitProduct = (form) => {
    const error = validateProductForm(form);

    if (error) {
      showToast(error);
      return;
    }

    const nextProduct = calculateProduct(
      normalizeProduct({
        ...formProduct,
        ...form,
        name: String(form.name).trim(),
        currentValue: toNumber(form.currentValue),
        principal: toNumber(form.principal),
        investAmount: form.investAmount ? toNumber(form.investAmount) : "",
        dailyRate: toNumber(form.dailyRate),
        netValue: toNumber(form.netValue),
        id: formProduct?.id || createId(form.type),
      })
    );

    setProducts((prev) => {
      const exists = prev.some((item) => item.id === nextProduct.id);

      if (exists) {
        return prev.map((item) => (item.id === nextProduct.id ? nextProduct : item));
      }

      return [...prev, nextProduct];
    });

    setFormProduct(null);
    setSearchOpen(false);
  };

  const openFundForm = async (fund) => {
    const existing = portfolio.products.find((item) => item.code && item.code === fund.code);

    if (existing) {
      showToast("该产品已在列表中");
      return;
    }

    const detail = await getFundDetail(fund.code);
    setFormProduct(buildProductFromFund(detail || fund));
    setSearchOpen(false);
  };

  const openFinanceForm = (name) => {
    const existing = portfolio.products.some((item) => item.name === name);

    if (existing) {
      showToast("该产品已在列表中");
      return;
    }

    setFormProduct(
      normalizeProduct({
        id: createId(PRODUCT_TYPES.FINANCE),
        type: PRODUCT_TYPES.FINANCE,
        platform: "bank",
        name,
      })
    );
    setSearchOpen(false);
  };

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const deleteProduct = () => {
    if (!deleteTarget) return;

    setProducts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="pixel-page">
      <main className="pixel-shell">
        <SummaryCard
          hidden={hidden}
          onToggleHidden={() => setHidden((value) => !value)}
          totalValue={portfolio.totalValue}
          totalProfit={portfolio.totalProfit}
          dailyProfit={portfolio.dailyProfit}
          onRefresh={refreshFunds}
        />

        <NoticeBar text={reminderText} hidden={hidden} />

        <DistributionCard
          items={distribution}
          count={portfolio.products.length}
          hidden={hidden}
          version={chartVersion}
        />

        <section className="products-section">
          <div className="section-title-row products-title">
            <h2>我的产品</h2>
            <button type="button" onClick={() => setSearchOpen(true)}>
              <Plus size={16} />
              添加产品
            </button>
          </div>

          <PlatformTabs active={activePlatform} onChange={setActivePlatform} />

          <div className="product-list">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                hidden={hidden}
                expanded={expandedIds.has(product.id)}
                onToggle={toggleExpanded}
                actionOpen={actionTarget === product.id}
                onLongPress={(nextProduct) => setActionTarget(nextProduct.id)}
                onCloseAction={() => setActionTarget(null)}
                onEdit={() => {
                  setFormProduct(product);
                  setActionTarget(null);
                }}
                onDelete={() => {
                  setDeleteTarget(product);
                  setActionTarget(null);
                }}
              />
            ))}
          </div>
        </section>
      </main>

      {searchOpen && (
        <ProductSearchOverlay
          open={searchOpen}
          existingProducts={portfolio.products}
          onClose={() => setSearchOpen(false)}
          onSelectFund={openFundForm}
          onCreateFinance={openFinanceForm}
          showToast={showToast}
        />
      )}

      {formProduct && (
        <ProductFormSheet
          key={formProduct.id}
          product={formProduct}
          onCancel={() => setFormProduct(null)}
          onConfirm={submitProduct}
        />
      )}

      <DeleteConfirmSheet
        product={deleteTarget}
        hidden={hidden}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteProduct}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
