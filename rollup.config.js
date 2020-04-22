/*
 * @Author: Aaron
 * @Date: 2020-04-22 15:57:59
 * @LastEditors: Aaron
 * @LastEditTime: 2020-04-22 16:02:58
 * @Description: file content
 */
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
    input: './src/single-spa.js',
    output: {
        file: './lib/umd/single-spa.js',
        format: 'umd',
        name: 'singleSpa',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({ exclude: 'node_modules/**' }),
        process.env.SERVE && serve({
            contentBase: '',
            openPage: './index.html',
            host: 'localhost',
            port: '7002'
        })
    ]
}
