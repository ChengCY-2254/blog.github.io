import { type DefaultTheme } from 'vitepress'
export const nav_item: DefaultTheme.NavItem[] = [
    { text: '主页', link: '/' },
    { text: '笔记', link: '/notes/赛博宝箱' }
]
export const sidebar_item: DefaultTheme.SidebarItem[] = [
    {
        text: '笔记',
        collapsed: false,
        items: [
            { text: '赛博宝箱', link: '/notes/赛博宝箱' },
            { text: '在Cherry Studio使用AI和mcp快速对网页进行翻译', link: '/notes/在Cherry Studio使用AI和mcp快速对网页进行翻译' },
            { text: 'vitepress生成更简洁的url', link: '/notes/vitepress生成更简洁的url' },
            { text: 'KMS激活服务器', link: '/notes/kms激活服务器' },
            { text: 'macOS 15使用体验', link: '/notes/macos15使用体验' },
            { text: '关于OpenResty反向代理长任务API提前返回504的解决办法', link: '/notes/关于OpenResty反向代理长任务API提前返回504的解决办法' },
            { text: '关于mac崩坏星穹铁道3.4版本playcover侧载无法启动的解决办法', link: '/notes/关于mac崩坏星穹铁道3.4版本playcover侧载无法启动的解决办法' },
            { text: 'git仓库中的隐私数据泄露', link: '/notes/git仓库中的隐私数据泄露' },
            { text: 'teamspeak服务器搭建', link: '/notes/teamspeak服务器搭建' },
        ]
    },
    {
        text: '奇思妙想',
        collapsed: true,
        items: [
            { text: '2025-07-08', link: '/奇思妙想/2025-07-08' },
        ]
    },
    {
        text: '翻译内容',
        items: [
            { text: '在go中从头开始构建BitTorrent客户端', link: '/翻译/在go中从头开始构建BitTorrent客户端' }
        ]
    },
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
]