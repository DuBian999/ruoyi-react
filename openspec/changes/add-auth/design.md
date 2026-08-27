# Design: add-auth

## Context

- 项目已用 Vite 8 + React 19 + TypeScript 6 初始化，测试设施（Vitest/RTL/MSW/Playwright）已就绪（见 `openspec/config.yaml`）。
- 后端为 RuoYi-Vue（Spring Boot），认证接口契约：`POST /captchaImage`（验证码）、`POST /login`（返回 token）、`GET /getInfo`（用户/角色/权限字符串）、`GET /getRouters`（菜单树）、`POST /logout`、`POST /register`。
- 本次是 Vue3 → React 的等价迁移，行为对齐 RuoYi-Vue3，后端零改动。

## Goals / Non-Goals

**Goals:**
- 建立与 RuoYi 后端兼容的认证闭环（登录/登出/token/权限/动态路由）。
- 建立可测试的权限判断抽象（hook + 组件）。
- 建立动态路由的「component 字符串 → 懒加载组件」映射机制。

**Non-Goals:**
- 布局体系（侧边栏/面包屑/顶栏/多标签页）—— 属 `layout` 能力域，后续 change。
- 多标签页 keep-alive —— 属 `layout` 能力域。
- 代码生成器（tool/gen）—— 独立 change。

## Decisions

1. **状态管理选 Zustand**
   - 理由：轻量、无模板样板，7 个 store（user/permission/dict/app/settings/tagsView/lock）可一一映射为独立的 zustand store，与 Pinia 的模块化心智一致。
   - 备选：Redux Toolkit（样板与概念负担重）；React Context（跨组件频繁更新性能差、调试弱）。

2. **动态路由：`useRoutes` + `import.meta.glob` 组件映射**
   - 后端菜单 `component` 字段（如 `system/user/index`）→ 用 `import.meta.glob('../views/**/*.tsx')` 建立路径→组件懒加载映射表 → 递归将菜单树渲染为路由表。
   - 备选：手写 import 映射表（增删页面维护成本高）；`<Routes>` 元素数组（递归逻辑相同，`useRoutes` 更声明式、更易测）。

3. **权限判断抽象：`usePermission()` hook + `<AccessControl>` 组件**
   - 对应 RuoYi-Vue3 的 `v-hasPermi` / `v-hasRole` 指令；底层复用权限字符串判断逻辑（`auth()` 等价物）。
   - 备选：仅 hook（无法直接用于 JSX 条件渲染）；仅组件（无法用于非渲染逻辑，如路由守卫）。

4. **axios 封装：沿用 RuoYi 拦截器逻辑，UI 提示解耦到 antd**
   - 保留 token 注入、401/500/601 统一处理、防重复提交、blob 下载；将 `ElMessage/ElMessageBox/ElLoading` 替换为 antd 的 `App.useApp()` 上下文（message/modal），避免静态实例与 React 上下文脱节。

5. **token 存储：localStorage，键名对齐 RuoYi 约定**
   - 备选：sessionStorage（关闭浏览器即失效，与 RuoYi「记住登录」行为不一致）；HttpOnly Cookie（需后端配合，本次不改后端）。

6. **测试策略：单测覆盖 hook/store/权限判断，E2E 覆盖登录主链路**
   - MSW 拦截 `/login`、`/getInfo`、`/getRouters` 等接口，单测不依赖真实后端。
   - Playwright 走「验证码 → 登录 → 跳转 → 刷新保活 → 登出」真实流程。

## Risks / Trade-offs

- [动态路由组件映射缺失 → 白屏] → 增加兜底：组件缺失时渲染 404/占位组件。
- [后端 `component` 字段与前端组件路径命名需严格对齐] → 约定 `src/views` 目录结构 1:1 对应 RuoYi 的 views 结构。
- [前端权限仅 UI 隐藏，非安全边界] → 后端仍为最终鉴权，前端权限仅作体验层，不承诺安全。
- [React 无原生 keep-alive] → 本次不处理，`layout` change 单独决策（React 19 `<Activity>` vs `keepalive-for-react`）。
