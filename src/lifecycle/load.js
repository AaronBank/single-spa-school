/*
 * @Author: Aaron
 * @Date: 2020-05-03 14:20:24
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 22:17:56
 * @Description: file content
 */
import { NOT_LOADED, LOAD_SOURCE_CODE , SKIP_BECAUSE_BROKEN, NOT_BOOTSTRAPPED , LOAD_ERROR} from '../application/apps.helper';
import { isNotPromise, flattenLifecycleArray, getProps } from './helper'
import { ensureTimeout } from '../application/timeout'

// 加载APP
export function toLoadPromise(app) {
    if (app.status !== NOT_LOADED) {
        return Promise.resolve(app)
    }

    app.status = LOAD_SOURCE_CODE

    const props = getProps(app)

    const loadPromise = app.loadFunction(props)

    if (!isNotPromise(loadPromise)) {
        app.status = SKIP_BECAUSE_BROKEN
        return Promise.reject(new Error('loadFunction 必须返回一个 Promise'))
    }

    loadPromise.then(appConfig => {
        if (typeof appConfig !== 'object') {
            app.status = SKIP_BECAUSE_BROKEN
            throw new Error('')
        }

        const isComplete = ['bootstrap', 'mount', 'unmount'].every(lifecycle => {
            
            if (!appConfig[lifecycle]) {
                app.status = SKIP_BECAUSE_BROKEN
                console.error(`${app.name} `)
                return false
            }
            app.timeout = ensureTimeout(appConfig.timeout)
            app[lifecycle] = flattenLifecycleArray(appConfig[lifecycle], `${app.name} ${lifecycle}`)
        })

        if (isComplete) {
            app.status = NOT_BOOTSTRAPPED
        }
    }).catch(e => {
        console.error(e)
        app.status = LOAD_ERROR
    })
}