# 4945区：先上号再说

《4945区：先上号再说》是一部移动端优先的中文 Web 视觉小说。玩家会进入一个完全架空的游戏社区，在多个组织、关系与事件分支之间做出选择，并把决定延续到后续季度。

当前公开版为 **4.0.0**，包含三季内容、多组织路线、关系系统、章节回放、结局档案、本地存档、PWA 离线体验和移动端适配。

> 本作品的世界、剧情、人物与事件均为架空创作，不对应现实中的个人、组织或事件。

## 在线体验

<https://4945.iyouren.top>

## 本地运行

需要 Node.js `22.14.0`（项目同时支持 `^20.19.0 || >=22.12.0`）。

```bash
cd game
npm ci
npm run dev
```

开发服务器启动后，按终端显示的本地地址访问即可。

## 质量检查

```bash
cd game
npm run typecheck
npm test
npm run audit:assets:final
npm run build
npm run test:e2e
```

首次执行端到端测试前，需要安装 Chromium：

```bash
npx playwright install chromium
```

## 项目结构

```text
game/                  Vue 3 + TypeScript 应用
  public/assets/       正式发布的头像、背景、立绘与 CG
  src/components/      舞台、面板和交互组件
  src/content/         人物、组织、章节与剧情节点
  src/engine/          场景图、状态、存档与连续性逻辑
  src/stores/          游戏会话和设置状态
  e2e/                 Playwright 端到端测试
docs/                  产品、架构、叙事和版本设计文档
design-system/         视觉与页面设计规范
头像/、场景图/         创作源素材与概念图
```

详细说明见 [技术架构](docs/ARCHITECTURE.md)、[产品规格](docs/PRODUCT_SPEC.md) 和 [美术规范](docs/ART_DIRECTION.md)。

## 参与贡献

欢迎提交缺陷修复、体验改进、无障碍优化和内容工具改进。开始前请阅读 [贡献指南](CONTRIBUTING.md) 与 [安全政策](SECURITY.md)。涉及剧情、世界观、人物关系、存档结构或其他重大变更，请先创建 Issue 讨论范围与兼容性影响。

## 许可证

- 程序代码： [MIT License](LICENSE)
- 原创剧情、人物、对白、文档、提示词和美术资源： [CC BY 4.0](LICENSE-CONTENT.md)
- npm 第三方依赖：各自许可证

著作权 © 2026 YouRen。
