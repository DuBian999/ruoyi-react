# Tasks: add-auth

## 1. 依赖与基础设施

- [ ] 1.1 安装 `antd`、`zustand`、`react-router-dom`、`axios`，验证 `npm install` 成功（无测试覆盖，属工具链）
- [ ] 1.2 建立 `src/{api,store,router,utils,views,components,hooks,types}` 目录骨架，验证目录结构齐全（无测试覆盖）

## 2. axios 请求封装

- [ ] 2.1 实现 `src/utils/request.ts`（axios 实例、token 注入、401/500/601 统一处理、防重复提交、blob 下载），验证 `npm run test:run` 中拦截器单测通过（单测覆盖）
- [ ] 2.2 实现 `src/utils/auth.ts`（token 的 localStorage 读写/清除），验证 token 存取单测通过（单测覆盖）
- [ ] 2.3 配置 MSW 基础 handler（`src/mocks/handlers`）拦截 `/login`、`/getInfo`、`/getRouters`，验证 mock 返回示例数据（单测覆盖）

## 3. 认证 API 与状态

- [ ] 3.1 实现 `src/api/login.ts`（login/logout/getInfo/getRouters/getCodeImg/register），验证类型与返回值符合后端契约（单测覆盖）
- [ ] 3.2 实现 `src/store/user.ts`（Zustand：token、用户信息、权限字符串、登录/登出 action），验证 store 单测通过（单测覆盖）
- [ ] 3.3 实现 `src/store/permission.ts`（Zustand：菜单树、动态路由生成状态），验证路由生成单测通过（单测覆盖）

## 4. 动态路由

- [ ] 4.1 实现组件映射 `import.meta.glob('../views/**/*.tsx')`，验证 component 字符串能解析到懒加载组件（单测覆盖）
- [ ] 4.2 实现菜单树 → 路由表递归转换，并用 `useRoutes` 挂载，验证 `system/user/index` 等菜单能生成对应路由（单测覆盖）
- [ ] 4.3 实现未授权路由兜底（组件缺失/无权限 → 404），验证访问未授权路由跳转 404（单测覆盖）

## 5. 权限判断

- [ ] 5.1 实现 `usePermission()` hook 与 `<AccessControl>` 组件（对应 v-hasPermi/v-hasRole），验证有/无权限两种场景单测通过（单测覆盖）

## 6. 登录/登出/锁屏视图

- [ ] 6.1 实现登录页（用户名/密码/验证码表单，含获取验证码），验证登录表单渲染与校验单测通过（单测覆盖）
- [ ] 6.2 实现登出与锁屏入口（顶栏内），验证登出清除会话单测通过（单测覆盖）

## 7. 会话恢复与守卫

- [ ] 7.1 实现路由守卫 + 刷新会话恢复（token 有效静默恢复，无效跳登录），验证刷新保活与失效重定向单测通过（单测覆盖）
- [ ] 7.2 编写 E2E：登录成功 → 跳转 → 刷新保活 → 登出，验证 `npm run test:e2e` 通过（E2E 覆盖）
- [ ] 7.3 编写 E2E：登录失败提示错误，验证 `npm run test:e2e` 通过（E2E 覆盖）

## 8. 收尾校验

- [ ] 8.1 运行 `npm run test:run` 与 `npm run test:e2e` 全绿，`openspec validate add-auth` 通过（全量测试 + 规范校验）
