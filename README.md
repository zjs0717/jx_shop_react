# 乐享 · jj_shop_react

Vue 3 乐享项目的 React 重写版。

- React 19 + TypeScript + Vite 8
- TanStack Query（服务端数据）
- Zustand（登录态、布局、关注、购物车）
- React Router Hash 路由（与原项目一致）
- ECharts 数据大屏地图

## 开发

需要 Node.js 20+。API 仍代理到 `http://127.0.0.1:8017`。

```bash
npm install
npm run dev
```

开发地址：`http://localhost:5174`（避免与原 Vue 项目 5173 冲突）。

```bash
npm run build
npm run preview
```
