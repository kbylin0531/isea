L.P.modal = (function () {
    return {
        config : {},
        /**
         * 创建一个Modal对象,会将HTML中指定的内容作为自己的一部分拐走
         * @param selector 要把哪些东西添加到modal中的选择器
         * @param opt modal配置
         * @returns object
         */
        create: function (selector, opt) {
            this.config = { /* default config */
                //text
                title: "Modal",
                confirmText: '提交',
                cancelText: '取消',
                //behaviour
                confirm: null,
                cancel: null,
                show: null,//going to show
                shown: null,//show done
                hide: null,//going to hide
                hidden: null,//hide done
                //others
                backdrop: "static",
                keyboard: true
            };
            L.init(opt || {},this.config);

            var instance = L.NS(this),
                id = 'modal_' + L.guid(),
                modal = $(L.newEle("div.modal.fade",{
                    id:id,
                    "aria-hidden":"true",
                    role:"dialog"
                })),
                dialog = $(L.newEle("div.modal-dialog")),
                header, content, body;
            var ic = instance.config;

            if (typeof ic.backdrop !== "string") ic['backdrop'] = ic['backdrop'] ? 'true' : 'false';
            $("body").append(modal.attr('data-backdrop', ic['backdrop']).attr('data-keyboard', ic.keyboard ? 'true' : 'false')) ;

            modal.append(dialog.append(content = $(L.newEle("div.modal-content"))));

            //set header and body
            content.append(header =
                $(L.newEle("div.modal-header",{},'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>')))
                .append(body = $(L.newEle("div.modal-body")).append(L.jq(selector).removeClass('hidden')));//suggest selector has class 'hidden'
            //设置足部
            content.append($(L.newEle("div.modal-footer")).append(
                $(L.newEle("button.btn.btn-sm._cancel",{"type":"button","dataDismiss":"modal"},ic['cancelText'])).click(ic.cancel)
            ).append(
                $(L.newEle("button.btn.btn-sm._confirm",{"type":"button"},ic['confirmText'])).click(ic.confirm)
            ));

            //确认和取消事件注册
            instance.target = modal.modal('hide');

            ic['title'] && instance.title(ic['title']);
            //事件注册
            L.U.each(['show', 'shown', 'hide', 'hidden'], function (eventname) {
                modal.on(eventname + '.bs.modal', function () {
                    //handle the element size change while window resizedntname,config[eventname]);
                    ic[eventname] && (ic[eventname])();
                });
            });
            return instance;
        },
        //get the element of this.target while can not found in global jquery selector
        getElement: function (selector){
            return this.target.find(selector);
        },
        onConfirm: function (callback){
            this.target.find("._confirm").unbind("click").click(callback);
            return this;
        },
        onCancel: function (callback){
            this.target.find("._cancel").unbind("click").click(callback);
            return this;
        },
        //update title
        title: function (newtitle) {
            var title = this.target.find(".modal-title");
            if (!title.length) {
                var h = L.NE('h4.modal-title');
                h.innerHTML = newtitle;
                this.target.find(".modal-header").append(h);
            }
            title.text(newtitle);
            return this;
        },
        show: function () {
            this.target.modal('show');
            return this;
        },
        hide: function () {
            this.target.modal('hide');
            return this;
        },



        _alert:null,
        alert:function (msg) {
            if(!this._alert){
                var div = document.createElement('span');
                div.id = 'L-modal-alert';
                document.body.appendChild(div);
                this._alert = this.create("#L-modal-alert");
            }
            this._alert.getElementById("L-modal-alert").innerHTML = msg;
            this._alert.show();
        }
    };
})();