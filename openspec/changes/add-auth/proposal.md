# Proposal: add-auth

## Why

将若依后台前端从 Vue3 迁移到 React 的第一阶段，建立**认证与权限地基**。这是整个迁移的前置条件——没有「登录 → 动态路由 → 权限判断」这条主干链路，后续的系统管理、监控、工具等业务模块都无法运行。现在先打通这条链路，作为后续模块可复用的骨架。

## What Changes

- 新增 `auth` 能力域，覆盖：登录、登出、注册、锁屏、token 持久化、按钮级权限判断、基于后端菜单的动态路由构建。
- 搭建前端基础设施：axios 请求封装（token 注入、401/500/601 统一处理、防重复提交、文件下载）、Zustand 用户态与权限态、React Router 动态路由。
- 引入并落地测试设施：Vitest + Testing Library 单测、MSW 接口 mock、Playwright E2E；以 spec 场景作为测试用例来源。

## Capabilities

### New Capabilities

- `auth`: 认证与授权基础能力——登录/登出/注册/锁屏、token 生命周期、按钮级权限判断、动态路由构建。

### Modified Capabilities

<!-- 无既有 capability，首次建立 -->

## Impact

- **代码**：新增 `src/api/login`、`src/store/user`、`src/store/permission`、`src/router`、`src/utils/request`、`src/utils/auth`、`src/views/login` 等；改造 `src/main.tsx`、`App.tsx`。
- **依赖**：新增 `antd`、`zustand`、`react-router-dom`、`axios`；测试依赖已在脚手架阶段引入。
- **测试**：Vitest/RTL/MSW（单测）+ Playwright（E2E）。
- **后端**：无改动，复用 RuoYi-Vue 现有认证接口（`/login`、`/getInfo`、`/getRouters`、`/captchaImage`、`/register`）。
- **破坏性**：无（全新项目，无既有功能可破坏）。
