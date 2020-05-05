/*
 * @Author: Aaron
 * @Date: 2020-05-05 22:17:25
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 23:01:30
 * @Description: file content
 */

import { MOUNTED , SKIP_BECAUSE_BROKEN, NOT_MOUNTED} from "../application/apps.helper";
import {reasonableTime} from '../application/timeout';
import {getProps} from './helper';

// 卸载APP
export function toUnmountPromise(app) {
    if (app.status !== MOUNTED) {
        return Promise.resolve(app)
    }

    const props = getProps(app)

    return reasonableTime(
        app.unmount(props),
        `app ${app.name} unmounting`,
        app.timeout.unmount
    ).then(() => {
        app.status = NOT_MOUNTED
        return app
    }).catch(e => {
        console.error(e)
        app.status = SKIP_BECAUSE_BROKEN
    })
}