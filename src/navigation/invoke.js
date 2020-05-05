/*
 * @Author: Aaron
 * @Date: 2020-05-03 13:43:21
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 22:19:36
 * @Description: file content
 */

import { isStarted } from '../start'
import { getAppsToLoad, getAppsToUnmount, getAppsToMount } from '../application/apps'
import { toLoadPromise } from '../lifecycle/load'
import { toBootstrapPromise } from '../lifecycle/bootstrap'
import { toMountPromise } from '../lifecycle/mount'
import { toUnmountPromise } from '../lifecycle/unmount'
import { SKIP_BECAUSE_BROKEN } from '../application/apps.helper';

let appChangesUnderway = false
let changesQueue = []

// 加载APP
export function invoke() {
    if (appChangesUnderway) {
        return new Promise((resolve, reject) => {
            changesQueue.push({
                success: resolve,
                failure: reject
            })
        })
    }

    appChangesUnderway = true

    // APP是否已被手动调用启动
    if (isStarted()) {
        performAppChanges()
    } else {
        // 按需预加载
        loadApps()
    }

    // 加载APP
    function loadApps() {
        // 获取需要被load的APP
        const apps = getAppsToLoad()

        // 对APP足个进行加载
        apps.map(toLoadPromise)
    }

    // 切换应用（先卸载，在加载）
    function performAppChanges() {
        // 1. unmount 不需要的APP
        getAppsToUnmount().map(toUnmountPromise)
        // 2. load 需要加载的APP
        getAppsToLoad().map(app => {
            toLoadPromise(app).then(toBootstrapPromise).catch(e => {
                console.error(e)
                app.status = SKIP_BECAUSE_BROKEN
            })
        })
        // 3. mount 需要挂载的APP
        getAppsToMount().map(toMountPromise)
    }
}
