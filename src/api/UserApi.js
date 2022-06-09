import request from '@/utils/request'
import qs from 'qs'

export const userApi = (username, password) =>
    request({
        url: '/api/login',
        method: 'post',
        data: qs.stringify({
            username,
            password,
        })
    })
export const registerUser = (username, nickname, password, mail) =>
    request({
        url: '/api/register',
        method: 'POST',
        data: qs.stringify({
            username,
            nickname,
            password,
            mail
        })
    })
export const follow = (platform, roomId, uid) =>
    request({
        url: '/api/live/follow',
        method: 'GET',
        params: {
            platform: platform,
            roomId: roomId,
            uid: uid,
        }
    })
export const unFollow = (platform, roomId, uid) =>
    request({
        url: '/api/live/unFollow',
        method: 'GET',
        params: {
            platform: platform,
            roomId: roomId,
            uid: uid,
        }
    })
export const changeUserInfo = (userInfo) =>
    request({
        url: '/api/live/changeUserInfo',
        method: 'POST',
        data: userInfo
    })
export const changePassword = (userName, oldPassword, newPassword) =>
    request({
        url: '/api/live/changePassword',
        method: 'GET',
        params: {
            userName: userName,
            oldPassword: oldPassword,
            newPassword: newPassword,
        }
    })
export const changePasswordByMail = (mail, newPassword) =>
    request({
        url: '/api/live/changePasswordByMail',
        method: 'GET',
        params: {
            mail: mail,
            newPassword: newPassword
        }
    })
export const sendMail = (mail, code, action) =>
    request({
        url: '/api/live/sendMail',
        method: 'GET',
        params: {
            mail: mail,
            code: code,
            action: action
        }
    })
export const bindMail = (userName, mail) =>
    request({
        url: '/api/live/bindMail',
        method: 'GET',
        params: {
            userName: userName,
            mail: mail
        }
    })
export const getBindMail = (uid) =>
    request({
        url: '/api/live/getBindMail',
        method: 'GET',
        params: {
            uid: uid
        }
    })