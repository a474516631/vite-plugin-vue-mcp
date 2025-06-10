---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "AIReview"
  text: "智能 UI 走查工具"
  tagline: "专注于Vue应用UI走查的高效自动化工具"
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 介绍
      link: /guide/introduction

features:
  - title: 高效UI走查
    details: 通过智能技术辅助UI审查流程，提高走查效率，减少人工错误，确保UI质量和一致性。
  - title: 自动化问题检测
    details: 自动识别UI问题，包括样式错误、布局异常和交互缺陷，大幅降低手动检查的工作量。
  - title: 智能问题修复
    details: 借助AI技术，针对发现的UI问题提供修复建议，甚至能够自动生成修复代码。
  - title: 一键定位组件
    details: 通过点击页面元素，快速定位到对应的组件代码，无需手动搜索，提高开发效率。
  - title: 走查结果记录
    details: 自动记录走查过程中发现的问题，支持添加注释和截图，便于团队协作和问题跟踪。
  - title: 走查报告生成
    details: 生成详细的UI走查报告，包含问题汇总、修复建议和统计数据，方便项目管理和质量控制。
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #42b883 30%, #35495e);
}

.VPHero {
  position: relative;
}

.custom-logo {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-664px);
  width: 50%;
  max-width: 600px;
  max-height: 534px;
}

@media (max-width: 960px) {
  .custom-logo {
    position: relative;
    top: 0;
    right: 0;
    transform: none;
    width: 100%;
    margin-top: 2rem;
  }
}
</style>

<div class="custom-logo">
  <LogoComponent />
</div>
