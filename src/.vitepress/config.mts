import { defineConfig } from 'vitepress'
import { readdir } from 'fs';

// https://icon-sets.iconify.design/?query=mail
const mail_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm8-7l8-5V6l-8 5l-8-5v2z"/></svg>';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  sitemap:{
    hostname:'https://www.hutao.run',
    lastmodDateOnly:true,
  },
  head: [
    ['link',{rel:'icon',href:'https://a.hutao.run/www/favicon.ico'}],
    ['script',{},`<!-- Google Tag Manager -->
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W67QD2N3');
<!-- End Google Tag Manager -->`],
  ['noscript',{},`<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W67QD2N3"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`]
  ],
  lang: 'zh-CN',
  title: "胡桃随笔",
  description: "咕，可以和解吗？",
  cleanUrls:true,
  themeConfig: {
    logo: 'https://a.hutao.run/www/favicon.ico',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '笔记', link: '/notes/赛博宝箱' }
    ],

    sidebar: [
      {
        text: '笔记',
        items: [
          { text: '赛博宝箱', link: '/notes/赛博宝箱' },
          { text: 'vitepress生成更简洁的url', link: '/notes/vitepress生成更简洁的url' },
          { text: 'KMS激活服务器', link: '/notes/kms激活服务器' },
          { text: 'macOS 15使用体验',link: '/notes/macos15使用体验' },
          { text: '关于OpenResty反向代理长任务API提前返回504的解决办法', link: '/notes/关于OpenResty反向代理长任务API提前返回504的解决办法' },
          { text: '关于mac崩坏星穹铁道3.4版本playcover侧载无法启动的解决办法',link: '/notes/关于mac崩坏星穹铁道3.4版本playcover侧载无法启动的解决办法' },
          { text: 'git仓库中的隐私数据泄露',link: '/notes/git仓库中的隐私数据泄露' },
          { text: 'teamspeak服务器搭建', link: '/notes/teamspeak服务器搭建' },
        ]
      },
      // {
      //   text: '笔记',
      //   items:generator_didebar('config/notes')
      // },
      {
        text: 'vitepress 示例',
        items: [
          { text: 'Markdown 扩展语法', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: '关于',
        items: [
          { text: '关于作者', link: '/author' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ChengCY-2254' },
      { icon: {svg:mail_icon}, link: 'mailto:cheng@hutao.run' },
    ],
    search:{
      provider:'local',
    },
    footer:{
      // message: 'Released under the MIT License.',
      message: '基于 <a href="https://vitepress.dev" target="_blank">VitePress</a> 构建',
      copyright: 'Copyright © 2024-present <a href="https://hutao.run" target="_blank">胡桃随笔</a>'
    },
  },
  vite:{
    server:{
      allowedHosts:["dev1.hutao.run"]
    }
  },
  markdown:{
    //https://vitepress.dev/zh/guide/markdown#custom-containers
    container:{
      tipLabel:'提示',
      warningLabel:'警告',
      dangerLabel:'注意',
      infoLabel:'信息',
      detailsLabel:'详情'
    },
  },
  lastUpdated:true,
})


// 这个方法用于生成文章目录导航
// `fs_path`是文件系统中的路径，`url_path`是对应的网站URL路径，但文件路由已经确定了内容，请不要随意修改
// 生成的sidebar是一个数组，包含每个文章的标题和链接
function generator_didebar(fs_path:string){
  
  class SidebarItem {
    text: string;
    link: string;
  }
  let sidebar: SidebarItem[] = [];
  readdir(fs_path,(err,files)=>{
    if (err) {
      console.error(`无法完成构建，目录${fs_path}读取错误:`, err);
      throw err;
    }
    files = files.filter(file => file.endsWith('.md') && file !== 'README.md');
    files.forEach(file=>{
      const title = file.replace('.md','');
    
      const __link = fs_path.replace("config","")+'/'+file.replace(".md","");
      sidebar.push({
        text : title,
        link: __link
      })
    })
  })
  return sidebar;
}