# Letgo

## 引擎发布流程

### master 分支

包含稳定可以随时发布生产环境的代码(从 1.0.0 开始)

### dev 分支

在这个分支进行所有分支开发工作，包括非紧急 bug 和一些 workflow、docs 相关的变更。稳定后往 master 合并，发布正式稳定版本

### feature 分支

新特性分支，从 dev 分支创建，完成后合并到 dev 分支

### bugFix 分支

紧急生产问题, 从 master 拉分支，进行 bug fix。修复完成后，往 master 和 dev 合并，发布 bugFix 版本。

### release-[version]-beta 分支

从 dev 分支拉新分支，进行 beta 发布。

## tips

-   es module 不包含 polyfill 需应用自行处理
