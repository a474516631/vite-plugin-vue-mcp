export interface IMenuItem {
  text: string;
  items?: IMenuItem[];
  link?: string;
  collapsed?: boolean;
}
export const menus: IMenuItem[] = [
  {
    text: '指南',
    collapsed: false,
    items: [
      { text: '介绍', link: '/guide/introduction' },
      { text: '快速开始', link: '/guide/quick-start' },
      { text: '安装', link: '/guide/installation' },
      { text: '功能特性', link: '/guide/features' },
      { text: '高级用法', link: '/guide/advanced' },
      { text: 'API 参考', link: '/guide/api' }
    ]
  }
];
