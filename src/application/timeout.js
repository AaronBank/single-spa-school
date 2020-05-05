/*
 * @Author: Aaron
 * @Date: 2020-05-05 21:25:35
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 21:38:08
 * @Description: file content
 */
const TIMEOUT = {
    bootstrap: {
        milliseconds: 3000,
        rejectWhenTimeout: false
    },
    mount: {
        milliseconds: 3000,
        rejectWhenTimeout: false
    },
    unmount: {
        milliseconds: 3000,
        rejectWhenTimeout: false
    }
}

// 超时处理
export function reasonableTime(lifecyclePromise, description, timeout) {
    return new Promise((resolve, reject) => {
        let finished = false

        lifecyclePromise.then((data) => resolve(data)).finally(() => finished = true)

        const timer = setTimeout(() => {
            clearTimeout(timer)
            if (!finished && timeout.rejectWhenTimeout) {
                reject(new Error(description))
            }
        }, timeout.rejectWhenTimeout)
    })
}

export function ensureTimeout(timeout = {}) {
    return {
        ...TIMEOUT,
        ...timeout
    }
}