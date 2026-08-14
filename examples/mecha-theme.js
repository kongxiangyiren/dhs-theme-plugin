/**
 * Client half of mecha-theme (browser bundle).
 * Format: window.__ModuleLoader__.load({ id, factory }) — 与所有 dsh.client 包相同；
 * `id` 必须等于包名（mecha-theme）。
 *
 * 功能：机甲风格主题
 *  - 13 个 alias token 覆盖（深枪金属 + 琥珀强调，明暗双套；暗色面板半透明透出背景图）
 *  - Wikimedia 机甲概念设定图背景（固定铺满 + 25% 遮罩 + 内嵌 SVG 纹理兜底）
 *  - 滚动条/选区质感
 *  - shell.overlay 插槽注册全屏 CRT 扫描线 + 琥珀扫掠光带（pointer-events: none，
 *    尊重 prefers-reduced-motion）
 *
 * 注入说明：服务统一经 ctx.get() 获取并判空——真实 client 运行时与
 * @kongxiangyiren/dhs-theme-plugin 的 mini ctx（无 ctx.slots 直接属性）均适用。
 */
window.__ModuleLoader__.load({
  id: "mecha-theme",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");

    function apply(ctx) {
      // ── 内嵌 SVG 纹理兜底（网图加载失败时使用；data URI 编码）──
      function enc(s) {
        return s.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/ /g, "%20");
      }
      var darkSvg = "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><defs><pattern id='g' width='48' height='48' patternUnits='userSpaceOnUse'><path d='M48 0H0V48' fill='none' stroke='#2a323e' stroke-opacity='0.6'/><path d='M24 0V48' stroke='#3b4554' stroke-opacity='0.35'/></pattern><pattern id='h' width='96' height='96' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><rect width='96' height='96' fill='none'/><rect y='40' width='96' height='16' fill='#ffb020' opacity='0.10'/><rect width='96' height='3' fill='#ffb020' opacity='0.18'/></pattern><radialGradient id='gl' cx='0.5' cy='0.28' r='0.9'><stop offset='0' stop-color='#ffb020' stop-opacity='0.14'/><stop offset='1' stop-color='#0b0e12' stop-opacity='0'/></radialGradient></defs><rect width='240' height='240' fill='#0d1117'/><rect width='240' height='240' fill='url(#g)'/><rect width='240' height='240' fill='url(#h)'/><path d='M0 0H240V6H0Z' fill='#ffb020' opacity='0.15'/><rect x='176' y='176' width='64' height='64' fill='none' stroke='#ffb020' stroke-opacity='0.25'/><path d='M0 240L56 240L0 184Z' fill='#ffb020' opacity='0.08'/><rect width='240' height='240' fill='url(#gl)'/></svg>";
      var lightSvg = "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><defs><pattern id='g' width='48' height='48' patternUnits='userSpaceOnUse'><path d='M48 0H0V48' fill='none' stroke='#b6bfca' stroke-opacity='0.7'/><path d='M24 0V48' stroke='#d4dae1' stroke-opacity='0.9'/></pattern><pattern id='h' width='96' height='96' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><rect width='96' height='96' fill='none'/><rect y='40' width='96' height='16' fill='#d97b00' opacity='0.07'/><rect width='96' height='3' fill='#d97b00' opacity='0.14'/></pattern><radialGradient id='gl' cx='0.5' cy='0.28' r='0.9'><stop offset='0' stop-color='#d97b00' stop-opacity='0.08'/><stop offset='1' stop-color='#eef0f3' stop-opacity='0'/></radialGradient></defs><rect width='240' height='240' fill='#e4e8ed'/><rect width='240' height='240' fill='url(#g)'/><rect width='240' height='240' fill='url(#h)'/><path d='M0 0H240V6H0Z' fill='#d97b00' opacity='0.12'/><rect x='176' y='176' width='64' height='64' fill='none' stroke='#d97b00' stroke-opacity='0.3'/><path d='M0 240L56 240L0 184Z' fill='#d97b00' opacity='0.06'/><rect width='240' height='240' fill='url(#gl)'/></svg>";
      var photo = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Charge-concept_art-robot_01.png/1920px-Charge-concept_art-robot_01.png";

      // ── 机甲配色令牌（明暗双套；暗色面板半透明，让背景图透出）──
      var theme = ctx.get("theme");
      if (theme !== undefined) {
      ctx.effect(function () {
        return theme.overrideTokens("mecha-theme", {
          "--dsw-alias-bg-base": { light: "rgba(238, 240, 243, 0.80)", dark: "rgba(11, 14, 18, 0.45)" },
          "--dsw-alias-bg-layer-1": { light: "#f8fafc", dark: "rgba(20, 25, 34, 0.90)" },
          "--dsw-alias-bg-layer-2": { light: "#e6e9ee", dark: "rgba(28, 34, 45, 0.93)" },
          "--dsw-alias-bg-overlay": { light: "#ffffff", dark: "rgba(16, 21, 28, 0.96)" },
          "--dsw-alias-border-l1": { light: "#d4dae1", dark: "#2a323e" },
          "--dsw-alias-border-l2": { light: "#b6bfca", dark: "#3b4554" },
          "--dsw-alias-brand-primary": { light: "#d97b00", dark: "#ffb020" },
          "--dsw-alias-label-primary": { light: "#1c222b", dark: "#eef1f5" },
          "--dsw-alias-label-secondary": { light: "#5c6673", dark: "#9aa5b3" },
          "--dsw-alias-state-error-primary": { light: "#d63a2b", dark: "#ff5c4d" },
          "--dsw-alias-state-success-primary": { light: "#1f9d55", dark: "#3fdc7c" },
          "--dsw-alias-state-warn-primary": { light: "#b57600", dark: "#ffc233" },
          "--dsw-specific-sidebar-fill": { light: "#e4e8ed", dark: "#0d1117" },
        });
      }, "mecha-theme tokens");
      }

      // ── CSS 注入：style 标签打 data-dyn-theme 标，便于运行时按包清理 ──
      function injectCss(css, tagId) {
        var tag = document.createElement("style");
        tag.dataset.dynTheme = tagId;
        tag.textContent = css;
        document.head.appendChild(tag);
        return function removeTag() {
          try { tag.remove(); } catch (err) {}
        };
      }
      var css =
        "html, body { background-color: var(--dsw-alias-bg-base);" +
        " background-image: linear-gradient(rgba(236,239,243,0.35), rgba(236,239,243,0.35)), url(\"" + photo + "\"), url(\"data:image/svg+xml," + enc(lightSvg) + "\");" +
        " background-repeat: no-repeat, no-repeat, repeat; background-position: center, center, 0 0;" +
        " background-size: cover, cover, 240px 240px; background-attachment: fixed, fixed, fixed; }" +
        "@media (prefers-color-scheme: dark) { html, body {" +
        " background-image: linear-gradient(rgba(6,8,12,0.25), rgba(6,8,12,0.25)), url(\"" + photo + "\"), url(\"data:image/svg+xml," + enc(darkSvg) + "\"); } }" +
        "* { scrollbar-color: var(--dsw-alias-border-l2) var(--dsw-alias-bg-layer-1); }" +
        "::selection { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, transparent); }" +
        ".mecha-crt { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }" +
        ".mecha-crt-lines { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.055) 0 1px, transparent 1px 3px); }" +
        ".mecha-crt-sweep { position: absolute; left: 0; right: 0; top: 0; height: 160px; background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent) 45%, color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent) 50%, color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent) 55%, transparent 100%); animation: mecha-sweep 9s linear infinite; }" +
        "@keyframes mecha-sweep { 0% { transform: translateY(-30vh); } 100% { transform: translateY(130vh); } }" +
        "@media (prefers-reduced-motion: reduce) { .mecha-crt-sweep { animation: none; } }";
      ctx.effect(function () {
        return injectCss(css, "mecha-theme");
      }, "mecha-theme css");

      // ── 全屏扫描线 + 扫掠光带（shell.overlay 插槽，不挡交互）──
      var slots = ctx.get("slots");
      if (slots !== undefined) {
        slots.inject("shell.overlay", function () {
          return slots.register(
            { name: "shell.overlay", id: "mecha-scanlines" },
            function () {
              return React.createElement("div", { className: "mecha-crt" },
                React.createElement("div", { className: "mecha-crt-lines" }),
                React.createElement("div", { className: "mecha-crt-sweep" })
              );
            }
          );
        });
      }
    }

    exports.apply = apply;
    return module.exports;
  },
});
