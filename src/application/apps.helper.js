/*
 * @Author: Aaron
 * @Date: 2020-05-03 13:34:29
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 22:08:28
 * @Description: file content
 */

// 未加载（初始化的状态）
export const NOT_LOADED = 'NOT_LOADED'

// APP加载错误
export const LOAD_ERROR = 'LOAD_ERROR'
// APP变更状态时遇见错误
export const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN'

// 加载APP
export const LOAD_SOURCE_CODE = 'LOAD_SOURCE_CODE'
// 加载完成未启动
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'

// 启动APP
export const BOOTSTRAPPING = 'BOOTSTRAPPING'
// 启动完成未挂载
export const NOT_MOUNTED = 'NOT_MOUNTED'

// 挂载APP
export const MOUNTING = 'MOUNTING'
// 挂载完成
export const MOUNTED = 'MOUNTED'

// 卸载APP
export const UNMOUNTING = 'UNMOUNTING'
// 更新APP
export const UPDATEING = 'UPDATEING'


// 过滤APP不是发生错误的APP
export function notSkip(app) {
    return app.status !== SKIP_BECAUSE_BROKEN
}
// 过滤APP状态不是加载失败的
export function notLoadError(app) {
    return app.status !== LOAD_ERROR
}
// 过滤APP状态为未加载的
export function notLoaded(app) {
    return app.status === NOT_LOADED
}
// 过滤此APP为需要加载的APP
export function shouldBeActivity(app) {
    try{
        return app.activityWhen(window.location)
    } catch(err) {
        app.status = SKIP_BECAUSE_BROKEN
        console.error(err)
    }
}
// 过滤此APP为已经被挂载的
export function isMount(app) {
    return app.status === MOUNTED
}
// 过滤此APP为需要被卸载的
export function shouldBeUnmount(app) {
    return !shouldBeActivity(app)
}
// 过滤此APP为已经被加载的
export function isLoaded(app) {
    return !notLoaded(app)
}
// 过滤此APP为没有被挂载的
export function isNtMount(app) {
    return !isMount(app)
}