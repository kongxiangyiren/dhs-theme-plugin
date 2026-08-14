/**
 * Browser bundle of cyberpunk-theme (static client plugin).
 * Format: window.__ModuleLoader__.load({ id, factory }) — the same bundle
 * shape every dsh.client package emits. `id` MUST equal the package name,
 * because dsh-client-modules keys its graph by the loader entry name.
 *
 * Black terminal theme: forces dark mode, pure-black background, neon green
 * (#00FF41) accents, matrix grid, top neon light bar, moving scanlines,
 * glitch jitter, and neon status dots. CSS is injected as a <style> tag
 * directly (no `styles` builtin exists for static bundles).
 */
window.__ModuleLoader__.load({
  id: "cyberpunk-theme",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    // ── Black terminal styles: grid, scanlines, glitch, status dots ──
    var CSS = `
body, button, input, textarea, select { font-family: "Cascadia Code", "JetBrains Mono", "SFMono-Regular", Consolas, "Courier New", ui-monospace, monospace; }
body { text-shadow: 0 0 4px rgba(0, 255, 65, 0.06); animation: cyb-glitch 6s steps(1, end) infinite; }
::selection { background: rgba(0, 255, 65, 0.32); color: #ffffff; }
:focus-visible { outline: 2px solid rgba(0, 255, 65, 0.80); outline-offset: 1px; box-shadow: 0 0 12px rgba(0, 255, 65, 0.35); }
button { transition: box-shadow 0.18s ease; }
button:hover { box-shadow: 0 0 10px rgba(0, 255, 65, 0.30); }
input, textarea, select { border-color: rgba(0, 255, 65, 0.22); }
input:focus, textarea:focus, select:focus { border-color: rgba(0, 255, 65, 0.60); }
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-track { background: var(--dsw-alias-bg-base); }
*::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(0, 255, 65, 0.50), rgba(0, 170, 60, 0.40)); border-radius: 6px; border: 2px solid var(--dsw-alias-bg-base); }
*::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, rgba(0, 255, 65, 0.75), rgba(0, 170, 60, 0.65)); }
/* 网格 + 暗角 + 顶部霓虹光带 + 右下角霓虹状态点（绿/黄/红指示灯） */
body::before { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 2147482990; background: linear-gradient(180deg, rgba(0, 255, 65, 0.50) 0, rgba(0, 255, 65, 0.50) 2px, rgba(0, 255, 65, 0.10) 2px, transparent 110px), radial-gradient(ellipse at center, transparent 58%, rgba(0, 0, 0, 0.30) 100%), linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.05) 1px, transparent 1px), radial-gradient(circle, rgba(0, 255, 65, 0.95) 0 3px, rgba(0, 255, 65, 0.35) 4px, transparent 6px), radial-gradient(circle, rgba(255, 176, 0, 0.95) 0 3px, rgba(255, 176, 0, 0.35) 4px, transparent 6px), radial-gradient(circle, rgba(255, 51, 85, 0.95) 0 3px, rgba(255, 51, 85, 0.35) 4px, transparent 6px); background-size: 100% 100%, 100% 100%, 36px 36px, 36px 36px, 14px 14px, 14px 14px, 14px 14px; background-position: 0 0, 0 0, 0 0, 0 0, calc(100% - 20px) 20px, calc(100% - 20px) 42px, calc(100% - 20px) 64px; background-repeat: no-repeat, no-repeat, repeat, repeat, no-repeat, no-repeat, no-repeat; animation: cyb-breathe 5s ease-in-out infinite alternate; }
/* 静态扫描线 + 缓慢下移亮线 + 偶发全屏抖动 */
body::after { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 2147483000; background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.30) 0 1px, transparent 1px 3px), linear-gradient(180deg, transparent 0 78px, rgba(0, 255, 65, 0.40) 78px 80px, transparent 80px 160px); background-size: 100% 100%, 100% 160px; opacity: 0.18; animation: cyb-scan 8s linear infinite, cyb-jitter 7s steps(1, end) infinite; }
@keyframes cyb-scan { from { background-position: 0 0, 0 -160px; } to { background-position: 0 0, 0 160px; } }
@keyframes cyb-glitch { 0%, 92%, 100% { text-shadow: 0 0 4px rgba(0, 255, 65, 0.06); } 93% { text-shadow: -1px 0 rgba(255, 0, 60, 0.50), 1px 0 rgba(0, 255, 255, 0.50), 0 0 4px rgba(0, 255, 65, 0.06); } 95% { text-shadow: 1px 0 rgba(255, 0, 60, 0.50), -1px 0 rgba(0, 255, 255, 0.50); } 97% { text-shadow: 0 0 4px rgba(0, 255, 65, 0.06); } }
@keyframes cyb-jitter { 0%, 96%, 100% { transform: none; } 97% { transform: translateX(-2px); } 98% { transform: translateX(2px); } 99% { transform: translateX(-1px); } }
@keyframes cyb-breathe { from { opacity: 0.82; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { body, body::after { animation: none; } }
`;

    var CSS_ID = "cyberpunk-theme";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"" + CSS_ID + "\"]") === null) {
      var tag = document.createElement("style");
      tag.dataset.plugin = CSS_ID;
      tag.dataset.pluginCss = CSS_ID;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    // Services this client plugin needs (Cordis inject).
    var inject = ["theme"];

    function apply(ctx) {
      // 强制深色模式，确保纯黑主题真正显示（不再跟随系统浅色偏好）
      try {
        ctx.theme.setTheme("dark");
      } catch (error) {
        console.error("setTheme failed", error);
      }

      // ── 纯黑 + 荧光绿 token overrides (light + dark) ──
      ctx.effect(() => ctx.theme.overrideTokens("cyberpunk-theme", {
        "--dsw-alias-bg-base": { light: "#f0f7f2", dark: "#000000" },
        "--dsw-alias-bg-layer-1": { light: "#ffffff", dark: "#080808" },
        "--dsw-alias-bg-layer-2": { light: "#e2efe6", dark: "#111111" },
        "--dsw-alias-bg-overlay": { light: "#ffffff", dark: "#000000" },
        "--dsw-alias-border-l1": { light: "#c3ddcc", dark: "#161616" },
        "--dsw-alias-border-l2": { light: "#8fb89c", dark: "#2a2a2a" },
        "--dsw-alias-brand-primary": { light: "#008a2e", dark: "#00ff41" },
        "--dsw-alias-label-primary": { light: "#0a150d", dark: "#d6ffe1" },
        "--dsw-alias-label-secondary": { light: "#4a6b53", dark: "#6fa77f" },
        "--dsw-alias-state-error-primary": { light: "#d61f3d", dark: "#ff3355" },
        "--dsw-alias-state-success-primary": { light: "#008a2e", dark: "#00ff41" },
        "--dsw-alias-state-warn-primary": { light: "#9a6500", dark: "#ffb000" },
        "--dsw-specific-sidebar-fill": { light: "#e2efe6", dark: "#000000" },
      }), "cyberpunk-theme: token overrides");
    }

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  },
});
