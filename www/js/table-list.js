/**
 * Created by liboyuan on 2016/10/5.
 */

var tableListVM;



function initTableList() {
    tableListVM = new Vue({
        el: '#table-list-v',
        data: {
            tables: []
        },
        methods: {
            enter: function (tid, sid) {
                console.log(tid + ',' + sid);
            },
            showInfo: function (tid, sid) {
                
            },
            resync: function () {
                var _this = this;
                $$.ajax({
                    type: 'GET',
                    url: 'http://127.0.0.1:3000/tables/simple_info',
                    data: {auth: localStorage['auth']},
                    dataType: "json",
                    success: function (res) {
                        console.log('resync');
                        _this.tables = res;
                        setTimeout(function () {
                            _this.resync();
                        }, 15 * 1000);
                    },
                    error: function () {
                        myApp.alert('身份验证失败，请重新登录', '发生错误', function () {
                            myApp.loginScreen();
                        });
                    }
                });
            }
        },
        created: function () {
            this.username = localStorage['username'];
            this.resync();
        }
    });
}

function removeTableListVM() {
    tableListVM = null;
}