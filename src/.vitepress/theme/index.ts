import Theme from "vitepress/theme"
import {h} from 'vue'

export default{
    ...Theme,
    Layout(){
        return h(Theme.Layout,null,{
            "hover-note":()=> h(import('./components/HoverNote.vue')),
        })
    }
}