/**
 * Created by linzhv on 11/18/16.
 *
 * Note:
 *  querySelector() only return the first match
 *  querySelectorAll return all pattern matches
 */


//constant
var BREAK = '[break]';
var CONTINUE = '[continue]';
var BASE_DIR = null;
var BROWSER = null;//{type: "Chrome", version: "50.0.2661.94"}
// if(typeof PUBLIC_URL == 'undefined'){
//     PUBLIC_URL = '/';//script parent url
// }
function each(obj, call, meta) {
    var result = undefined;
    if (util.isArr(obj)) {
        for (var i = 0; i < obj.length; i++) {
            result = call(obj[i], i, meta);
            if (result === BREAK) break;
            if (result === CONTINUE) continue;
            if (result !== undefined) return result;
        }
    } else if (util.isObj(obj)) {
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            result = call(obj[key], key, meta);
            if (result === BREAK) break;
            if (result === CONTINUE) continue;
            if (result !== undefined) return result;
        }
    } else {
        console.log(obj);
        throw "EACH_EXCEPTION";
    }
}


var isea = (function (callback_while_all_ready_done) {
    "use strict";

    var util = {
        /** check if key exist and the value is not empty */
        notempty: function (optname, obj, dft) {
            return obj ? (obj.hasOwnProperty(optname) && obj[optname]) : (dft || false);
        },
        /**
         * get the type of variable
         * @returns string :"number" "string" "boolean" "object" "function" 和 "undefined"
         */
        gettype: function (o) {
            if (o === null) return "null";//object
            if (o === undefined) return "undefined";
            return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
        },
        isObj: function (obj) {
            return this.gettype(obj) === "object";
        },
        toObj: function (json) {
            return this.isObj(json) ? json : eval("(" + json + ")");
        },
        isArr: function (el) {
            return Array.isArray ? Array.isArray(el) : (this.gettype(el) === "array");
        },
        isStr: function (el) {
            return this.gettype(el) === "string";
        },
        isFunc: function (el) {
            return this.gettype(el) === "function";
        },
        /**
         * check if attributes is in the object
         * @return int 1-all,0-none,-1-exist_of_part
         */
        prop: function (obj, properties) {
            var count = 0;
            if (!this.isArr(properties)) properties = [properties];
            for (var i = 0; i < properties.length; i++)if (obj.hasOwnProperty(properties[i])) count++;
            return count === properties.length ? 1 : (count === 0 ? 0 : -1);
        }
    };

    function init(config, target, cover) {
        each(config, function (item, key) {
            if (cover || (cover === undefined)) {
                target[key] = item;
            }
        });
        return this;
    }

    function guid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
    }

    function pathful(path) {
        if (!path.beginWith("http")) {
            if (!path.beginWith("/")) {
                path = BASE_DIR + path;
            }
        }
        return path;
    }

    function getResourceType(path) {
        var type = path.substring(path.length - 3);
        switch (type) {
            case 'css':
                type = 'css';
                break;
            case '.js':
                type = 'js';
                break;
            case 'ico':
                type = 'ico';
                break;
            default:
                throw "wrong type:" + type;
        }
        return type;
    }

    //compatability
    (function () {
        window.console || (window.console = (function () {
            var c = {};
            c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function () {
            };
            return c;
        })());
        each({
            indexOf: function (elt) {
                var len = this.length >>> 0;
                var from = Number(arguments[1]) || 0;
                from = (from < 0) ? Math.ceil(from) : Math.floor(from);
                if (from < 0) from += len;
                for (; from < len; from++) {
                    if (from in this && this[from] === elt) return from;
                }
                return -1;
            },
            max: function () {
                return Math.max.apply({}, this);
            },
            min: function () {
                return Math.min.apply({}, this);
            }
        }, function (v, i) {
            if (!Array.prototype[i]) Array.prototype[i] = v;
        });

        each({
            trim: function () {
                return this.replace(/(^\s*)|(\s*$)/g, '');
            },
            ltrim: function () {
                return this.replace(/(^\s*)/g, '');
            },
            rtrim: function () {
                return this.replace(/(\s*$)/g, '');
            },
            beginWith: function (chars) {
                return this.indexOf(chars) === 0;
            },
            endWith: function (chars) {
                return this.length === (chars.length + this.indexOf(chars));
            }
        }, function (v, i) {
            if (!String.prototype[i]) String.prototype[i] = v;
        });
    })();

    (function () {
        //get the position of this file
        var scripts = document.getElementsByTagName("script");
        each(scripts, function (script) {
            if (script.src && script.src.indexOf("/isea/index.js")) {
                BASE_DIR = script.src.replace("/isea/index.js", "/isea/");
                return BREAK;
            }
        });
    })();

    (function () {
        var v, tp = {};
        var ua = navigator.userAgent.toLowerCase();
        (v = ua.match(/msie ([\d.]+)/)) ? tp.ie = v[1] :
            (v = ua.match(/firefox\/([\d.]+)/)) ? tp.firefox = v[1] :
                (v = ua.match(/chrome\/([\d.]+)/)) ? tp.chrome = v[1] :
                    (v = ua.match(/opera.([\d.]+)/)) ? tp.opera = v[1] :
                        (v = ua.match(/version\/([\d.]+).*safari/)) ? tp.safari = v[1] : 0;
        if (tp.ie) {
            BROWSER.type = "ie";
            BROWSER.version = parseInt(tp.ie);
        } else if (tp.firefox) {
            BROWSER.type = "firefox";
            BROWSER.version = parseInt(tp.firefox);
        } else if (tp.chrome) {
            BROWSER.type = "chrome";
            BROWSER.version = parseInt(tp.chrome);
        } else if (tp.opera) {
            BROWSER.type = "opera";
            BROWSER.version = parseInt(tp.opera);
        } else if (tp.safari) {
            BROWSER.type = "safari";
            BROWSER.version = parseInt(tp.safari);
        } else {
            BROWSER.type = "unknown";
            BROWSER.version = 0;
        }
    })();

    var resourceLibrary = {
        _: {},
        parseName: function (name) {
            if (name.indexOf('/') >= 0) {
                name = name.split('/');
                name = name[name.length - 1];
            }
            return name;
        },
        hasExist: function (name) {
            return this.parseName(name) in this._;
        },
        checkIn: function (name) {
            this._[this.parseName(name)] = true;
            return this;
        }
    };

    var client = {
        viewport: function () {
            var win = window;
            var type = 'inner';
            if (!('innerWidth' in win)) {
                type = 'client';
                win = document.documentElement ? document.documentElement : document.body;
            }
            return {
                width: win[type + 'Width'],
                height: win[type + 'Height']
            };
        },
        redirect: function (url) {
            location.href = url;
        },

        /**
         * get the hash of uri
         */
        hash: function () {
            if (!location.hash) return "";
            var hash = location.hash;
            var index = hash.indexOf('#');
            if (index >= 0) hash = hash.substring(index + 1);
            return "" + decodeURI(hash);
        },

        /**
         * get script path
         * there are some diffrence between domain access(virtual machine) and ip access of href
         * domian   :http://192.168.1.29:8085/edu/Public/admin.php/Admin/System/Menu/PageManagement#dsds
         * ip       :http://edu.kbylin.com:8085/admin.php/Admin/System/Menu/PageManagement#dsds
         * what we should do is SPLIT '.php' from href
         * ps:location.hash
         */
        base: function () {
            var href = location.href;
            var index = href.indexOf('.php');
            if (index > 0) {//exist
                return href.substring(0, index + 4);
            } else {
                if (location.origin) {
                    return location.origin;
                } else {
                    return location.protocol + "//" + location.host;//default 80 port
                }
            }
        },
        parseUrl: function (s) {
            var o = {};
            if (s) {
                s = decodeURI(s);
                var arr = s.split("&");
                for (var i = 0; i < arr.length; i++) {
                    var d = arr[i].split("=");
                    o[d[0]] = d[1] ? d[1] : '';
                }
            }
            return o;
        }
    };

    var dom = {
        create: function (elementName, attributes, innerHtml) {
            var clses, id;
            if (elementName.indexOf('.') > 0) {
                clses = elementName.split(".");
                elementName = clses.shift();
            }
            if (elementName.indexOf("#") > 0) {
                var tempid = elementName.split("#");
                elementName = tempid[0];
                id = tempid[1];
            }

            var el = document.createElement(elementName);
            id && el.setAttribute('id', id);
            if (clses) {
                var ct = '';
                each(clses, function (v) {
                    ct += v + " ";
                });
                el.setAttribute('class', ct);
            }

            util.isObj(attributes) && each(attributes, function (v, k) {
                el[k] = v;
            });
            if (innerHtml) el.innerHTML = innerHtml;
            return el;
        },
        /**
         * 检查dom对象是否存在指定的类名称
         * @param obj
         * @param cls
         * @returns {Array|{index: number, input: string}}
         */
        hasClass: function (obj, cls) {
            return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        },
        /**
         * 添加类
         * @param obj
         * @param cls
         */
        addClass: function (obj, cls) {
            if (!this.hasClass(obj, cls)) obj.className += " " + cls;
        },
        /**
         * 删除类
         * @param obj
         * @param cls
         */
        removeClass: function (obj, cls) {
            if (this.hasClass(obj, cls)) {
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                obj.className = obj.className.replace(reg, ' ');
            }
        },
        /**
         * 逆转类
         * @param obj
         * @param cls
         */
        toggleClass: function (obj, cls) {
            if (this.hasClass(obj, cls)) {
                this.removeClass(obj, cls);
            } else {
                this.addClass(obj, cls);
            }
        },
        //支持多个类名的查找 http://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
        getElementsByClassName: function (cls, ele) {
            var list = (ele || document).getElementsByTagName('*');
            var set = [];

            for (var i = 0; i < list.length; i++) {
                var child = list[i];
                var classNames = child.className.split(' ');
                for (var j = 0; j < classNames.length; j++) {
                    if (classNames[j] == cls) {
                        set.push(child);
                        break;
                    }
                }
            }
            return set;
        }
    };
    var cookie = {
        set: function (name, value, expire, path) {
            path = ";path=" + (path ? path : '/');// all will access if not set the path
            var cookie;
            if (undefined === expire || false === expire) {
                //set or modified the cookie, and it will be remove while leave from browser
                cookie = name + "=" + value;
            } else if (!isNaN(expire)) {// is numeric
                var _date = new Date();//current time
                if (expire > 0) {
                    _date.setTime(_date.getTime() + expire);//count as millisecond
                } else if (expire === 0) {
                    _date.setDate(_date.getDate() + 365);//expire after an year
                } else {
                    //delete cookie while expire < 0
                    _date.setDate(_date.getDate() - 1);//expire after an year
                }
                cookie = name + "=" + value + ";expires=" + _date.toUTCString();
            } else {
                console.log([name, value, expire, path], "expect 'expire' to be false/undefined/numeric !");
            }
            document.cookie = cookie + path;
        },
        //get a cookie with a name
        get: function (name, dft) {
            if (document.cookie.length > 0) {
                var cstart = document.cookie.indexOf(name + "=");
                if (cstart >= 0) {
                    cstart = cstart + name.length + 1;
                    var cend = document.cookie.indexOf(';', cstart);//begin from the index of param 2
                    (-1 === cend) && (cend = document.cookie.length);
                    return document.cookie.substring(cstart, cend);
                }
            }
            return dft || "";
        }
    };

    var _headTag = null;
    var loader = {
        append2Header: function (ele) {
            if (!_headTag) _headTag = document.getElementsByTagName("head")[0];
            _headTag.appendChild(ele);
            return ele;
        },
        linkIcon: function (path) {
            this.append2Header(dom.create("link", {
                href: path,
                rel: "shortcut icon"
            }));
        },
        linkStyle: function (path) {
            this.append2Header(this.create("link", {
                href: path,
                rel: "stylesheet",
                type: "text/css"
            }));
        },
        linkScript: function (url, callback) {
            this.readyDone(this.append2Header(this.create("script", {
                src: url,
                type: "text/javascript"
            })), callback);
        },
        readyDone: function (element, callback) {
            if (element.readyState) { //IE
                element.onreadystatechange = function () {
                    if (element.readyState == "loaded" || element.readyState == "complete") {
                        element.onreadystatechange = null;
                        callback && callback();
                    }
                };
            } else { //Others
                if (callback) element.onload = callback;
            }
            //notify
        },
        use: function (buildinName, callback) {
            var env = this;
            if (!util.isArr(buildinName)) {
                buildinName = [buildinName];
            } else if (util.isStr(buildinName) && (buildinName.indexOf(",") > 0)) {
                buildinName = buildinName.split(",");
            }
            each(buildinName, function (m) {
                var src = position() + "build-in";
                if (!m.beginWith("/")) src += "/";
                env.load(src + m + ".js", 'js', callback);
            });
            return this;
        },
        /**
         * load resource for page
         * @param path like '/js/XXX.YY' which oppo to public_url
         * @param type file type
         * @param call callback
         * @returns {Window.L}
         */
        load: function (path, type, call) {
            var env = this;
            if (util.isArr(path)) {
                //同一个组合中也按照顺序加载
                if (path.length > 1) {
                    var loadItem = function (index, callback) {
                        var type = getResourceType(path[index]);
                        if (index == (path.length - 1)) {
                            //last one
                            env.load(path[index], type, callback);
                        } else {
                            env.load(path[index], type, function () {
                                //load next
                                loadItem(1 + index, callback);
                            });
                        }
                    };
                    loadItem(0, call);
                } else {
                    env.load(path[1], null, call);
                }
            } else {/* is string */
                if (!type) type = env.getResourceType(path);
                if (resourceLibrary.has(path)) {
                    /* 本页面加载过将不再重新载入
                     * 如果库在之前定义过(那么制定到这里的时候一定是加载过的，因为之后加在完成才能执行回调序列)
                     * 可以直接视为加在完毕
                     */
                    call.call();
                } else {
                    //现仅仅支持css,js,ico的类型
                    //注意的是，直接使用document.write('<link .....>') 可能導致html頁面混亂。。。
                    switch (type) {
                        /* css and icon is important less ,do not wait it done*/
                        case 'css':
                            env.linkStyle(pathful(path));
                            call.call();
                            break;
                        case 'js':
                            env.linkScript(pathful(path), call);
                            break;
                        case 'ico':
                            env.linkIcon(pathful(path));
                            call.call();
                            break;
                        default:
                            throw "undefined:" + type;
                    }
                    /* mark this path has pushed */
                    resourceLibrary.add(path);
                }
            }
            return env;
        }
    };

    var readyStack = {
        heap: [], /*fifo*/
        stack: []/*folo*/
    };
    var flag_page_load_done = false;
    //传递给loadone方法的
    var parameters_for_ready_done_callback = {
        plugins: [] /*插件加载队列*/
    };
    document.onreadystatechange = function () {
        if (document.readyState === "complete" || document.readyState === "loaded") {
            document.onreadystatechange = null;
            var i;
            for (i = 0; i < readyStack.heap.length; i++) (readyStack.heap[i])();
            for (i = readyStack.stack.length - 1; i >= 0; i--) (readyStack.stack[i])();
            flag_page_load_done = true;
            util.isFunc(callback_while_all_ready_done) && callback_while_all_ready_done(parameters_for_ready_done_callback);
        }
    };
    return {
        ready: function (c, prepend) {
            prepend ? ReadyGoo.stack.push(c) : ReadyGoo.heap.push(c);
        },
        clone: function (context) {
            var instance = {};
            context && each(context, function (item, key) {
                instance[key] = item;
            });
            return instance;
        }
    };
})(function (pps) {
    //plugin load on sequence
    var lq = function (i) {
        if (i < pps.plugins.length) {
            L.load(pps.plugins[i][0], null, function () {
                var call = pps.plugins[i][1];
                call && call();
                lq(++i);
            });
        }
    };
    lq(0);
});

/**
 P: {
            JsMap: {},//plugin autoload start
            import: function (option) {
                L.init(option, this.JsMap, true);
            },
            get: function (name, dft) {
                return name ? (O.notempty(name, this.JsMap) ? this.JsMap[name] : (dft || false)) : this.JsMap;
            },
            load: function (pnm, call) {
if (pnm in this.JsMap) pnm = this.JsMap[pnm];
if (ild) {
    // it will not put into quene if page has load done！
    L.load(pnm, null, call);
} else {
    pps.plugins.push([pnm, call]);
}
return this;
},
initlize:  function (sele, opts, funcNm, pluNm, call) {
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
 */