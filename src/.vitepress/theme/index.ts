import Theme from "vitepress/theme"

export default{
    extends:Theme,
    enhanceApp({app}) {
        app.component('HoverNote', () => import('./components/HoverNote.vue'))
        app.component('OverwatchColorGenerator',()=> import('./components/OverwatchColorGenerator.vue'))
        app.component('EmbeddedPage', () => import('./components/EmbeddedPage.vue'))
    },
}