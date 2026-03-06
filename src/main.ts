import App from '@/App.vue'
import '@/style.css'
import '@/css/index.css'
import { createApp } from 'vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
