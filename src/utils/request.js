import axios from 'axios'
import {
    Message,
} from 'element-ui'
import router from '../router/index.js'  //注意路径与文件名

const service = axios.create({
    // baseURL: 'https://yj1211.work/', // api 的 base_url
    timeout: 50000 // request timeout
})

// 请求拦截  设置统一header
service.interceptors.request.use(
    config => {
        if (localStorage.eleToken) {
            config.headers.Authorization = localStorage.eleToken
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截  401 token过期处理
service.interceptors.response.use(
    response => {

        return response
    },
    error => {
        // 错误提醒
        // Message.error(error.response.data)

        const { status } = error.response
        if (status === 400) {
            Message.error('token值无效，请重新登录')
            // 清除token
            localStorage.removeItem('eleToken')

            // 页面跳转
            router.push('/Login')
        }

        return Promise.reject(error)
    }
)

export default service
