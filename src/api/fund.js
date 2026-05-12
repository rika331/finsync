const CODE_PATTERN = /^\d{6}$/;
const SEARCH_API =
    "https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx";
const DETAIL_API = "https://fundgz.1234567.com.cn/js";

let fixedJsonpQueue = Promise.resolve();

const canUseScriptJsonp = () =>
    typeof window !== "undefined" && typeof document !== "undefined";

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const parseJsonpText = (text) => {
    const match = text.match(/^[^(]+\((.*)\);?$/s);
    return match ? JSON.parse(match[1]) : null;
};

const requestFetchJsonp = async (url) => {
    const res = await fetch(url);
    const text = await res.text();

    try {
        return JSON.parse(text);
    } catch {
        return parseJsonpText(text);
    }
};

const requestJsonp = (url, callbackParam = "callback") => {
    if (!canUseScriptJsonp()) {
        return requestFetchJsonp(url);
    }

    return new Promise((resolve, reject) => {
        const callbackName = `fundJsonp_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}`;
        const separator = url.includes("?") ? "&" : "?";
        const script = document.createElement("script");

        const cleanup = () => {
            clearTimeout(timer);
            script.remove();
            delete window[callbackName];
        };

        const timer = window.setTimeout(() => {
            cleanup();
            reject(new Error("基金搜索请求超时"));
        }, 8000);

        window[callbackName] = (data) => {
            cleanup();
            resolve(data);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error("基金搜索请求失败"));
        };
        script.src = `${url}${separator}${callbackParam}=${callbackName}`;
        document.body.appendChild(script);
    });
};

const requestFixedJsonp = (url, callbackName) => {
    if (!canUseScriptJsonp()) {
        return requestFetchJsonp(url);
    }

    const run = () =>
        new Promise((resolve, reject) => {
            const script = document.createElement("script");
            const previousCallback = window[callbackName];

            const cleanup = () => {
                clearTimeout(timer);
                script.remove();

                if (previousCallback) {
                    window[callbackName] = previousCallback;
                } else {
                    delete window[callbackName];
                }
            };

            const timer = window.setTimeout(() => {
                cleanup();
                reject(new Error("基金详情请求超时"));
            }, 8000);

            window[callbackName] = (data) => {
                cleanup();
                resolve(data);
            };

            script.onerror = () => {
                cleanup();
                reject(new Error("基金详情请求失败"));
            };
            script.src = url;
            document.body.appendChild(script);
        });

    const task = fixedJsonpQueue.then(run, run);
    fixedJsonpQueue = task.catch(() => {});
    return task;
};

const normalizeSearchItem = (item) => {
    const code = item.CODE || item.FundBaseInfo?.FCODE;
    const name = item.NAME || item.FundBaseInfo?.SHORTNAME;

    if (!item.FundBaseInfo && item.CATEGORYDESC !== "基金") return null;
    if (!CODE_PATTERN.test(code) || !name) return null;

    return {
        code,
        name,
        type: item.FundBaseInfo?.FTYPE || item.CATEGORYDESC || "",
        netValue: toNumber(item.FundBaseInfo?.DWJZ),
        dailyRate: 0,
        updateTime: item.FundBaseInfo?.FSRQ || "--",
    };
};

// 搜索基金，支持代码、名称、拼音首字母等关键词联想
export async function searchFund(keyword) {
    const key = keyword.trim();

    if (!key) return [];

    try {
        const data = await requestJsonp(
            `${SEARCH_API}?m=1&key=${encodeURIComponent(key)}`
        );

        if (!Array.isArray(data?.Datas)) return [];

        return data.Datas
            .map(normalizeSearchItem)
            .filter(Boolean)
            .slice(0, 8);
    } catch {
        return [];
    }
}

// 获取天天基金实时估值/净值
export async function getFundDetail(code) {
    if (!CODE_PATTERN.test(code)) {
        return null;
    }

    try {
        const data = await requestFixedJsonp(
            `${DETAIL_API}/${code}.js?rt=${Date.now()}`,
            "jsonpgz"
        );

        if (!data?.name) return null;

        return {
            code,
            name: data.name,
            netValue: toNumber(data.gsz || data.dwjz),
            dailyRate: toNumber(data.gszzl),
            updateTime: data.gztime?.slice(11, 16) || data.jzrq || "--",
        };
    } catch {
        return null;
    }
}
