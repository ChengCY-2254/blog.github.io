import Theme from "vitepress/theme"

export default{
    extends:Theme,
    enhanceApp({app}) {
        app.component('ECharts', () => import('./components/ECharts.vue'))
        app.component('HoverNote', () => import('./components/HoverNote.vue'))
    },
}