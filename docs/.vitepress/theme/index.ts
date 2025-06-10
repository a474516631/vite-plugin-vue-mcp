import DefaultTheme from 'vitepress/theme'
import EcosystemNav from '../../src/theme/components/EcosystemNav.vue'
import LogoComponent from '../../src/theme/components/LogoComponent.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册自定义全局组件
    app.component('EcosystemNav', EcosystemNav)
    app.component('LogoComponent', LogoComponent)
  }
}