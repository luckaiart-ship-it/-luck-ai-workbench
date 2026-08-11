# luck AI 图片工作台

手机优先的静态网页工具，第一版不需要账号、不需要数据库、不需要 AI API。

## 已包含
- 提示词生成器：写真 / 职业照 / 证件照等中文提示词拼装
- 证件照尺寸：毫米 + DPI 自动换算像素
- 订单管理：状态、备注、本地保存、JSON 备份
- 商品文案：淘宝 / 小红书 / 闲鱼 / 抖音文案草稿
- PWA：部署后可从 iPhone Safari 添加到主屏幕

## 最简单的上线方式：GitHub Pages
1. 新建 GitHub 仓库，例如 `luck-ai-workbench`。
2. 上传本文件夹内全部文件，保持 `icons` 文件夹结构不变。
3. GitHub 仓库 → Settings → Pages。
4. Source 选择 `Deploy from a branch`，Branch 选 `main` + `/root`。
5. 保存后得到网页地址；用 iPhone Safari 打开。
6. Safari 分享按钮 → “添加到主屏幕”。

## 重要说明
- 订单保存在浏览器 localStorage；清理 Safari 网站数据会删除本地订单。
- 可定期点击“导出备份”保存 JSON 文件。
- 当前提示词和文案属于模板生成，不调用大模型，因此没有 API 成本。
- 后续若要账号、跨设备同步、客户上传图片、AI 自动生成，建议接 Supabase / Cloudflare / Vercel 后端，并把 API Key 放在服务端。
