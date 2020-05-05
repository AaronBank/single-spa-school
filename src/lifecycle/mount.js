/*
 * @Author: Aaron
 * @Date: 2020-05-05 22:17:25
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 23:04:43
 * @Description: file content
 */

import { NOT_MOUNTED , MOUNTED } from "../application/apps.helper"
import { reasonableTime } from '../application/timeout'
import { getProps } from './helper'
import { toUnmountPromise } from './unmount'

// 挂载APP
export function toMountPromise(app) {
    if (app.status !== NOT_MOUNTED) {
        return Promise.resolve(app)
    }

    const props = getProps(app)

    return reasonableTime(
        app.mount(props),
        `app ${app.name} mounting`,
        app.timeout.mount
    ).then(() => {
        app.status = MOUNTED
        return app
    }).catch(e => {
        console.error(e)
        app.status = MOUNTED
        return toUnmountPromise(app)
    })
}