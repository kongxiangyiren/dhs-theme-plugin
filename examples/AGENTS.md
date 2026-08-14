# AGENTS.md — 如何生成 client.js（DSH Web 客户端插件/主题 bundle）

本文件只讲一件事：**生成 client.js**。基于 `mecha-theme`（机甲主题）实战验证。

## 1. 格式

client.js 是一个纯浏览器 bundle，无 import/TS/JSX：

```js
window.__ModuleLoader__.load({
  id: "mecha-theme",            // 不能是保留字 system/light/dark；重复 id 需先删旧版
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require("react");   // 唯一可 require 的模块
    function apply(ctx) { /* 见 §3 */ }
    exports.apply = apply;
    return module.exports;
  },
});
```

## 2. 写码前先查接口（勿猜）

`cordis_inspect_list` / `cordis_inspect_query`（Client）：

- `Theme.listTokens` → 13 个 `--dsw-alias-*` token（bg-base、bg-layer-1/2、bg-overlay、
  border-l1/l2、brand-primary、label-primary/secondary、state-error/success/warn-primary、
  specific-sidebar-fill）。每个 token 必须给 `{ light, dark }` 两个 CSS color（可为 rgba）。
- `Service.listService("theme")` → `overrideTokens(source, tokens)` 叠加层，返回 disposer；
  裸字符串值会抛错。
- `Slots.listSubTree` → 全屏浮层用 `shell.overlay`（list 槽）；查询 exact root 拿注册契约。
- 可用 Builtin：`ctx` / `React` / `console`（**没有 styles**，见 §4）。

## 3. apply(ctx) 标准骨架

```js
function apply(ctx) {
  var theme = ctx.get("theme");          // ⚠️ 统一 ctx.get() + 判空
  if (theme !== undefined) {
    ctx.effect(function () {
      return theme.overrideTokens("mecha-theme", {
        "--dsw-alias-bg-base": { light: "#eee", dark: "#0b0e12" },
        // ...其余 token
      });
    });
  }
  // CSS 注入：见 §4
  var slots = ctx.get("slots");
  if (slots !== undefined) {
    slots.inject("shell.overlay", function () {
      return slots.register(
        { name: "shell.overlay", id: "mecha-scanlines" },
        function () { return React.createElement("div", null, "overlay"); }
      );
    });
  }
}
```

**坑**：不要写 `ctx.theme.` / `ctx.slots.` 直接属性——`dhs-theme-plugin` 的 mini ctx
没有 `ctx.slots`（会报 `reading 'inject'`），真实运行时又需要 inject 声明。
`ctx.get()` 两头通用。

## 4. CSS 注入（无 styles builtin）

```js
function injectCss(css, tagId) {
  var tag = document.createElement("style");
  tag.dataset.dynTheme = tagId;   // ⚠️ 必须打标，宿主按它清理
  tag.textContent = css;
  document.head.appendChild(tag);
  return function removeTag() { try { tag.remove(); } catch (err) {} };
}
ctx.effect(function () { return injectCss(css, "mecha-theme"); });
```

样式尽量用 `var(--dsw-alias-*)` 驱动，明暗自动适配。

## 5. 自检

1. `node --check client.js` 语法通过（bundle 会被 `new Function` 直接执行）。
2. id 非保留字；文件 ≤ 200KB（上传上限）。
3. grep 复核：全文无 `ctx.theme.` / `ctx.slots.` 直接访问。
4. 所有副作用（overrideTokens / style 标签 / slots 注册）都包在 `ctx.effect` 内或返回 disposer。
