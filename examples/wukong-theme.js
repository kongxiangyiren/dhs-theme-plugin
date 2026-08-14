// Black Myth: Wukong theme — DSH Web client theme bundle
// 黑神话悟空主题：玄墨底色、鎏金主色、朱砂/山岩点缀；明暗自适应
window.__ModuleLoader__.load({
  id: "wukong-theme",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require("react");

    // ---- token 覆盖层：13 个 --dsw-alias-* 全量覆盖，{ light, dark } 双值 ----
    var TOKENS = {
      "--dsw-alias-bg-base": { light: "rgba(244, 239, 227, 0.30)", dark: "rgba(11, 9, 8, 0.45)" },
      "--dsw-alias-bg-layer-1": { light: "#faf6ec", dark: "#141009" },
      "--dsw-alias-bg-layer-2": { light: "#eee6d4", dark: "#1c1610" },
      "--dsw-alias-bg-overlay": { light: "#fbf7ee", dark: "#19130e" },
      "--dsw-alias-border-l1": { light: "#ddd1b9", dark: "#2b2219" },
      "--dsw-alias-border-l2": { light: "#b7a37c", dark: "#4a3a28" },
      "--dsw-alias-brand-primary": { light: "#8f6b1d", dark: "#c9a24b" },
      "--dsw-alias-label-primary": { light: "#2a2119", dark: "#ece4d3" },
      "--dsw-alias-label-secondary": { light: "#6f6150", dark: "#a08f7a" },
      "--dsw-alias-state-error-primary": { light: "#a93226", dark: "#c23b22" },
      "--dsw-alias-state-success-primary": { light: "#4a7a4f", dark: "#7a9e6b" },
      "--dsw-alias-state-warn-primary": { light: "#9a6a12", dark: "#d08a2e" },
      "--dsw-specific-sidebar-fill": { light: "#efe6d2", dark: "#0f0b08" }
    };

    // ---- CSS 注入（无 styles builtin 的 mini ctx 下也能用）----
    var CSS = [
      "/* wukong-theme accents */",
      "body {",
      "  background-image: linear-gradient(rgba(11,9,8,0.25), rgba(11,9,8,0.25)), url(\"https://cdn.svipaigc.com/bizi/2024/08/202407261447063461.jpg\");",
      "  background-image: linear-gradient(color-mix(in srgb, var(--dsw-alias-bg-base) 40%, transparent), color-mix(in srgb, var(--dsw-alias-bg-base) 40%, transparent)), url(\"https://cdn.svipaigc.com/bizi/2024/08/202407261447063461.jpg\");",
      "  background-size: cover;",
      "  background-position: center;",
      "  background-attachment: fixed;",
      "}",
      "::selection { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, transparent); }",
      "*::-webkit-scrollbar { width: 10px; height: 10px; }",
      "*::-webkit-scrollbar-track { background: transparent; }",
      "*::-webkit-scrollbar-thumb {",
      "  background: color-mix(in srgb, var(--dsw-alias-border-l2) 65%, transparent);",
      "  border: 2px solid transparent;",
      "  border-radius: 6px;",
      "  background-clip: padding-box;",
      "}",
      "*::-webkit-scrollbar-thumb:hover {",
      "  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent);",
      "  border: 2px solid transparent;",
      "  border-radius: 6px;",
      "  background-clip: padding-box;",
      "}",
      ".wukong-mist { position: fixed; inset: 0; pointer-events: none; }",
      ".wukong-crown {",
      "  position: absolute; top: 0; left: 0; right: 0; height: 2px;",
      "  background: linear-gradient(90deg, transparent 0%, var(--dsw-alias-brand-primary) 25%, var(--dsw-alias-brand-primary) 75%, transparent 100%);",
      "  opacity: 0.45;",
      "}",
      ".wukong-vignette {",
      "  position: absolute; inset: 0;",
      "  background: radial-gradient(ellipse at 50% 42%, transparent 58%, rgba(0,0,0,0.14) 100%);",
      "}"
    ].join("\n");

    function injectCss(css, tagId) {
      var tag = document.createElement("style");
      tag.dataset.dynTheme = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
      return function removeTag() {
        try { tag.remove(); } catch (err) {}
      };
    }

    function apply(ctx) {
      // 1) token 覆盖层：统一 ctx.get() + 判空，返回 disposer
      var theme = ctx.get("theme");
      if (theme !== undefined) {
        ctx.effect(function () {
          return theme.overrideTokens("wukong-theme", TOKENS);
        });
      }

      // 2) 氛围 CSS：包在 ctx.effect 内，返回 disposer
      ctx.effect(function () {
        return injectCss(CSS, "wukong-theme");
      });

      // 3) 全屏氛围浮层：shell.overlay 是 list 槽，注册自定义 id
      var slots = ctx.get("slots");
      if (slots !== undefined) {
        slots.inject("shell.overlay", function () {
          return slots.register(
            { name: "shell.overlay", id: "wukong-mist" },
            function () {
              return React.createElement("div", { className: "wukong-mist" },
                React.createElement("div", { className: "wukong-crown" }),
                React.createElement("div", { className: "wukong-vignette" })
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
