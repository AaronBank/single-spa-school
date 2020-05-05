/*
 * @Author: Aaron
 * @Date: 2020-05-05 22:17:25
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 22:50:32
 * @Description: file content
 */

import { BOOTSTRAPPING, NOT_BOOTSTRAPPED, SKIP_BECAUSE_BROKEN, NOT_MOUNTED } from "../application/apps.helper"
import {reasonableTime} from '../application/timeout';
import {getProps} from './helper';

// 启动APP
export function toBootstrapPromise(app) {
    if (app.status !== NOT_BOOTSTRAPPED) {
        return Promise.resolve(app)
    }

    app.status = BOOTSTRAPPING

    const props = getProps(app)

    return reasonableTime(
        app.bootstrap(props),
        `app ${app.name} bootstrapping`,
        app.timeout.bootstrap
    ).then(() => {
        app.status = NOT_MOUNTED
        return app
    }).catch(e => {
        console.error(e)
        app.status = SKIP_BECAUSE_BROKEN
    })
}
