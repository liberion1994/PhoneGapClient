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
                emitCommand(AgentCommandType.EnterTable, {tid: tid, sid: sid});
            },
            showInfo: function (tid, sid) {
                //TODO get user statistics
            },
            resync: function () {
                if (mainView.activePage.name != 'table-list')
                    return;
                var _this = this;
                $$.ajax({
                    type: 'GET',
                    url: baseUrl + 'tables/simple_info',
                    data: {auth: localStorage['auth']},
                    dataType: "json",
                    success: function (res) {
                        console.log('resync');
                        _this.tables = res;
                    },
                    error: function (xhr) {
                        if (xhr.status == 401) {
                            myApp.alert('身份验证失败，请重新登录', '发生错误', function () {
                                loginScreen();
                            });
                        }
                    }
                });
            }
        },
        created: function () {
            var _this = this;
            this.resync();
            this.resyncTimer = setInterval(function () {
                _this.resync();
            }, 10 * 1000);
        }
    });
}

function pauseTableList() {
    if (tableListVM) {
        clearInterval(tableListVM.resyncTimer);
        tableListVM = null;
    }
}