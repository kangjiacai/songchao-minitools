# 两款现有小工具源码交接（只读副本）

本包由本机盘点生成，供后续把「宋式衣橱」与这两款工具放进同一仓库时使用。原文件未改。不要把过时 v1 包或本机 `submit/`、`session/` 里的凭证一并提交。

**版本限制：** 这里是本机当前的 v1.1 功能工作树，不是已复核 md5 的原始上线 zip。本机没有 v1.1 原始离线包，也没有「审核通过 / 已上线」回执。历史提交 md5 见包外 `/workspace/wardrobe-handoff/INVENTORY.md`。

## 包内结构

- `songci-color/pkg/` 宋朝配色现行源码（入口 `index.html`）
- `songci-color/NOTES.md`、`DESIGN.md`、`MOTION.md` 说明
- `songci-color/previews/` 首页与色卡代表截图（无二维码）
- `songchao-quiz/pkg/` 测测你是宋朝哪种女子现行源码
- `songchao-quiz/MOTION.md`
- `songchao-quiz/previews/` 首页与「点茶娘子」结果页代表截图

`mini_tool.json` 均为 `{"is_high_consumption_scene":false}`。

## 不要做的事

- 不要修改这两款的功能、词库、测验逻辑或已有角色形象。
- 不要把本包误推到 `kangjiacai/ykbd-minitool`（那是「你可能不知道」）。本机未见宋朝工具汇总仓库。
- 实现「宋式衣橱」前先读包外 `docs/online-contract/API-BASELINE-COMPARISON.md`，并由主线程向用户播报新增公开能力；内测 API 不得当开放能力。
