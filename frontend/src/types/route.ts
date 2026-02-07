import { VueElement } from "vue";

export interface Route{
    path: string,
    name: string,
    component: VueElement,
    props?: boolean
}