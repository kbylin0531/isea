/**
 * Created by linzhv on 11/18/16.
 * Note:
 *  querySelector() only return the first match
 *  querySelectorAll return all pattern matches
 */


//fake-constant define
var BREAK = '[break]';
var CONTINUE = '[continue]';
var BASE_DIR = null;
var BROWSER = {};//{type: "Chrome", version: "50.0.2661.94"}
// if(typeof PUBLIC_URL == 'undefined'){
//     PUBLIC_URL = '/';//script parent url
// }

var isea = (function (callback_while_all_ready_done) {
    "use strict";

    var _headTag = null;

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
            if (!Array.isArray(properties)) properties = [properties];
            for (var i = 0; i < properties.length; i++)if (obj.hasOwnProperty(properties[i])) count++;
            return count === properties.length ? 1 : (count === 0 ? 0 : -1);
        }
    };

    function each(obj, call, meta) {
        var result;
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            result = call(obj[key], key, meta);
            if (result === BREAK) break;
            if (result === CONTINUE) continue;
            if (result !== undefined) return result;
        }
    }

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

        if (!Array.isArray) Array.isArray = function (el) {
            return util.gettype(el) === "array";
        };

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

    //get the position of this file
    (function () {
        // console.log(location, dirname(location.pathname));
        // BASE_DIR = location.pathname.replace(/\\/g, '/').replace(/\/[^\/]*$/, '') + "/";
        var scripts = document.getElementsByTagName("script");
        each(scripts, function (script) {
            if (script.src && script.src.endWith("/isea/index.js")) {
                BASE_DIR = script.src.replace("/isea/index.js", "/");
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
        parse: function (queryString) {
            var o = {};
            if (queryString) {
                queryString = decodeURI(queryString);
                var arr = queryString.split("&");
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

    var loader = {
        library: {
            _: {},
            parse: function (name) {
                if (name.indexOf('/') >= 0) {
                    name = name.split('/');
                    name = name[name.length - 1];
                }
                return name;
            },
            has: function (name) {
                return this.parse(name) in this._;
            },
            add: function (name) {
                this._[this.parse(name)] = true;
                return this;
            }
        },
        stack: [],
        push: function (path) {
            var env = this;
            env.stack.push(path);
            return env;
        },
        pathful: function (path) {
            if (!path.beginWith("http") && !path.beginWith("/")) {
                path = BASE_DIR + path;
            }
            return path;
        },
        _load: function (path, call) {
            var env = this, isjs = false;
            //Note: using "document.write('<link .....>')" may cause load out of order
            var type = getResourceType(path);
            switch (type) {
                /* css and icon is important less ,do not wait it done*/
                case 'css':
                    env.append2Header(dom.create("link", {
                        href: path,
                        rel: "stylesheet",
                        type: "text/css"
                    }));
                    break;
                case 'ico':
                    env.append2Header(dom.create("link", {
                        href: path,
                        rel: "shortcut icon"
                    }));
                    break;
                case 'js':
                    isjs = true;
                    env.waitLoadone(env.append2Header(dom.create("script", {
                        src: path
                    })), call);
                    break;
                default:
                    throw "undefined type";
            }
            /* mark this path has pushed */
            env.library.add(path);
            !isjs && call && call.call();
            return isjs;
        },
        // run autoload in order and continue if another one to load exist
        // parameter 2 means if it wait current load done and go next
        run: function (call) {
            var env = this;
            if (this.stack.length) {
                var isjs = false;
                var path = env.stack.shift();

                if (Array.isArray(path)) {
                    var len = path.length;
                    var loadItem = function (index, callback) {
                        var e = this;
                        var p = env.pathful(path[index]);
                        if (index == len - 1) {
                            //last one
                            env._load(p, callback);
                        } else {
                            env._load(p, function () {
                                //load next
                                loadItem(1 + index, callback);
                            });
                        }
                    };
                    return loadItem(0, call);
                } else {
                    path = this.pathful(path);
                }

                if (!env.library.has(path)) isjs = this._load(path, call);

                if (!isjs) {
                    //callback while one load finished
                    call && call(path, env.stack.length);
                    //go next
                    env.stack.length && env.run(call);
                }
            }
            // else {
            //     setTimeout(function () {
            //         env.run(call);
            //     }, 3000);
            // }
        },
        append2Header: function (ele) {
            _headTag || (_headTag = document.getElementsByTagName("head")[0]);
            _headTag.appendChild(ele);
            return ele;
        },
        waitLoadone: function (ele, call) {
            if (ele.readyState) { //IE
                ele.onreadystatechange = function () {
                    if (ele.readyState == "loaded" || ele.readyState == "complete") {
                        ele.onreadystatechange = null;
                        call && call();
                    }
                };
            } else { //Others
                call && (ele.onload = call)
            }
        },
        use: function (buildinName, callback) {
            var env = this;
            if (!Array.isArray(buildinName)) {
                buildinName = [buildinName];
            } else if (util.isStr(buildinName) && (buildinName.indexOf(",") > 0)) {
                buildinName = buildinName.split(",");
            }
            each(buildinName, function (m) {
                var src = BASE_DIR + "isea/buildin";
                if (!m.beginWith("/")) src += "/";
                env.load(src + m + ".js", callback);
            });
            return env;
        },
        _loadStack: [],
        /**
         * load resource for page
         * multiple load will go the diffirent process
         */
        load: function (path, call) {
            this.push(path).run(call);
            return this;
        }
    };

    var readyStack = {
        heap: [], /*fifo*/
        stack: []/*folo*/
    };
    var flag_page_load_done = false;
    // parameters for loadone
    var parameters_for_ready_done_callback = {
        plugins: [] /* plugin load order */
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
        init: init,
        guid: guid,
        dom: dom,
        util: util,
        client: client,
        cookie: cookie,
        loader: loader,
        ready: function (c, prepend) {
            prepend ? readyStack.stack.push(c) : readyStack.heap.push(c);
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
