/**
 * Created by linzh on 2016/06/30.
 * 不支持IE8及以下的浏览器
 *  ① querySelector() 方法仅仅返回匹配指定选择器的第一个元素。如果你需要返回所有的元素，请使用 querySelectorAll() 方法替代。
 */
    "use strict";
    /* save time  */
    var options = {
        //公共资源的URL路径
        public_url: '',
        position: ''
    };
    var ReadyGoo = {
        heap: [], /*fifo*/
        stack: []/*folo*/
    };

    //传递给loadone方法的
    var pps = {
        plugins: [] /*插件加载队列*/
    };

    /**
     * flag the page is done
     * @type {boolean}
     */
    var ild = false;

    var _ht = null;



    /**
     * clone an object
     * Handle the 3 simple types, and null or undefined
     *  "number," "string," "boolean," "object," "function," 和 "undefined"
     * @param obj
     * @returns {*}
     */
    var clone = function (obj) {
        //null 本身就是一个空的对象
        if (!obj || "object" !== typeof obj) return obj;
        var copy = null;
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            var len = obj.length;
            for (var i = 0; i < len; ++i) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };
    var jq = function (selector) {
        if (typeof selector == "undefined") {
            //get version of jquery,it will return 0 if not exist
            return (typeof jQuery == "undefined") ? 0 : $().jquery;
        }
        return (selector instanceof $) ? selector : $(selector);
    };
    /**
     * DOM
     * @type {{}}
     */



    window.L = {

        //new self
        //plugins
        P: {
            JsMap: {},//plugin autoload start
            import: function (option) {
                L.init(option, this.JsMap, true);
            },
            get: function (name, dft) {
                return name ? (O.notempty(name, this.JsMap) ? this.JsMap[name] : (dft || false)) : this.JsMap;
            },
            load: function (pnm, call) {/* plugin name, callback */
                if (pnm in this.JsMap) pnm = this.JsMap[pnm];
                if (ild) {
                    /* it will not put into quene if page has load done！ */
                    L.load(pnm, null, call);
                } else {
                    pps.plugins.push([pnm, call]);
                }
                return this;
            },
            initlize: function (sele, opts, funcNm, pluNm, call) {
                pluNm = pluNm ? pluNm : funcNm;
                var jq = this._jq ? this._jq : (this._jq = $());
                L.load(this.JsMap[pluNm], null, function () {
                    if (!L.O.isObj(sele) || (sele instanceof jQuery)) {
                        sele = $(sele);
                        opts || (opts = {});
                        (funcNm in jq) && (jq[funcNm]).apply(sele, O.isArr(opts) ? opts : [opts]);
                        call && call(sele);
                    } else {
                        var list = [];
                        L.U.each(sele, function (params, k) {
                            list.push(k = $(k));
                            (funcNm in jq) && (jq[funcNm]).apply(k, O.isArr(params) ? params : [params]);
                        });
                        call && call(list);
                    }
                });
            }
        },
        V: {},//constant or config// judge
        loader: {
            stack: [],
            heap: [],
            /**
             * 使用内置模块
             * @param buildin_name
             * @param call
             * @returns {L}
             */

        }
    };