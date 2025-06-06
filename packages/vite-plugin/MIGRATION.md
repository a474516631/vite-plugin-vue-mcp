# 迁移说明

本文档记录了将 `src` 目录迁移到 `packages/vite-plugin` 子包的过程。

## 迁移步骤

1. 创建 `packages/vite-plugin` 目录结构

   - 添加 `package.json`
   - 添加 `tsconfig.json`
   - 添加 `build.config.ts`
   - 添加 `README.md`

2. 将源代码从根目录的 `src` 复制到 `packages/vite-plugin/src`

3. 更新根目录的 `package.json`

   - 添加对 `@aireview/vite-plugin` 子包的依赖
   - 更新构建脚本，添加 `build:vite-plugin` 命令
   - 更新 `exports` 字段，添加对子包的导出

4. 更新根目录的入口文件 `src/index.ts`

   - 重定向到子包的入口文件

5. 更新根目录的 `build.config.ts`

   - 添加对子包的外部依赖

6. 更新 `README.md`，添加子包信息和项目结构说明

## 文件结构

迁移后的文件结构如下：

```
aireview/
├── dist/                # 根包的构建输出
├── packages/
│   ├── vite-plugin/     # Vite 插件子包
│   │   ├── dist/        # 子包的构建输出
│   │   ├── src/         # 子包的源代码
│   │   ├── package.json # 子包的配置
│   │   ├── tsconfig.json # 子包的 TypeScript 配置
│   │   └── build.config.ts # 子包的构建配置
│   ├── client/          # 客户端子包
│   └── vscode-extension/ # VSCode 扩展子包
├── src/                 # 根包的源代码（现在只包含重定向）
├── package.json         # 根包的配置
└── README.md            # 项目文档
```

## 构建流程

迁移后的构建流程如下：

1. 构建客户端：`pnpm build:client`
2. 构建 Vite 插件：`pnpm build:vite-plugin`
3. 构建根包：`pnpm build`
4. 构建所有：`pnpm build:all`

## 注意事项

- 根包现在依赖于子包，因此构建顺序很重要
- 子包使用 `workspace:*` 作为版本，确保使用本地版本
- 根包的入口文件现在只是重定向到子包的入口文件
