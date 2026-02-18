import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import { logger } from '@/utils/logger'
import '@/style.css'

const routes = [
  { path: '/', redirect: '/uuid' },
  { path: '/uuid', component: () => import('@modules/uuid/UuidGenerator.vue') },
  { path: '/jwt', component: () => import('@modules/jwt/JwtDecoder.vue') },
  { path: '/pem', component: () => import('@modules/pem/PemDecoder.vue') },
  { path: '/wiegand', component: () => import('@modules/wiegand/WiegandConverter.vue') },
  { path: '/xor', component: () => import('@modules/xor/XorChecksum.vue') },
  { path: '/number', component: () => import('@modules/number/NumberConverter.vue') },
  { path: '/color', component: () => import('@modules/color/ColorConverter.vue') },
  { path: '/epoch', component: () => import('@modules/epoch/EpochConverter.vue') },
  { path: '/svg-path', component: () => import('@modules/svg-path/SvgPathVisualizer.vue') },
  { path: '/html-entity', component: () => import('@modules/html-entity/HtmlEntityEncoder.vue') },
  { path: '/url-encode', component: () => import('@modules/url-encode/UrlEncoder.vue') },
  { path: '/base64', component: () => import('@modules/base64/Base64Converter.vue') },
  { path: '/base64-image', component: () => import('@modules/base64-image/Base64ImageViewer.vue') },
  { path: '/json', component: () => import('@modules/json-validator/JsonValidator.vue') },
  { path: '/qr-code', component: () => import('@modules/qr-code/QrCode.vue') },
  { path: '/cheat-sheets/:sheet?', component: () => import('@modules/cheat-sheets/CheatSheets.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  logger.debug('Navigating from %s to %s', from.fullPath, to.fullPath)
})

router.onError(error => {
  logger.error('Router error: %o', error)
})

createApp(App).use(router).mount('#app')
