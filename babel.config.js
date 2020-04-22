/*
 * @Author: Aaron
 * @Date: 2020-04-22 15:55:09
 * @LastEditors: Aaron
 * @LastEditTime: 2020-04-22 16:06:33
 * @Description: file content
 */
module.exports = api => {
    api.cache(true)

    return {
        presets: [
            ['@babel/preset-env', {modules: false}]
        ],
        plugins: [
            '@babel/plugin-syntax-dynamic-import'
        ]
    }
}