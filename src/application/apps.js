/*
 * @Author: Aaron
 * @Date: 2020-05-03 13:25:22
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 22:09:54
 * @Description: file content
 */

import {
    NOT_LOADED,
    notSkip,
    notLoadError,
    notLoaded,
    isMount,
    isLoaded,
    isNtMount,
    shouldBeUnmount,
    shouldBeActivity
} from './apps.helper'
import { invoke } from '../navigation/invoke'

const APPS = []

/**
 * 注册APP
 * 
 * @export
 * @param {string} name 要注册的APP名称
 * @param {Function<Promise> | Object} loadFunction APP异步加载函数或APP内容
 * @param {Function<boolean>} activityWhen 判断APP是否需要挂载
 * @param {Object} customProps 自定义配置
 * @returns {Promise}
 */
export function registerApplication(name, loadFunction, activityWhen, customProps = {}) {
    if (!name || typeof name !== 'string') {
        throw new Error('name 必须是一个字符串')
    }

    if (!loadFunction) {
        throw new Error('loadFunction 必须是一个函数或对象')
    }

    if (typeof loadFunction !== 'function') {
        loadFunction = () => Promise.resolve(loadFunction)
    }

    if (typeof activityWhen !== 'function') {
        throw new Error('activityWhen 必须是一个函数')
    }

    APPS.push({
        name,
        loadFunction,
        status: NOT_LOADED,
        activityWhen,
        customProps
    })

    invoke()
}

// 过滤需要加载的APP
export function getAppsToLoad() {
    return APPS.filter(notSkip)
    .filter(notLoadError)
    .filter(notLoaded)
    .filter(shouldBeActivity)
}

// 过滤需要被卸载的APP
export function getAppsToUnmount() {
    return APPS.filter(notSkip)
    .filter(isMount)
    .filter(shouldBeUnmount)
}

// 过滤需要被挂载的APP
export function getAppsToMount() {
    return APPS.filter(notSkip)
    .filter(isLoaded)
    .filter(isNtMount)
    .filter(shouldBeActivity)
}