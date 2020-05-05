(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.singleSpa = {}));
}(this, (function (exports) { 'use strict';

    /*
     * @Author: Aaron
     * @Date: 2020-05-03 13:34:29
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-05 22:08:28
     * @Description: file content
     */
    // 未加载（初始化的状态）
    const NOT_LOADED = 'NOT_LOADED'; // APP加载错误

    const LOAD_ERROR = 'LOAD_ERROR'; // APP变更状态时遇见错误

    const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN'; // 加载APP

    const LOAD_SOURCE_CODE = 'LOAD_SOURCE_CODE'; // 加载完成未启动

    const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'; // 启动APP

    const BOOTSTRAPPING = 'BOOTSTRAPPING'; // 启动完成未挂载

    const NOT_MOUNTED = 'NOT_MOUNTED'; // 挂载APP

    const MOUNTED = 'MOUNTED'; // 卸载APP

    function notSkip(app) {
      return app.status !== SKIP_BECAUSE_BROKEN;
    } // 过滤APP状态不是加载失败的

    function notLoadError(app) {
      return app.status !== LOAD_ERROR;
    } // 过滤APP状态为未加载的

    function notLoaded(app) {
      return app.status === NOT_LOADED;
    } // 过滤此APP为需要加载的APP

    function shouldBeActivity(app) {
      try {
        return app.activityWhen(window.location);
      } catch (err) {
        app.status = SKIP_BECAUSE_BROKEN;
        console.error(err);
      }
    } // 过滤此APP为已经被挂载的

    function isMount(app) {
      return app.status === MOUNTED;
    } // 过滤此APP为需要被卸载的

    function shouldBeUnmount(app) {
      return !shouldBeActivity(app);
    } // 过滤此APP为已经被加载的

    function isLoaded(app) {
      return !notLoaded(app);
    } // 过滤此APP为没有被挂载的

    function isNtMount(app) {
      return !isMount(app);
    }

    /*
     * @Author: Aaron
     * @Date: 2020-05-03 13:25:12
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-03 13:45:46
     * @Description: file content
     */
    // 保存APP启动状态
    let started = false; // 启动APP

    function start() {
      started = true;
    } // 获取APP启动状态

    function isStarted() {
      return started;
    }

    /*
     * @Author: Aaron
     * @Date: 2020-05-03 14:24:48
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-05 21:20:38
     * @Description: file content
     */
    // 判断是否为一个promise
    function isNotPromise(promise) {
      if (promise instanceof Promise) {
        return true;
      }

      return typeof promise === 'object' && typeof promise.then === 'function' && typeof promise.catch === 'function';
    } // 处理多个promise顺序调用

    function flattenLifecycleArray(lifecycle, description) {
      if (!Array.isArray(lifecycle)) {
        lifecycle = [lifecycle];
      }

      if (!lifecycle.length) {
        lifecycle = [() => Promise.resolve({})];
      }

      return new Promise((resolve, reject) => {
        (function waitForPromises(index) {
          const fn = lifecycle[index]();

          if (!isNotPromise(fn)) {
            reject(new Error(`${description} has error`));
          } else {
            fn.then(() => {
              if (index >= lifecycle.length - 1) {
                resolve();
              } else {
                waitForPromises(++index);
              }
            }).catch(reject);
          }
        })(0);
      });
    } // 获取APP信息传递到子应用中

    function getProps({
      name,
      customProps
    }) {
      return {
        name,
        ...customProps
      };
    }

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
    }; // 超时处理

    function reasonableTime(lifecyclePromise, description, timeout) {
      return new Promise((resolve, reject) => {
        let finished = false;
        lifecyclePromise.then(data => resolve(data)).finally(() => finished = true);
        const timer = setTimeout(() => {
          clearTimeout(timer);

          if (!finished && timeout.rejectWhenTimeout) {
            reject(new Error(description));
          }
        }, timeout.rejectWhenTimeout);
      });
    }
    function ensureTimeout(timeout = {}) {
      return { ...TIMEOUT,
        ...timeout
      };
    }

    /*
     * @Author: Aaron
     * @Date: 2020-05-03 14:20:24
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-05 22:17:56
     * @Description: file content
     */

    function toLoadPromise(app) {
      if (app.status !== NOT_LOADED) {
        return Promise.resolve(app);
      }

      app.status = LOAD_SOURCE_CODE;
      const props = getProps(app);
      const loadPromise = app.loadFunction(props);

      if (!isNotPromise(loadPromise)) {
        app.status = SKIP_BECAUSE_BROKEN;
        return Promise.reject(new Error('loadFunction 必须返回一个 Promise'));
      }

      loadPromise.then(appConfig => {
        if (typeof appConfig !== 'object') {
          app.status = SKIP_BECAUSE_BROKEN;
          throw new Error('');
        }

        const isComplete = ['bootstrap', 'mount', 'unmount'].every(lifecycle => {
          if (!appConfig[lifecycle]) {
            app.status = SKIP_BECAUSE_BROKEN;
            console.error(`${app.name} `);
            return false;
          }

          app.timeout = ensureTimeout(appConfig.timeout);
          app[lifecycle] = flattenLifecycleArray(appConfig[lifecycle], `${app.name} ${lifecycle}`);
        });

        if (isComplete) {
          app.status = NOT_BOOTSTRAPPED;
        }
      }).catch(e => {
        console.error(e);
        app.status = LOAD_ERROR;
      });
    }

    /*
     * @Author: Aaron
     * @Date: 2020-05-05 22:17:25
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-05 22:50:32
     * @Description: file content
     */

    function toBootstrapPromise(app) {
      if (app.status !== NOT_BOOTSTRAPPED) {
        return Promise.resolve(app);
      }

      app.status = BOOTSTRAPPING;
      const props = getProps(app);
      return reasonableTime(app.bootstrap(props), `app ${app.name} bootstrapping`, app.timeout.bootstrap).then(() => {
        app.status = NOT_MOUNTED;
        return app;
      }).catch(e => {
        console.error(e);
        app.status = SKIP_BECAUSE_BROKEN;
      });
    }

    /*
     * @Author: Aaron
     * @Date: 2020-05-05 22:17:25
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-05 23:01:30
     * @Description: file content
     */

    function toUnmountPromise(app) {
      if (app.status !== MOUNTED) {
        return Promise.resolve(app);
      }

      const props = getProps(app);
      return reasonableTime(app.unmount(props), `app ${app.name} unmounting`, app.timeout.unmount).then(() => {
        app.status = NOT_MOUNTED;
        return app;
      }).catch(e => {
        console.error(e);
        app.status = SKIP_BECAUSE_BROKEN;
      });
    }

    /*
     * @Author: Aaron
     * @Date: 2020-05-05 22:17:25
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-05 23:04:43
     * @Description: file content
     */

    function toMountPromise(app) {
      if (app.status !== NOT_MOUNTED) {
        return Promise.resolve(app);
      }

      const props = getProps(app);
      return reasonableTime(app.mount(props), `app ${app.name} mounting`, app.timeout.mount).then(() => {
        app.status = MOUNTED;
        return app;
      }).catch(e => {
        console.error(e);
        app.status = MOUNTED;
        return toUnmountPromise(app);
      });
    }

    /*
     * @Author: Aaron
     * @Date: 2020-05-03 13:43:21
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-05 22:19:36
     * @Description: file content
     */
    let appChangesUnderway = false;

    function invoke() {
      if (appChangesUnderway) {
        return new Promise((resolve, reject) => {
        });
      }

      appChangesUnderway = true; // APP是否已被手动调用启动

      if (isStarted()) {
        performAppChanges();
      } else {
        // 按需预加载
        loadApps();
      } // 加载APP


      function loadApps() {
        // 获取需要被load的APP
        const apps = getAppsToLoad(); // 对APP足个进行加载

        apps.map(toLoadPromise);
      } // 切换应用（先卸载，在加载）


      function performAppChanges() {
        // 1. unmount 不需要的APP
        getAppsToUnmount().map(toUnmountPromise); // 2. load 需要加载的APP

        getAppsToLoad().map(app => {
          toLoadPromise(app).then(toBootstrapPromise).catch(e => {
            console.error(e);
            app.status = SKIP_BECAUSE_BROKEN;
          });
        }); // 3. mount 需要挂载的APP

        getAppsToMount().map(toMountPromise);
      }
    }

    /*
     * @Author: Aaron
     * @Date: 2020-05-03 13:25:22
     * @LastEditors: Aaron
     * @LastEditTime: 2020-05-05 22:09:54
     * @Description: file content
     */
    const APPS = [];
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

    function registerApplication(name, loadFunction, activityWhen, customProps = {}) {
      if (!name || typeof name !== 'string') {
        throw new Error('name 必须是一个字符串');
      }

      if (!loadFunction) {
        throw new Error('loadFunction 必须是一个函数或对象');
      }

      if (typeof loadFunction !== 'function') {
        loadFunction = () => Promise.resolve(loadFunction);
      }

      if (typeof activityWhen !== 'function') {
        throw new Error('activityWhen 必须是一个函数');
      }

      APPS.push({
        name,
        loadFunction,
        status: NOT_LOADED,
        activityWhen,
        customProps
      });
      invoke();
    } // 过滤需要加载的APP

    function getAppsToLoad() {
      return APPS.filter(notSkip).filter(notLoadError).filter(notLoaded).filter(shouldBeActivity);
    } // 过滤需要被卸载的APP

    function getAppsToUnmount() {
      return APPS.filter(notSkip).filter(isMount).filter(shouldBeUnmount);
    } // 过滤需要被挂载的APP

    function getAppsToMount() {
      return APPS.filter(notSkip).filter(isLoaded).filter(isNtMount).filter(shouldBeActivity);
    }

    exports.registerApplication = registerApplication;
    exports.start = start;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=single-spa.js.map
