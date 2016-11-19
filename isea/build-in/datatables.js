    L.P.datatables = (function () {
        var conf = {
            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
        };
        return {
            api: null,//datatable的API对象
            ele: null, // datatable的jquery对象 dtElement
            cr: null,//当前操作的行,可能是一群行 current_row
            //设置之后的操作所指定的DatatableAPI对象
            create: function (dt, opt) {
                var ns = L.NS(this);
                ns.target = L.jq(dt);
                opt && L.init(opt,conf,true);
                console.log(ns.target)
                ns.api = ns.target.DataTable(conf);
                return ns;
            } ,
            //为tableapi对象加载数据,参数二用于清空之前的数据
            load: function (data, clear) {
                if(L.O.isStr(data)){
                    data = L.O.toObj(data);/* T json string to json object */
                }
                if(L.O.isObj(data)){
                    /* for appending a row */
                    data = [data];
                }
                if (!this.api)  throw "No Datatable API binded!";
                if (false !== clear){
                    this.api.clear();//it will clean the old data if the param 2 is empty or value of true
                }
                this.api.rows.add(data).draw();
                return this;
            },
            //表格发生了draw事件时设置调用函数(表格加载,翻页都会发生draw事件)
            onDraw: function (callback) {
                if (this.target) {
                    this.target.on('draw.dt', function (event, settings) {
                        callback(event, settings);
                    });
                } else {
                    console.log("No Datatables binded!");
                }
                return this;
            },
            //获取表格指定行的数据
            data: function (e) {
                return this.api.row(this.cr = e).data();
            },
            /**
             * @param nd new data
             * @param line update row
             * @returns {*}
             */
            update: function (nd, line) {
                if (line === undefined) line = this.cr;
                if (line) {
                    if (L.O.isArr(line)) {
                        for (var i = 0; i < line.length; i++) {
                            this.update(nd, line[i]);
                        }
                    } else {
                        //注意:如果出现这样的错误"DataTables warning: table id=[dtable 实际的表的ID] - Requested unknown parameter ‘acceptId’ for row X 第几行出现了错误 "
                        this.api.row(line).data(nd).draw(false);
                    }
                } else {
                    console.log('no line to update!');
                }
            }
        };
    })();
