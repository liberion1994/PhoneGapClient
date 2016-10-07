/**
 * Created by liboyuan on 2016/10/4.
 */
var loginScreenVM = new Vue({
    el: '.login-screen',
    data: {
        isReg: false,
        username: null,
        password: null,
        repeatPassword: null
    },
    methods: {
        submit: function () {
            if (this.isReg) {
                if (this.repeatPassword != this.password)
                    return myApp.alert('两次输入的密码不一致', '出错了');
                this.reg();
            } else {
                this.login();
            }
        },
        reg: function () {
            var _this = this;
            $$.ajax({
                type: 'POST',
                url: baseUrl + 'users/register',
                data: {username: this.username, password: this.password},
                dataType: 'json',
                success: function () {
                    myApp.alert('将自动登录', '注册成功', function () {
                        _this.login();
                    });
                },
                error: function (xhr) {
                    myApp.alert(xhr.responseText, '注册失败');
                }
            });
        },
        login: function () {
            $$.ajax({
                type: 'POST',
                url: baseUrl + 'users/login',
                data: {username: this.username, password: this.password},
                dataType: 'json',
                success: function (msg) {
                    localStorage['auth'] = msg.auth;
                    localStorage['username'] = msg.username;
                    panelVM.username = msg.username;
                    initSocket();
                    myApp.closeModal('.login-screen');
                    mainView.router.load({url: 'table-list.html', ignoreCache: true});
                },
                error: function (msg) {
                    myApp.alert(msg.responseText, '登录失败');
                }
            });
        }
    }
});

function loginScreen() {
    pauseTableList();
    deleteSocket();
    myApp.loginScreen();
}