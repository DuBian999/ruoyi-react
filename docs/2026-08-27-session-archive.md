# 会话归档 — 2026-08-27

> - **归档日期**：2026-08-28
> - **会话日期**：2026-08-27
> - **会话记录源**：`~/.claude/projects/D--Ai-Project/2612bd3d-2144-4bf9-bef6-1243c8b70557.jsonl`

---

## 参考业务代码位置

- **参考业务代码位置**：`D:\Ai-Project\RuoYi-Vue3`
- **本项目（RuoYi-React）**：`D:\Ai-Project\ruoyi-react`

> 迁移目标：把参考项目 RuoYi-Vue3（Vue3 + Element Plus）前端迁移到 React 生态，后端 RuoYi-Vue（Spring Boot）**零改动**，接口契约沿用 `{ code, msg, data }`。

---

## 1. 项目目标

将若依（RuoYi）后台管理系统前端从 RuoYi-Vue3 迁移为 React 技术栈，采用「业务对齐、等价迁移」的方式：

- 行为对齐 RuoYi-Vue3，后端接口不改。
- 后端接口契约：`{ code, msg, data }`，`code=200` 成功、`401` 未授权、`500` 错误。
- 认证走 Bearer token（localStorage 持久化）。
- 权限体系：后端下发菜单树 → 前端动态路由；按钮级权限用权限字符串判断。

---

## 2. 技术栈决策（已确定）

| 层       | 选型                                                          | 对应 RuoYi-Vue3 原技术 |
| -------- | ------------------------------------------------------------- | ---------------------- |
| 构建     | Vite 8（Rolldown）+ TypeScript 6                              | Vite + TS              |
| UI       | React 19 + Ant Design 5                                       | Vue3 + Element Plus    |
| 状态管理 | Zustand（7 个 store 一一映射）                                | Pinia                  |
| 路由     | React Router 7（动态路由 + `useRoutes`）                      | Vue Router             |
| 请求     | axios（沿用 RuoYi 拦截器逻辑）                                | axios                  |
| 测试     | Vitest + RTL + MSW（单测）、Playwright（E2E）                 | —                      |
| 工程化   | pnpm 9 + prettier + commitlint + husky + lint-staged + oxlint | —                      |

关键设计决策（详见 `openspec/changes/add-auth/design.md`）：

1. **状态管理选 Zustand** —— 轻量、无模板样板，`user/permission/dict/app/settings/tagsView/lock` 七个 store 独立映射，与 Pinia 模块化心智一致。
2. **动态路由** —— `useRoutes` + `import.meta.glob('../views/**/*.tsx')` 建立「component 字符串 → 懒加载组件」映射，递归将菜单树渲染为路由表。
3. **权限判断抽象** —— `usePermission()` hook + `<AccessControl>` 组件，对应 `v-hasPermi` / `v-hasRole` 指令。
4. **axios 封装** —— 保留 token 注入、401/500/601 统一处理、防重复提交、blob 下载；UI 提示从 `ElMessage/ElMessageBox/ElLoading` 迁移到 antd 的 `App.useApp()` 上下文。
5. **token 存储** —— localStorage，键名对齐 RuoYi 约定。
6. **测试策略** —— 单测覆盖 hook/store/权限判断；E2E 覆盖登录主链路。

---

## 3. 工作流决策

采用 **OpenSpec 规范驱动**（Propose → Apply → Archive）+ **测试先行**：

- 每个 spec 场景用 GIVEN/WHEN/THEN 描述，且每个 THEN 至少对应一条单测或 E2E。
- 实现时同步编写对应测试，不允许只提交无测试实现。
- 任务拆到可独立验证，每个任务标注「是否有测试覆盖」。

Node 版本管理：用 nvm 管理，本项目 `.nvmrc` 锁 `24.16.0`（用户全局默认 18，用于其他低版本项目）。

---

## 4. 已完成进度（截至 2026-08-27）

### 4.1 脚手架与测试设施

- ✅ Vite 8 + React 19 + TypeScript 6 初始化完成
- ✅ 测试设施就绪：Vitest + @testing-library/react + MSW（单测）、Playwright（E2E）
- ✅ `src/test/` 测试目录、`e2e/` 目录已建立

### 4.2 工程化配置

