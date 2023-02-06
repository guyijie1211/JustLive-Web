import Vue from 'vue'
import Router from 'vue-router'
import Home from "@/components/Home";
import Room from "@/components/LivePage/Room";
import Search from "@/components/MainPages/Search";
import Recommend from "@/components/MainPages/Recommend";
import Index from "@/components/Index";
import Follows from "@/components/MainPages/Follows";
import Platforms from "@/components/MainPages/Platforms";
import PlatformRooms from "@/components/MainPages/PlatformRooms";
import Areas from "@/components/MainPages/Areas";
import AreaAll from "@/components/MainPages/AreaAll";
import Tv from "@/components/MainPages/Tv";
import ArtPlayerTest from "@/components/Test/ArtPlayerTest";
import RoomMobile from "../components/Mobile/RoomMobile";
import IndexMobile from "../components/Mobile/IndexMobile";
import HomeMobile from "../components/Mobile/HomeMobile";

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

const router = new Router({
    mode: 'history',
    // base: '/live/',
    routes:[
        {
            path:'/',
            redirect:'/index/home/recommend'
        },
        {
            path:'/mobile',
            redirect:'/mobile/index/home/recommend'
        },
        {
            path: '/index',
            name: '播放测试',
            component: Index,
            redirect: '/index/home/recommend',
            children: [
                {
                    path: '/index/home',
                    name: '主页',
                    component: Home,
                    children: [
                        {
                            path: '/index/home/recommend',
                            name: '直播推荐',
                            component: Recommend
                        },
                        {
                            path: '/index/home/follows',
                            name: 'follows',
                            component: Follows
                        },
                        {
                            path: '/index/home/platforms',
                            name: 'platforms',
                            component: Platforms
                        },
                        {
                            path: '/index/home/areas',
                            name: 'areas',
                            component: Areas
                        },
                        {
                            path: '/index/home/areasAll',
                            name: 'areaAll',
                            component: AreaAll
                        },
                        {
                            path: '/index/home/tv',
                            name: 'tv',
                            component: Tv
                        },
                        {
                            path: '/index/home/:platform',
                            name: 'platformRoom',
                            component: PlatformRooms
                        },

                    ]
                },
                {
                    path: "/index/liveRoom",
                    name: "liveRoom",
                    component: Room
                },
                {
                    path: "/mobile/index/liveRoom",
                    name: "liveRoomMobile",
                    component: RoomMobile
                },
                {
                    path: "/index/search",
                    name: "search",
                    component: Search
                },
            ]

        },
        // 移动端
        {
            path: '/mobile/index',
            name: '移动端',
            component: IndexMobile,
            redirect: '/mobile/index/home/recommend',
            children: [
                {
                    path: '/mobile/index/home',
                    name: '主页移动端',
                    component: HomeMobile,
                    children: [
                        {
                            path: '/mobile/index/home/recommend',
                            name: '直播推荐移动端',
                            component: Recommend
                        },
                        {
                            path: '/mobile/index/home/follows',
                            name: 'follows移动端',
                            component: Follows
                        },
                        {
                            path: '/mobile/index/home/platforms',
                            name: 'platforms移动端',
                            component: Platforms
                        },
                        {
                            path: '/mobile/index/home/areas',
                            name: 'areas移动端',
                            component: Areas
                        },
                        {
                            path: '/mobile/index/home/areasAll',
                            name: 'areaAll移动端',
                            component: AreaAll
                        },
                        {
                            path: '/mobile/index/home/tv',
                            name: 'tv移动端',
                            component: Tv
                        },
                        {
                            path: '/mobile/index/home/:platform',
                            name: 'platformRoom移动端',
                            component: PlatformRooms
                        },

                    ]
                },
                {
                    path: "/index/liveRoom",
                    name: "liveRoom",
                    component: Room
                },
                {
                    path: "/mobile/index/liveRoom",
                    name: "liveRoomMobile",
                    component: RoomMobile
                },
                {
                    path: "/index/search",
                    name: "search",
                    component: Search
                },
            ]

        },
        {
            path: '/test',
            name: 'test',
            component: ArtPlayerTest
        },
    ]
})

export default router
