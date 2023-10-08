import request from '@/utils/request'

export const getRecommend = (page, size) =>
    request({
        url: '/api/live/getRecommend',
        method: 'GET',
        params: {
            page: page,
            size: size,
        }
    })

export const getRealUrl = (platform, roomId) =>
    request({
        url: '/api/live/getRealUrl',
        method: 'GET',
        params: {
            platform: platform,
            roomId: roomId,
        }
    })

export const getRoomInfo = (uid, platform, roomId) =>
    request({
        url: '/api/live/getRoomInfo',
        method: 'GET',
        params: {
            uid: uid,
            platform: platform,
            roomId: roomId,
        }
    })

export const getRoomsOn = (uid) =>
    request({
        url: '/api/live/getRoomsOn',
        method: 'GET',
        params: {
            uid: uid,
        }
    })

export const getRecommendByPlatform = (platform, page, size) =>
    request({
        url: '/api/live/getRecommendByPlatform',
        method: 'GET',
        params: {
            platform: platform,
            page: page,
            size: size,
        }
    })

export const getAllSupportPlatforms = () =>
    request({
        url: '/api/live/getAllSupportPlatforms',
        method: 'GET'
    })

export const getAreas = (platform) =>
    request({
        url: '/api/live/getAreas',
        method: 'GET',
        params: {
            platform: platform,
        }
    })

export const getRecommendByPlatformArea = (platform, area, page, size) =>
    request({
        url: '/api/live/getRecommendByPlatformArea',
        method: 'GET',
        params: {
            platform: platform,
            area: area,
            page: page,
            size: size,
        }
    })

export const getAllAreas = () =>
    request({
        url: '/api/live/getAllAreas',
        method: 'GET',
    })

export const getSearch = (platform, keyWords, uid) =>
    request({
        url: '/api/live/search',
        method: 'GET',
        params: {
            platform: platform,
            keyWords: keyWords,
            uid: uid,
        }
    })

export const getRecommendByAreaAll = (areaType, area, page) =>
    request({
        url: '/api/live/getRecommendByAreaAll',
        method: 'GET',
        params: {
            areaType: areaType,
            area: area,
            page: page,
        }
    })

export const getTv = () =>
    request({
        url: '/api/live/getTv',
        method: 'GET',
    })
export const getApp = () =>
    request({
        url: '/api/live/versionUpdate',
        method: 'GET',
    })