- ✅ 包管理从 npm 切换为 **pnpm 9**（`packageManager: pnpm@9.15.9`）
- ✅ prettier（格式化）、commitlint（commit 规范）、husky（git hooks）、lint-staged（提交前检查）、oxlint（lint）
- ✅ `.nvmrc` 锁定 Node 24.16.0

### 4.3 版本控制

- ✅ 本地仓库已初始化并提交
- ✅ 已绑定远程仓库并推送：`git@github.com:DuBian999/ruoyi-react.git`
- ✅ 默认分支设为 `master`，`main` 分支已删除
- ✅ 已安装 gh CLI

### 4.4 OpenSpec 首个 change 起草

- ✅ `add-auth` 需求文档已起草（proposal / design / specs / tasks）
- ✅ `openspec validate add-auth` 校验通过
- ⏳ 待用户 review 后落地（apply）

---

## 5. add-auth 需求详情

**定位**：认证与权限地基（整个迁移的前置主干链路），打通「登录 → 动态路由 → 权限判断」。

### 5.1 能力范围

登录、登出、注册、锁屏、token 持久化、按钮级权限判断、基于后端菜单的动态路由构建。

### 5.2 后端认证接口（复用 RuoYi-Vue，零改动）

| 接口                 | 说明                         |
| -------------------- | ---------------------------- |
| `POST /captchaImage` | 获取图形验证码               |
| `POST /login`        | 登录，返回 token             |
| `GET /getInfo`       | 用户信息 / 角色 / 权限字符串 |
| `GET /getRouters`    | 菜单树                       |
| `POST /logout`       | 登出                         |
| `POST /register`     | 注册                         |

### 5.3 规格场景（specs/auth/spec.md 摘要）

- **用户登录**：登录成功保存 token + 加载权限 + 跳转；登录失败提示错误、不保存 token。
- **会话持久化与恢复**：刷新后基于 token 静默恢复；token 失效清除会话跳登录。
- **用户登出**：清除 token 与用户信息，返回登录页。
- **动态路由构建**：菜单树 → 路由挂载；未授权路由重定向 404。
- **按钮级权限判断**：有权限可见可用，无权限隐藏或禁用。
- **用户注册**：后端开启注册功能时可用。
- **锁屏**：锁屏后需密码校验解锁。

### 5.4 任务清单（tasks.md，共 24 项 / 8 个模块）

1. 依赖与目录骨架（antd、zustand、react-router-dom、axios；`src/{api,store,router,utils,views,components,hooks,types}`）
2. axios 封装（request.ts / auth.ts / MSW handler）
3. 认证 API 与状态（api/login.ts、store/user.ts、store/permission.ts）
4. 动态路由（组件映射、菜单树递归转路由、404 兜底）
5. 权限判断（usePermission + AccessControl）
6. 登录/登出/锁屏视图
7. 会话恢复与守卫 + E2E（登录成功链路、登录失败提示）
8. 收尾校验（全量测试 + openspec validate）

---

## 6. 下一步计划

1. **用户 review `add-auth` 四个文档**（proposal / design / specs / tasks），确认后走 `/opsx:apply` 落地 24 项任务。
2. **后续独立 change**：
   - `layout` —— 侧边栏 / 面包屑 / 顶栏 / 多标签页 / keep-alive（React 无原生 keep-alive，需单独决策：React 19 `<Activity>` vs `keepalive-for-react`）。
   - `tool-gen` —— 代码生成器的 React 模板。

---

## 7. 会话关键决策时间线

| 时间点   | 决策/动作                                                        |
| -------- | ---------------------------------------------------------------- |
| 14:09 前 | 提出迁移需求：基于 RuoYi-Vue3 业务，用最新稳定 vite + React + TS |
| 后续     | 引入 OpenSpec 规范驱动 + 前端单测/自动化测试                     |
| 后续     | 包管理 npm → pnpm，补充格式化 / commitlint / husky 工程化配置    |
| 后续     | Node 版本从 18 切换为 24（nvm 管理，`.nvmrc` 锁 24.16.0）        |
| 16:31 前 | 归档本次调整，暂停任务开发                                       |
| 16:31 后 | 绑定远程仓库 `git@github.com:DuBian999/ruoyi-react.git` 并推送   |
| 后续     | master 设为默认分支，删除 main 分支                              |
| 结束     | 会话结束，今日暂停                                               |
