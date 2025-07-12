import { defineConfig } from 'vitepress'
import { readdir } from 'fs';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { nav_item,sidebar_item } from './theme-config.mts';
import path from 'path';

// https://icon-sets.iconify.design/?query=mail
const mail_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm8-7l8-5V6l-8 5l-8-5v2z"/></svg>';

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    assetsDir: '/src/images',
    sitemap: {
      hostname: 'https://www.hutao.run',
      lastmodDateOnly: true,
    },
    lastUpdated: true,
    lang: 'zh-CN',
    title: "胡桃随笔(博客)",
    description: "Cheng的博客，记录生活中的点滴，会发布一些翻译和笔记，欢迎访问！",
    cleanUrls: true,
    head: [
      ['link', { rel: 'icon', href: '/images/favicon.ico' }],
      ['script', {}, `<!-- Google Tag Manager -->
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W67QD2N3');
<!-- End Google Tag Manager -->`],
      ['noscript', {}, `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W67QD2N3"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`]
    ],
    themeConfig: {
      logo: '/favicon.ico',
      // https://vitepress.dev/reference/default-theme-config
      outline: {
        label: '目录',
      },
      nav:nav_item,
      sidebar: sidebar_item,
      socialLinks: [
        { icon: 'github', link: 'https://github.com/ChengCY-2254' },
        { icon: { svg: mail_icon }, link: 'mailto:cheng@hutao.run' },
      ],
      search: {
        provider: 'local',
        options:{
          translations:{
            button: {
              buttonText: '搜索',
              buttonAriaLabel: '搜索'
            },
            modal: {
              displayDetails: '显示详情',
              resetButtonTitle: '重置',
              backButtonTitle: '返回',
              noResultsText: '没有找到结果',
              footer: {
                selectText: '选择',
                navigateText: '导航',
                closeText: '关闭',
                navigateUpKeyAriaLabel: '向上导航',
                navigateDownKeyAriaLabel: '向下导航',
              }
            }
          }
        }
      },
      docFooter:{
        prev: '上一页',
        next: '下一页'
      },
      darkModeSwitchTitle: '切换夜间模式',
      lightModeSwitchTitle: '切换日间模式',
      returnToTopLabel: '返回顶部',
      lastUpdatedText: '上次更新',
      footer: {
        // message: 'Released under the MIT License.',
        message: '基于 <a href="https://vitepress.dev" target="_blank">VitePress</a> 构建',
        copyright: 'Copyright © 2024-present <a href="https://hutao.run" target="_blank">胡桃随笔</a>'
      },
      editLink:{
        pattern: 'https://github.com/ChengCY-2254/blog.github.io/edit/main/src/:path',
        text: '在 GitHub 上编辑此页'
      }
    },
    vite: {
      server: {
        allowedHosts: ["dev1.hutao.run"]
      },
      resolve:{
        alias:{
          '@':path.resolve(__dirname),
        }
      },
    },
    markdown: {
      //https://vitepress.dev/zh/guide/markdown#custom-containers
      container: {
        tipLabel: '提示',
        warningLabel: '警告',
        dangerLabel: '注意',
        infoLabel: '信息',
        detailsLabel: '详情'
      },
      image:{
        lazyLoading:true,
      },
      codeCopyButtonTitle: '复制代码',
    },
  })
)


// 这个方法用于生成文章目录导航
// `fs_path`是文件系统中的路径，`url_path`是对应的网站URL路径，但文件路由已经确定了内容，请不要随意修改
// 生成的sidebar是一个数组，包含每个文章的标题和链接
function generator_didebar(fs_path: string) {

  class SidebarItem {
    text: string;
    link: string;
  }
  let sidebar: SidebarItem[] = [];
  readdir(fs_path, (err, files) => {
    if (err) {
      console.error(`无法完成构建，目录${fs_path}读取错误:`, err);
      throw err;
    }
    files = files.filter(file => file.endsWith('.md') && file !== 'README.md');
    files.forEach(file => {
      const title = file.replace('.md', '');

      const __link = fs_path.replace("config", "") + '/' + file.replace(".md", "");
      sidebar.push({
        text: title,
        link: __link
      })
    })
  })
  return sidebar;
}