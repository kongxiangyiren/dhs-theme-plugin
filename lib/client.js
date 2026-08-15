/**
 * Browser bundle of @kongxiangyiren/dhs-theme-plugin (static client plugin).
 * Format: window.__ModuleLoader__.load({ id, factory }) — the same bundle
 * shape every dsh.client package emits. `id` MUST equal the package name.
 *
 * 功能：设置 → 主题 大分类
 *  - 内置主题：森林绿 / 海洋蓝（token + 质感特效 CSS）
 *  - 上传自定义 JS 主题（__ModuleLoader__.load 格式，overrideTokens/CSS/slots），无大小限制
 *  - 主列表点击切换，同一时刻只有一个主题生效
 *  - 主题以独立 .js 文件存储（Host 路由 /api/theme-plugin），换浏览器不丢
 */
window.__ModuleLoader__.load({
  id: "@kongxiangyiren/dhs-theme-plugin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");

    // ── 持久化：Host 磁盘。GET 元数据、GET 单个主题源码、POST 保存 ──
    function fetchMeta(callback) {
      fetch("/api/theme-plugin")
        .then(function (res) { return res.json(); })
        .then(function (data) {
          callback({
            themes: Array.isArray(data && data.themes) ? data.themes : [],
            selected: data && typeof data.selected === "string" ? data.selected : null,
          });
        })
        .catch(function (err) {
          console.error("load themes failed", err);
          callback({ themes: [], selected: null });
        });
    }

    function fetchSource(id, callback) {
      fetch("/api/theme-plugin/source?id=" + encodeURIComponent(id))
        .then(function (res) { return res.json(); })
        .then(function (data) {
          callback(data && data.ok && typeof data.source === "string" ? data.source : null);
        })
        .catch(function (err) {
          console.error("load theme source failed: " + id, err);
          callback(null);
        });
    }

    function saveAll(themes, selected) {
      fetch("/api/theme-plugin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themes: themes || [], selected: selected || null }),
      }).catch(function (err) {
        console.error("save themes failed", err);
      });
    }

    // ── CSS 注入：打标 + 可移除 ──
    function injectCss(css, id) {
      var tag = document.createElement("style");
      tag.dataset.pluginCss = id;
      tag.dataset.dynTheme = id;
      tag.textContent = css;
      document.head.appendChild(tag);
      return function removeTag() {
        try { tag.remove(); } catch (err) {}
      };
    }

    function removeTagsFor(id) {
      try {
        var tags = document.querySelectorAll('style[data-plugin-css="' + id + '"], style[data-dyn-theme="' + id + '"]');
        for (var i = 0; i < tags.length; i++) tags[i].remove();
      } catch (err) {
        console.error("remove style tags failed: " + id, err);
      }
    }

    // ── 内置主题 ──
    var CUSTOM_THEMES = [
      {
        id: "forest",
        label: "森林绿",
        colorScheme: "dark",
        tokens: {
          "--dsw-alias-bg-base": { light: "#eef5e7", dark: "#0d1f14" },
          "--dsw-alias-bg-layer-1": { light: "#e2ecd9", dark: "#12291a" },
          "--dsw-alias-bg-layer-2": { light: "#d6e4ca", dark: "#173522" },
          "--dsw-alias-bg-overlay": { light: "#f6faf1", dark: "#0b1a11" },
          "--dsw-alias-border-l1": { light: "#bcd3a8", dark: "#21492e" },
          "--dsw-alias-border-l2": { light: "#9dbb85", dark: "#2f6b41" },
          "--dsw-alias-brand-primary": { light: "#15803d", dark: "#34d399" },
          "--dsw-alias-label-primary": { light: "#14261a", dark: "#e6f8ec" },
          "--dsw-alias-label-secondary": { light: "#5d7a63", dark: "#8fc3a0" },
          "--dsw-alias-state-error-primary": { light: "#dc2626", dark: "#f87171" },
          "--dsw-alias-state-success-primary": { light: "#16a34a", dark: "#34d399" },
          "--dsw-alias-state-warn-primary": { light: "#d97706", dark: "#fbbf24" },
          "--dsw-specific-sidebar-fill": { light: "#e8f1df", dark: "#091710" },
        },
      },
      {
        id: "ocean",
        label: "海洋蓝",
        colorScheme: "dark",
        tokens: {
          "--dsw-alias-bg-base": { light: "#eaf2fb", dark: "#0a1628" },
          "--dsw-alias-bg-layer-1": { light: "#dde9f7", dark: "#0e2038" },
          "--dsw-alias-bg-layer-2": { light: "#d0e2f3", dark: "#122a4a" },
          "--dsw-alias-bg-overlay": { light: "#f4f9fd", dark: "#081322" },
          "--dsw-alias-border-l1": { light: "#b4cde8", dark: "#20406b" },
          "--dsw-alias-border-l2": { light: "#93b8dd", dark: "#2e5f9c" },
          "--dsw-alias-brand-primary": { light: "#0369a1", dark: "#38bdf8" },
          "--dsw-alias-label-primary": { light: "#0d2540", dark: "#e6f2fd" },
          "--dsw-alias-label-secondary": { light: "#4d7098", dark: "#94b6d9" },
          "--dsw-alias-state-error-primary": { light: "#dc2626", dark: "#f87171" },
          "--dsw-alias-state-success-primary": { light: "#059669", dark: "#2dd4bf" },
          "--dsw-alias-state-warn-primary": { light: "#d97706", dark: "#fbbf24" },
          "--dsw-specific-sidebar-fill": { light: "#e3eef9", dark: "#071124" },
        },
      },
    ];

    var THEME_CSS = {
      forest: [
        "body{text-shadow:0 0 6px rgba(52,211,153,0.08)}",
        "::selection{background:rgba(52,211,153,0.4);color:#04120a}",
        ":focus-visible{outline:2px solid rgba(52,211,153,0.85);outline-offset:1px;box-shadow:0 0 16px rgba(52,211,153,0.4)}",
        "*::-webkit-scrollbar{width:10px;height:10px}",
        "*::-webkit-scrollbar-track{background:var(--dsw-alias-bg-base)}",
        "*::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(52,211,153,0.6),rgba(21,128,61,0.45));border-radius:6px;border:2px solid var(--dsw-alias-bg-base)}",
        "*::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,rgba(52,211,153,0.8),rgba(21,128,61,0.7))}",
        'body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147482990;background:linear-gradient(180deg,rgba(52,211,153,0.55) 0 2px,rgba(52,211,153,0.12) 2px,transparent 110px),radial-gradient(1100px 550px at 20% -10%,rgba(52,211,153,0.20),transparent 60%),radial-gradient(900px 450px at 110% 30%,rgba(34,197,94,0.16),transparent 55%),radial-gradient(800px 600px at 50% 120%,rgba(16,185,129,0.12),transparent 60%),linear-gradient(rgba(52,211,153,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(52,211,153,0.05) 1px,transparent 1px);background-size:100% 110px,100% 100%,100% 100%,100% 100%,44px 44px,44px 44px;background-repeat:no-repeat,no-repeat,no-repeat,no-repeat,repeat,repeat;animation:dsh-forest-breathe 7s ease-in-out infinite alternate}',
        'body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483000;background:radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.28) 100%)}',
        "@keyframes dsh-forest-breathe{from{opacity:0.8}to{opacity:1}}",
        "@media (prefers-reduced-motion: reduce){body::before{animation:none}}",
      ].join(""),
      ocean: [
        "body{text-shadow:0 0 6px rgba(56,189,248,0.08)}",
        "::selection{background:rgba(56,189,248,0.4);color:#04101f}",
        ":focus-visible{outline:2px solid rgba(56,189,248,0.85);outline-offset:1px;box-shadow:0 0 16px rgba(56,189,248,0.4)}",
        "*::-webkit-scrollbar{width:10px;height:10px}",
        "*::-webkit-scrollbar-track{background:var(--dsw-alias-bg-base)}",
        "*::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(56,189,248,0.6),rgba(2,132,199,0.45));border-radius:6px;border:2px solid var(--dsw-alias-bg-base)}",
        "*::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,rgba(56,189,248,0.8),rgba(2,132,199,0.7))}",
        'body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147482990;background:linear-gradient(180deg,rgba(56,189,248,0.55) 0 2px,rgba(56,189,248,0.12) 2px,transparent 110px),radial-gradient(1100px 550px at 15% -10%,rgba(56,189,248,0.20),transparent 60%),radial-gradient(900px 500px at 105% 25%,rgba(59,130,246,0.16),transparent 55%),radial-gradient(800px 600px at 50% 125%,rgba(99,102,241,0.12),transparent 60%),repeating-linear-gradient(180deg,rgba(96,165,250,0.05) 0 1px,transparent 1px 4px);background-size:100% 110px,100% 100%,100% 100%,100% 100%,100% 100%;background-repeat:no-repeat,no-repeat,no-repeat,no-repeat,repeat;animation:dsh-ocean-breathe 7s ease-in-out infinite alternate}',
        'body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483000;background:radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.28) 100%)}',
        "@keyframes dsh-ocean-breathe{from{opacity:0.8}to{opacity:1}}",
        "@media (prefers-reduced-motion: reduce){body::before{animation:none}}",
      ].join(""),
    };

    var PAGE_CSS = [
      ".dsh-theme-page{display:flex;flex-direction:column;gap:16px;padding:4px 2px;color:var(--dsw-alias-label-primary)}",
      ".dsh-theme-page-title{margin:0;font-size:16px;font-weight:600;color:var(--dsw-alias-label-primary)}",
      ".dsh-theme-options{display:flex;flex-direction:column;gap:6px}",
      ".dsh-theme-option{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;font-size:14px;text-align:left;width:100%}",
      ".dsh-theme-option:hover{border-color:var(--dsw-alias-border-l2)}",
      ".dsh-theme-option-active{border-color:var(--dsw-alias-brand-primary);outline:1px solid var(--dsw-alias-brand-primary)}",
      ".dsh-theme-swatch{width:22px;height:22px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);flex:none}",
      ".dsh-theme-option-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dsh-theme-option-check{color:var(--dsw-alias-brand-primary);font-weight:700}",
      ".dsh-theme-upload{display:flex;flex-direction:column;gap:8px}",
      ".dsh-theme-upload-head{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:14px;color:var(--dsw-alias-label-secondary)}",
      ".dsh-theme-btn{padding:6px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);cursor:pointer;font-size:13px}",
      ".dsh-theme-btn:hover{border-color:var(--dsw-alias-border-l2)}",
      ".dsh-theme-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}",
      ".dsh-theme-format{font-size:12px;color:var(--dsw-alias-label-secondary)}",
      ".dsh-theme-format pre{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:6px;padding:8px;overflow:auto;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary)}",
      ".dsh-theme-note{font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary)}",
      ".dsh-theme-mine{display:flex;flex-direction:column;gap:6px}",
      ".dsh-theme-mine-title{font-size:14px;color:var(--dsw-alias-label-secondary)}",
      ".dsh-theme-mine-row{display:flex;align-items:center;gap:10px;padding:6px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-size:14px}",
      ".dsh-theme-msg{padding:8px 10px;border-radius:6px;font-size:13px}",
      ".dsh-theme-msg-error{color:var(--dsw-alias-state-error-primary);border:1px solid var(--dsw-alias-state-error-primary)}",
      ".dsh-theme-msg-ok{color:var(--dsw-alias-state-success-primary);border:1px solid var(--dsw-alias-state-success-primary)}",
    ].join("");

    var BASE_LABELS = { system: "跟随系统", light: "浅色", dark: "深色", forest: "森林绿", ocean: "海洋蓝" };
    var RESERVED = ["system", "light", "dark"];

    var inject = ["theme", "slots"];

    function apply(ctx) {
      var theme = ctx.theme;
      var slots = ctx.slots;

      var cleanups = [];
      var registrations = new Map();
      var jsThemes = new Map();
      var jsOrder = [];
      var sourceCache = new Map();

      CUSTOM_THEMES.forEach(function (def) {
        try {
          registrations.set(def.id, theme.register({ id: def.id, colorScheme: def.colorScheme, tokens: def.tokens }));
        } catch (err) {
          console.error("theme register failed: " + def.id, err);
        }
      });

      var cssDisposer = null;
      var cssThemeId = null;
      function syncThemeCss() {
        var id = theme.getTheme().active.id;
        if (id === cssThemeId) return;
        if (cssDisposer) {
          try { cssDisposer(); } catch (err) {}
          cssDisposer = null;
        }
        cssThemeId = id;
        var css = THEME_CSS[id];
        if (css) cssDisposer = injectCss(css, id);
      }
      syncThemeCss();
      ctx.on("theme/change", syncThemeCss);

      var pageCssDisposer = injectCss(PAGE_CSS, "theme-plugin-page");
      cleanups.push(pageCssDisposer);

      function readPreference(snapshot) {
        if (snapshot && typeof snapshot.preference === "string") return snapshot.preference;
        if (snapshot && snapshot.active && typeof snapshot.active.id === "string") return snapshot.active.id;
        return "system";
      }

      // 源码获取（带缓存）：上传/切换/恢复时按需从 Host 拉取主题 .js 文件
      function ensureSource(id, callback) {
        if (sourceCache.has(id)) {
          callback(sourceCache.get(id));
          return;
        }
        fetchSource(id, function (src) {
          if (src === null) {
            callback(null);
            return;
          }
          sourceCache.set(id, src);
          callback(src);
        });
      }

      // 收集页面中带 data-plugin-css 的样式标签（前后差量追踪主题注入的 CSS）
      function collectCssTags() {
        try {
          var tags = document.querySelectorAll("style[data-plugin-css]");
          return Array.prototype.slice.call(tags);
        } catch (err) {
          return [];
        }
      }

      // ── 执行上传的 JS 主题（格式：window.__ModuleLoader__.load({ id, factory })）──
      // 直接使用真实 document / window：Proxy 包装的 DOM 节点无法通过
      // MutationObserver.observe / ResizeObserver.observe 等 WebIDL 参数检查；
      // 主题注入的 <style> 标签改用执行前后的快照差量追踪。
      function executeThemeSource(source) {
        var captured = null;
        var fakeWindow = new Proxy(window, {
          get: function (target, prop) {
            if (prop === "__ModuleLoader__") {
              return {
                load: function (entry) { captured = entry; },
              };
            }
            var value = Reflect.get(target, prop, target);
            if (typeof value === "function") return value.bind(target);
            return value;
          },
        });
        var run = new Function("window", "document", "console", source);
        run(fakeWindow, document, console);
        if (!captured || typeof captured.factory !== "function") {
          throw new Error("格式不正确：没有找到 window.__ModuleLoader__.load({ id, factory })");
        }
        var beforeTags = collectCssTags();
        var requireStub = function (name) {
          if (name === "react") return React;
          throw new Error('主题文件内暂不支持的 require("' + name + '")（目前仅支持 react）');
        };
        var mod = captured.factory(requireStub);
        var afterTags = collectCssTags();
        var trackedTags = [];
        for (var i = 0; i < afterTags.length; i++) {
          if (beforeTags.indexOf(afterTags[i]) < 0) trackedTags.push(afterTags[i]);
        }
        var plugin = (mod && typeof mod === "object" && typeof mod.apply === "function")
          ? mod
          : (typeof mod === "function" ? mod : null);
        if (!plugin || typeof plugin.apply !== "function") {
          throw new Error("主题必须导出 apply(ctx)");
        }
        var id = typeof captured.id === "string" && captured.id.trim()
          ? captured.id.trim()
          : "custom-theme-" + Date.now().toString(36);
        return { id: id, plugin: plugin, tags: trackedTags };
      }

      // 给主题的 apply 提供迷你 ctx
      function buildThemeCtx() {
        var disposers = [];
        var timer = ctx.get("timer");
        var slotsService = ctx.get("slots");

        var wrappedSlots = undefined;
        if (slotsService !== undefined) {
          wrappedSlots = new Proxy(slotsService, {
            get: function (target, prop) {
              var value = Reflect.get(target, prop, target);
              if (prop === "inject") {
                return function (key, callback) {
                  var off = Reflect.apply(value, target, [key, function () {
                    var dispose = callback();
                    if (typeof dispose === "function") disposers.push(dispose);
                    return dispose;
                  }]);
                  disposers.push(off);
                  return off;
                };
              }
              if (typeof value !== "function") return value;
              return function () {
                var result = Reflect.apply(value, target, arguments);
                if (typeof result === "function") disposers.push(result);
                return result;
              };
            },
          });
        }

        var mini = {
          theme: theme,
          effect: function (fn) {
            var r = fn();
            if (typeof r === "function") disposers.push(r);
          },
          on: function (name, listener) {
            var off = ctx.on(name, listener);
            disposers.push(off);
            return off;
          },
          once: function (name, listener) {
            var off = ctx.once(name, listener);
            disposers.push(off);
            return off;
          },
          timeout: function (cb, ms) {
            if (!timer) throw new Error("timer 不可用");
            var off = timer.timeout(cb, ms);
            disposers.push(off);
            return off;
          },
          interval: function (cb, ms) {
            if (!timer) throw new Error("timer 不可用");
            var off = timer.interval(cb, ms);
            disposers.push(off);
            return off;
          },
          get: function (name) {
            if (name === "theme") return theme;
            if (name === "slots") return wrappedSlots;
            if (name === "timer") return timer;
            return undefined;
          },
          provide: function () { return function () {}; },
          console: console,
        };
        return { mini: mini, disposers: disposers };
      }

      function disposeEntry(entry) {
        for (var i = 0; i < entry.disposers.length; i++) {
          try { entry.disposers[i](); } catch (err) { console.error("dispose theme effect failed: " + entry.id, err); }
        }
        entry.disposers = [];
        for (var j = 0; j < (entry.tags || []).length; j++) {
          try { entry.tags[j].remove(); } catch (err) { console.error("remove theme style tag failed: " + entry.id, err); }
        }
        entry.tags = [];
        removeTagsFor(entry.id);
      }

      function applyJsTheme(entry) {
        var existing = jsThemes.get(entry.id);
        if (existing) disposeEntry(existing);
        removeTagsFor(entry.id);
        var executed = executeThemeSource(entry.source);
        var built = buildThemeCtx();
        try {
          executed.plugin.apply(built.mini);
        } catch (err) {
          for (var i = 0; i < built.disposers.length; i++) {
            try { built.disposers[i](); } catch (e) {}
          }
          for (var j = 0; j < executed.tags.length; j++) {
            try { executed.tags[j].remove(); } catch (e) {}
          }
          throw err;
        }
        entry.disposers = built.disposers;
        entry.tags = executed.tags;
        entry.active = true;
        jsThemes.set(entry.id, entry);
        var pos = jsOrder.indexOf(entry.id);
        if (pos >= 0) jsOrder.splice(pos, 1);
        jsOrder.push(entry.id);
        for (var k = 0; k < built.disposers.length; k++) cleanups.push(built.disposers[k]);
        return entry;
      }

      // 纯停用：只回收效果并从登记表移除
      function stopJsTheme(id) {
        var entry = jsThemes.get(id);
        if (entry) disposeEntry(entry);
        jsThemes.delete(id);
        var pos = jsOrder.indexOf(id);
        if (pos >= 0) jsOrder.splice(pos, 1);
        removeTagsFor(id);
      }

      // 启动恢复：清扫旧标签，只应用最后一个启用主题（源码按需拉取）
      function restoreUploaded() {
        fetchMeta(function (stored) {
          for (var i = 0; i < stored.themes.length; i++) removeTagsFor(stored.themes[i].id);
          var actives = stored.themes.filter(function (e) { return e.active !== false; });
          var last = actives[actives.length - 1];
          if (last) {
            ensureSource(last.id, function (source) {
              if (source === null) {
                console.error("restore source missing: " + last.id);
                return;
              }
              try {
                applyJsTheme({ id: last.id, name: last.name, source: source, active: true, disposers: [], tags: [] });
              } catch (err) {
                console.error("restore js theme failed: " + last.id, err);
              }
            });
          }
          if (typeof stored.selected === "string" && RESERVED.indexOf(stored.selected) < 0 && registrations.has(stored.selected)) {
            try { theme.setTheme(stored.selected); } catch (err) {}
          }
        });
      }
      restoreUploaded();

      function ThemePage() {
        var _a = React.useState(function () {
          try { return readPreference(theme.getTheme()); } catch (err) { return "system"; }
        });
        var current = _a[0];
        var setCurrent = _a[1];
        var _b = React.useState([]);
        var entries = _b[0];
        var setEntries = _b[1];
        var _c = React.useState(null);
        var message = _c[0];
        var setMessage = _c[1];
        var fileRef = React.useRef(null);

        React.useEffect(function () {
          var off = ctx.on("theme/change", function (snapshot) { setCurrent(readPreference(snapshot)); });
          return off;
        }, []);

        React.useEffect(function () {
          var alive = true;
          fetchMeta(function (stored) {
            if (alive) setEntries(stored.themes);
          });
          return function () { alive = false; };
        }, []);

        function label(id) {
          var hit = null;
          for (var i = 0; i < entries.length; i++) if (entries[i].id === id) { hit = entries[i]; break; }
          return BASE_LABELS[id] || (hit ? hit.name : id);
        }

        // 两阶段切换：先彻底清除当前应用的所有上传主题，再加载目标主题
        function switchJsTheme(id) {
          var entry = null;
          for (var i = 0; i < entries.length; i++) if (entries[i].id === id) { entry = entries[i]; break; }
          if (!entry) return;
          if (jsThemes.has(id) && jsOrder[jsOrder.length - 1] === id) {
            setMessage({ type: "ok", text: '主题 "' + id + '" 已在应用中' });
            return;
          }
          ensureSource(id, function (source) {
            if (source === null) {
              setMessage({ type: "error", text: '主题文件读取失败："' + id + '"' });
              return;
            }
            var activeIds = jsOrder.slice();
            for (var j = 0; j < activeIds.length; j++) stopJsTheme(activeIds[j]);
            try {
              applyJsTheme({ id: entry.id, name: entry.name, source: source, active: true, disposers: [], tags: [] });
              var next = entries.map(function (en) { return Object.assign({}, en, { active: en.id === id }); });
              setEntries(next);
              setMessage({ type: "ok", text: '已切换到主题 "' + id + '"' });
              saveAll(next, current);
            } catch (err) {
              setMessage({ type: "error", text: "应用失败：" + String(err && err.message || err) });
            }
          });
        }

        function pick(id) {
          var isJs = false;
          for (var i = 0; i < entries.length; i++) if (entries[i].id === id) { isJs = true; break; }
          if (isJs) {
            switchJsTheme(id);
            return;
          }
          theme.setTheme(id);
          var next = entries;
          var activeIds = jsOrder.slice();
          for (var j = 0; j < activeIds.length; j++) stopJsTheme(activeIds[j]);
          if (activeIds.length > 0) {
            next = entries.map(function (en) { return Object.assign({}, en, { active: false }); });
            setEntries(next);
            setMessage({ type: "ok", text: "已切换到" + label(id) + "，并自动停用 " + activeIds.length + " 个已上传主题" });
          }
          var selected = RESERVED.indexOf(id) >= 0 ? null : id;
          saveAll(next, selected);
        }

        function onFile(e) {
          var file = e.target.files && e.target.files[0];
          e.target.value = "";
          if (!file) return;
          if (!/\.js$/i.test(file.name)) {
            setMessage({ type: "error", text: "请选择 .js 文件（主题脚本），当前选择：" + file.name });
            return;
          }
          var reader = new FileReader();
          reader.onload = function () {
            var source = String(reader.result);
            try {
              var executed = executeThemeSource(source);
              var id = executed.id;
              if (RESERVED.indexOf(id) >= 0) {
                setMessage({ type: "error", text: 'id "' + id + '" 与内置主题冲突' });
                return;
              }
              var exists = jsThemes.has(id);
              if (!exists) {
                for (var i = 0; i < entries.length; i++) if (entries[i].id === id) { exists = true; break; }
              }
              if (exists) {
                setMessage({ type: "error", text: '主题 "' + id + '" 已存在，点击上方列表即可切换应用；如需更新请先删除再上传' });
                return;
              }
              var entry = { id: id, name: id, source: source, active: true, disposers: [], tags: [] };
              applyJsTheme(entry);
              sourceCache.set(id, source);
              var next = entries.concat([{ id: id, name: id, active: true, source: source }]);
              setEntries(next);
              setMessage({ type: "ok", text: '已上传并应用主题 "' + id + '"（JS 主题直接执行，请确认来源可信）' });
              saveAll(next, current);
            } catch (err) {
              setMessage({ type: "error", text: "主题加载失败：" + String(err && err.message || err) });
            }
          };
          reader.onerror = function () { setMessage({ type: "error", text: "文件读取失败" }); };
          reader.readAsText(file);
        }

        function remove(id) {
          var entry = jsThemes.get(id);
          if (entry) disposeEntry(entry);
          jsThemes.delete(id);
          var pos = jsOrder.indexOf(id);
          if (pos >= 0) jsOrder.splice(pos, 1);
          sourceCache.delete(id);
          var next = entries.filter(function (en) { return en.id !== id; });
          setEntries(next);
          if (jsOrder.length > 0) {
            var lastId = jsOrder[jsOrder.length - 1];
            ensureSource(lastId, function (source) {
              if (source === null) return;
              try {
                applyJsTheme({ id: lastId, name: lastId, source: source, active: true, disposers: [], tags: [] });
              } catch (err) {}
            });
          }
          saveAll(next, current);
        }

        var snapshot = theme.getTheme();
        var registeredIds = snapshot.themes.map(function (t) { return t.id; });
        var optionIds = ["system"].concat(registeredIds, entries.map(function (en) { return en.id; }));
        var hasJsActive = jsThemes.size > 0;

        function swatch(id) {
          if (id === "system") return "linear-gradient(135deg,#ffffff 50%,#1e1e1e 50%)";
          if (id === "light") return "#ffffff";
          if (id === "dark") return "#1e1e1e";
          var def = null;
          for (var i = 0; i < snapshot.themes.length; i++) if (snapshot.themes[i].id === id) { def = snapshot.themes[i]; break; }
          if (def) {
            var brand = def.tokens["--dsw-alias-brand-primary"];
            return brand ? brand[def.colorScheme] : "#888888";
          }
          return "linear-gradient(135deg,#22d3ee,#a78bfa)";
        }

        function isSelected(id) {
          var isJs = false;
          for (var i = 0; i < entries.length; i++) if (entries[i].id === id) { isJs = true; break; }
          if (isJs) return jsThemes.has(id);
          return current === id && !hasJsActive;
        }

        var JS_EXAMPLE = [
          "window.__ModuleLoader__.load({",
          '  id: "my-theme",',
          "  factory: (require) => {",
          "    var module = { exports: {} };",
          "    var exports = module.exports;",
          "    function apply(ctx) {",
          '      ctx.effect(() => ctx.theme.overrideTokens("my-theme", {',
          '        "--dsw-alias-bg-base": { light: "#ffffff", dark: "#0f1115" },',
          '        "--dsw-alias-brand-primary": { light: "#7c3aed", dark: "#a78bfa" }',
          "      }), \"my-theme tokens\");",
          "    }",
          "    exports.apply = apply;",
          "    return module.exports;",
          "  },",
          "});",
        ].join("\n");

        return React.createElement("div", { className: "dsh-theme-page" },
          React.createElement("h3", { className: "dsh-theme-page-title" }, "主题"),
          React.createElement("div", { className: "dsh-theme-options" },
            optionIds.map(function (id) {
              return React.createElement("button", {
                key: id,
                type: "button",
                className: "dsh-theme-option" + (isSelected(id) ? " dsh-theme-option-active" : ""),
                onClick: function () { pick(id); },
              },
                React.createElement("span", { className: "dsh-theme-swatch", style: { background: swatch(id) } }),
                React.createElement("span", { className: "dsh-theme-option-label" }, label(id)),
                isSelected(id) ? React.createElement("span", { className: "dsh-theme-option-check" }, "✓") : null
              );
            })
          ),
          React.createElement("div", { className: "dsh-theme-upload" },
            React.createElement("div", { className: "dsh-theme-upload-head" },
              React.createElement("span", null, "上传自定义主题（JS）"),
              React.createElement("button", { type: "button", className: "dsh-theme-btn", onClick: function () { if (fileRef.current) fileRef.current.click(); } }, "选择 JS 文件"),
              React.createElement("input", { ref: fileRef, type: "file", accept: ".js,text/javascript,application/javascript", style: { display: "none" }, onChange: onFile })
            ),
            React.createElement("details", { className: "dsh-theme-format" },
              React.createElement("summary", null, "查看 JS 格式示例"),
              React.createElement("pre", null, JS_EXAMPLE)
            ),
            React.createElement("div", { className: "dsh-theme-note" }, "格式类似静态客户端插件：window.__ModuleLoader__.load({ id, factory })，factory 导出 apply(ctx)。可用 ctx.theme.overrideTokens 覆盖颜色、注入 CSS、通过 slots 注册 UI 组件；支持 require(\"react\")。上传的主题会出现在上方列表中，点击即可切换；切换内置主题会自动停用上传主题。注意：上传的 JS 会在页面中直接执行，请只使用可信的主题文件。"),
            entries.length > 0
              ? React.createElement("div", { className: "dsh-theme-mine" },
                  React.createElement("div", { className: "dsh-theme-mine-title" }, "已上传主题"),
                  entries.map(function (en) {
                    return React.createElement("div", { key: en.id, className: "dsh-theme-mine-row" },
                      React.createElement("span", { className: "dsh-theme-swatch", style: { background: "linear-gradient(135deg,#22d3ee,#a78bfa)" } }),
                      React.createElement("span", { className: "dsh-theme-option-label" }, en.name + (jsThemes.has(en.id) ? "（应用中）" : "（未应用）")),
                      React.createElement("button", { type: "button", className: "dsh-theme-btn dsh-theme-btn-danger", onClick: function () { remove(en.id); } }, "删除")
                    );
                  })
                )
              : null
          ),
          message ? React.createElement("div", { className: "dsh-theme-msg " + (message.type === "error" ? "dsh-theme-msg-error" : "dsh-theme-msg-ok") }, message.text) : null
        );
      }

      slots.inject("settings.section", function () {
        return slots.register(
          { name: "settings.section", id: "theme", order: 5, label: "主题" },
          function () { return React.createElement(ThemePage); }
        );
      });

      // 卸载清理
      return function cleanup() {
        for (var i = 0; i < cleanups.length; i++) {
          try { cleanups[i](); } catch (err) { console.error("theme plugin cleanup failed", err); }
        }
        var ids = Array.from(jsThemes.keys());
        for (var j = 0; j < ids.length; j++) removeTagsFor(ids[j]);
        removeTagsFor("theme-plugin-page");
        registrations.forEach(function (disposer) {
          try { disposer(); } catch (err) {}
        });
      };
    }

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  },
});
