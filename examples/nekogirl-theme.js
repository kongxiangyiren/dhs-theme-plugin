/**
 * Browser bundle of nekogirl-theme (static client plugin).
 * Format: window.__ModuleLoader__.load({ id, factory }) — the same bundle
 * shape every dsh.client package emits. `id` MUST equal the package name,
 * because dsh-client-modules keys its graph by the loader entry name.
 *
 * React comes from the seed module table (dsh-client-web's getStaticModules
 * seeds "react"); CSS is injected as a <style> tag directly (no `styles`
 * builtin exists for static bundles).
 */
window.__ModuleLoader__.load({
  id: "nekogirl-theme",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");

    // ── Catgirl styles: ears, petals, animations, rounded pills ──
    var CSS = `
      .nk-paw {
        display: inline-flex; align-items: center; gap: 6px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        border-radius: 999px; padding: 4px 10px; font-size: 12px;
        cursor: pointer; white-space: nowrap;
        transition: transform .15s ease, background .2s ease, box-shadow .2s ease;
      }
      .nk-paw:hover { transform: translateY(-1px); background: var(--dsw-alias-bg-layer-2); box-shadow: 0 2px 10px rgba(255,76,149,.4); }
      .nk-paw:active { transform: scale(.94); }
      .nk-paw-meow { min-width: 56px; text-align: left; animation: nkPop .35s ease; }
      .nk-paw-tail { display: inline-block; transform-origin: 10% 90%; animation: nkTailWag 1.4s ease-in-out infinite; }

      .nk-badge {
        display: inline-flex; align-items: center; gap: 5px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        border-radius: 999px; padding: 3px 10px; font-size: 12px;
        user-select: none; white-space: nowrap;
        box-shadow: 0 1px 4px rgba(255,76,149,.18);
      }
      .nk-badge-ear { display: inline-block; transform-origin: 50% 20%; animation: nkEarWiggle 2.2s ease-in-out infinite; }
      .nk-badge-tail { display: inline-block; transform-origin: 10% 90%; animation: nkTailWag 1.2s ease-in-out infinite; }

      /* Top cat ears (overlay, click-through) */
      .nk-ear {
        position: fixed; top: 0; width: 72px; height: 96px;
        background: linear-gradient(160deg, #FF9FC9, #FF4C95);
        clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
        pointer-events: none;
        transform-origin: 50% 100%;
        animation: nkEarWiggle 4s ease-in-out infinite;
      }
      .nk-ear::after {
        content: ''; position: absolute; left: 50%; top: 34%;
        transform: translateX(-50%);
        width: 30px; height: 46px;
        background: #FFD0E4;
        clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
      }
      .nk-ear-left { left: 22px; border-radius: 0 0 14px 14px; }
      .nk-ear-right { right: 22px; border-radius: 0 0 14px 14px; animation-delay: .4s; }

      /* Falling sakura petals */
      .nk-petals {
        position: fixed; inset: 0;
        pointer-events: none; overflow: hidden; z-index: 880;
      }
      .nk-petal {
        position: absolute; top: -44px;
        font-size: 18px; opacity: 0;
        animation: nkFall 11s linear infinite;
      }

      /* Input-box cat */
      .nk-input-cat {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 16px; line-height: 1;
        cursor: pointer; user-select: none;
        border-radius: 999px; padding: 2px 6px;
        transition: transform .15s ease, background .2s ease;
      }
      .nk-input-cat:hover { transform: scale(1.12) rotate(-4deg); background: var(--dsw-alias-bg-layer-1); }
      .nk-input-cat:active { transform: scale(.95); }
      .nk-input-cat-face { display: inline-block; transform-origin: 50% 80%; animation: nkCatBob 2.4s ease-in-out infinite; }
      .nk-input-cat-meow { font-size: 11px; color: var(--dsw-alias-label-secondary); animation: nkPop .3s ease; }
      @keyframes nkCatBob { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-2px) rotate(6deg); } }

      @keyframes nkFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        8% { opacity: .85; }
        92% { opacity: .7; }
        100% { transform: translateY(106vh) rotate(340deg); opacity: 0; }
      }
      @keyframes nkPop { from { opacity: 0; transform: translateY(4px) scale(.92); } to { opacity: 1; transform: none; } }
      @keyframes nkEarWiggle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-9deg); } }
      @keyframes nkTailWag { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(16deg); } }
    `;

    var CSS_ID = "nekogirl-theme";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"" + CSS_ID + "\"]") === null) {
      var tag = document.createElement("style");
      tag.dataset.plugin = CSS_ID;
      tag.dataset.pluginCss = CSS_ID;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    // Services this client plugin needs (Cordis inject).
    var inject = ["slots", "theme"];

    function apply(ctx) {
      // ── 1. #FF4C95 pink token overrides (light + dark) ──
      ctx.effect(() => ctx.theme.overrideTokens("nekogirl-theme", {
        "--dsw-alias-bg-base": { light: "#FFF0F6", dark: "#241A22" },
        "--dsw-alias-bg-layer-1": { light: "#FFE4F0", dark: "#2E212B" },
        "--dsw-alias-bg-layer-2": { light: "#FFD8E8", dark: "#382833" },
        "--dsw-alias-bg-overlay": { light: "#FFF5FA", dark: "#2A1F27" },
        "--dsw-alias-border-l1": { light: "#F6C4D8", dark: "#4A3443" },
        "--dsw-alias-border-l2": { light: "#F0A8C4", dark: "#5A4051" },
        "--dsw-alias-brand-primary": { light: "#FF4C95", dark: "#FF6DA6" },
        "--dsw-alias-label-primary": { light: "#3D2431", dark: "#F7E8EF" },
        "--dsw-alias-label-secondary": { light: "#7A5568", dark: "#C9A8BC" },
        "--dsw-alias-state-error-primary": { light: "#E57373", dark: "#F09090" },
        "--dsw-alias-state-success-primary": { light: "#81C784", dark: "#A5D6A7" },
        "--dsw-alias-state-warn-primary": { light: "#FFB74D", dark: "#FFCC80" },
        "--dsw-specific-sidebar-fill": { light: "#FFD9E8", dark: "#2B1E28" },
      }), "nekogirl-theme: token overrides");

      var slots = ctx.get("slots");
      if (slots === undefined) return;

      // ── 3. Sidebar footer paw button (click for cat-speak) ──
      slots.inject("sidebar.footer.action", () => slots.register(
        { name: "sidebar.footer.action", id: "nekogirl-paw", order: 10, label: "喵酱" },
        (props) => {
          var wide = Boolean(props && props.wide);
          var lines = ["喵~!", "喵喵?", "主人好呀 ฅ•ω•ฅ", "nya~", "想被摸摸头…", "今天也元气满满喵!"];
          var _a = React.useState(0), idx = _a[0], setIdx = _a[1];
          return React.createElement(
            "button",
            {
              className: "nk-paw",
              title: "喵酱 ฅ•ω•ฅ 点击有惊喜",
              onClick: function () { setIdx(function (i) { return (i + 1) % lines.length; }); },
            },
            React.createElement("span", { className: "nk-paw-tail" }, "🐾"),
            wide ? React.createElement("span", null, "喵酱") : null,
            wide ? React.createElement("span", { className: "nk-paw-meow", key: idx }, lines[idx]) : null,
          );
        },
      ));

      // ── 4. Session header "喵酱在线" badge ──
      slots.inject("conversation.session.header.utilities", () => slots.register(
        { name: "conversation.session.header.utilities", id: "nekogirl-badge", order: 10, label: "喵酱在线" },
        function () {
          return React.createElement(
            "span",
            { className: "nk-badge", title: "喵酱在线 ฅ•ω•ฅ" },
            React.createElement("span", { className: "nk-badge-ear" }, "🐱"),
            React.createElement("span", null, "喵酱在线"),
            React.createElement("span", { className: "nk-badge-tail" }, "🐾"),
          );
        },
      ));

      // ── 5. Top cat ears (frame overlay) ──
      slots.inject("shell.overlay", function () {
        return slots.register(
          { name: "shell.overlay", id: "nekogirl-ears", order: -100 },
          function () {
            return React.createElement(
              "div",
              null,
              React.createElement("div", { className: "nk-ear nk-ear-left" }),
              React.createElement("div", { className: "nk-ear nk-ear-right" }),
            );
          },
        );
      });

      // ── 6. Falling sakura petals (frame overlay, click-through) ──
      slots.inject("shell.overlay", function () {
        return slots.register(
          { name: "shell.overlay", id: "nekogirl-petals", order: -90 },
          function () {
            return React.createElement(
              "div",
              { className: "nk-petals" },
              Array.from({ length: 6 }, function (_, i) {
                return React.createElement(
                  "span",
                  {
                    className: "nk-petal",
                    key: i,
                    style: {
                      left: (6 + i * 16) + "%",
                      animationDelay: (i * 1.8) + "s",
                      animationDuration: (9 + (i % 3) * 2) + "s",
                      fontSize: (14 + (i % 3) * 4) + "px",
                    },
                  },
                  "🌸",
                );
              }),
            );
          },
        );
      });

      // ── 7. Input-box cat (top-right of composer, meows on click) ──
      slots.inject("conversation.input.right", function () {
        return slots.register(
          { name: "conversation.input.right", id: "nekogirl-input-cat", order: 10, label: "猫猫" },
          function () {
            var meows = ["喵~", "喵喵!", "ฅ•ω•ฅ", "nya~", "喵喵喵~"];
            var _a = React.useState(-1), idx = _a[0], setIdx = _a[1];
            return React.createElement(
              "span",
              {
                className: "nk-input-cat",
                title: "喵酱的猫猫 ฅ•ω•ฅ 戳我喵!",
                onClick: function () { setIdx(function (i) { return (i + 1) % meows.length; }); },
              },
              React.createElement("span", { className: "nk-input-cat-face" }, "🐱"),
              idx >= 0
                ? React.createElement("span", { className: "nk-input-cat-meow", key: idx }, meows[idx])
                : null,
            );
          },
        );
      });
    }

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  },
});
