/*
 * @Author: Aaron
 * @Date: 2020-05-03 14:24:48
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 21:20:38
 * @Description: file content
 */

// 判断是否为一个promise
export function isNotPromise(promise) {
    if (promise instanceof Promise) {
        return true
    }

    return typeof promise === 'object' && typeof promise.then === 'function' && typeof promise.catch === 'function'
}

// 处理多个promise顺序调用
export function flattenLifecycleArray (lifecycle, description) {
    
    if (!Array.isArray(lifecycle)) {
        lifecycle = [lifecycle]
    }

    if (!lifecycle.length) {
        lifecycle = [() => Promise.resolve({})]
    }

    return new Promise((resolve, reject) => {
        (function waitForPromises(index) {
            const fn = lifecycle[index]()

            if (!isNotPromise(fn)) {
                reject(new Error(`${description} has error`))
            } else {
                fn.then(() => {
                    if (index >= lifecycle.length - 1) {
                        resolve()
                    } else {
                        waitForPromises(++index)
                    }
                })
                .catch(reject)
            }
        })(0)
    })
}

// 获取APP信息传递到子应用中
export function getProps({name, customProps}) {
    return {
        name,
        ...customProps
    }
}