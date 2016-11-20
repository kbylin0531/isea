/**
 * Created by lich4ung on 9/13/16.
 */

/**
 * 停止事件冒泡
 * 如果提供了事件对象，则这是一个非IE浏览器,因此它支持W3C的stopPropagation()方法
 * 否则，我们需要使用IE的方式来取消事件冒泡
 * @param e
 */
var stopBubble = function (e) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    } else {
        window.event.cancelBubble = true;
    }
};
/**
 * 阻止事件默认行为
 * 阻止默认浏览器动作(W3C)
 * IE中阻止函数器默认动作的方式
 * @param e
 * @returns {boolean}
 */
var stopDefault = function (e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    } else {
        window.event.returnValue = false;
    }
    return false;
};