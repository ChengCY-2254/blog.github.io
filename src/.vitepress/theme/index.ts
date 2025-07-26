import Theme from "vitepress/theme"

export default{
    extends:Theme,
    enhanceApp({app}) {
        app.component('HoverNote', () => import('./components/HoverNote.vue'))
    },
}