L.P.form = function (form, data) {
    var target ;
    form = L.jq(form);
    L.U.each(data,function (val, key) {
        target = form.find("[name=" + key + "]");
        if (target.length) {/*表单中存在这个name的输入元素*/
            if (target.length > 1) {/* 出现了radio或者checkbox的清空 */
                L.U.each(target,function (item) {
                    if (('radio' === item.type) && parseInt(item.value) == parseInt(val)) {
                        item.checked = true;
                    }
                });
            } else {
                target.val(val);
            }
        } else {
            form.append($('<input name="' + key + '" value="' + val + '" type="hidden">'));
        }
    });
};
