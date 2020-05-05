/*
 * @Author: Aaron
 * @Date: 2020-05-03 13:25:12
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-03 13:45:46
 * @Description: file content
 */
// 保存APP启动状态
let started = false

// 启动APP
export function start() {
    started = true
}

// 获取APP启动状态
export function isStarted() {
    return started
}