# SFMC Custom Activity

Salesforce Marketing Cloud Engagement Custom Activity 模板，使用 Next.js 构建，可部署在 Vercel 上。

## 项目结构

```
custom-activity/
├── app/
│   ├── api/activity/           # API 端点
│   │   ├── execute/            # Journey 执行时调用
│   │   ├── save/               # 保存配置
│   │   ├── publish/            # Journey 发布时调用
│   │   ├── validate/           # 验证配置
│   │   └── stop/               # Journey 停止时调用
│   ├── page.tsx                # 配置 UI 主页面
│   ├── layout.tsx
│   └── globals.css
├── public/
│   └── config.json             # Activity 定义配置
├── lib/
│   ├── postmonger.ts           # Postmonger SDK 封装
│   └── types.ts                # TypeScript 类型定义
├── components/
│   └── ActivityConfig.tsx      # 配置表单组件
└── vercel.json                 # Vercel 部署配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000 查看配置界面。

### 3. 配置 config.json

编辑 `public/config.json`，将 `{{ENDPOINT_BASE}}` 替换为您的实际部署 URL：

```json
{
  "arguments": {
    "execute": {
      "url": "https://your-app.vercel.app/api/activity/execute"
    }
  }
}
```

### 4. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 在 SFMC 中安装

### 方法 1: 使用 Package Manager

1. 登录 Marketing Cloud
2. 进入 **Setup** > **Apps** > **Installed Packages**
3. 点击 **New** 创建新 Package
4. 添加 **Journey Builder Activity** 组件
5. 填写配置：
   - **Endpoint URL**: `https://your-app.vercel.app`
   - **Config URL**: `https://your-app.vercel.app/config.json`

### 方法 2: 直接配置 config.json

确保 `public/config.json` 中的所有 URL 都指向正确的端点。

## 自定义开发

### 修改执行逻辑

编辑 `app/api/activity/execute/route.ts` 添加您的业务逻辑：

```typescript
// 示例：调用外部 API
const response = await fetch('https://your-api.com/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contactKey: args.contactKey,
    email: args.emailAddress,
    customData: args.customField1,
  }),
});
```

### 添加新的配置字段

1. 更新 `lib/types.ts` 中的 `CustomActivityState` 接口
2. 在 `components/ActivityConfig.tsx` 中添加表单字段
3. 更新 `public/config.json` 中的 `inArguments` 和 `schema`

### 添加数据绑定

在 `config.json` 的 `inArguments` 中使用 SFMC 表达式：

```json
{
  "inArguments": [
    { "contactKey": "{{Contact.Key}}" },
    { "email": "{{InteractionDefaults.Email}}" },
    { "firstName": "{{Contact.Attribute.MyDE.FirstName}}" }
  ]
}
```

## 测试

### 本地测试 API

```bash
# 测试 execute 端点
curl -X POST http://localhost:3000/api/activity/execute \
  -H "Content-Type: application/json" \
  -d '{"inArguments": [{"contactKey": "test123"}]}'
```

### 使用 ngrok 进行 SFMC 集成测试

```bash
# 安装 ngrok
npm i -g ngrok

# 暴露本地服务
ngrok http 3000
```

将 ngrok URL 用于 SFMC 测试。

## 环境变量

| 变量 | 说明 |
|------|------|
| `SFMC_JWT_SECRET` | JWT 密钥（用于验证 SFMC 请求，可选） |
| `NEXT_PUBLIC_APP_URL` | 应用部署 URL |

## 技术栈

- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **Postmonger** - Journey Builder 通信

## 参考文档

- [SFMC Custom Activities](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/creating-activities.html)
- [Journey Builder SDK](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/jb-sdk.html)
- [Postmonger](https://github.com/salesforce-marketingcloud/postmonger)
