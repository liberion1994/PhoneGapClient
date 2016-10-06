/**
 * Created by liboyuan on 2016/10/6.
 */

var panelVM = new Vue({
    el: '#panel-v',
    data: {
        username: '未知用户'
    },
    methods: {
        turnToPage: function (name) {
            if (mainView.activePage.name == name) {
                return myApp.closePanel();
            }
            mainView.router.load({url: name + '.html', animatePages: false, ignoreCache: true});
            myApp.closePanel();
        },
        logout: function () {
            localStorage.removeItem('auth');
            localStorage.removeItem('username');
            myApp.closePanel();
            myApp.alert('已登出，回到登录页面', '登出成功', function () {
                myApp.loginScreen();
            });
        }
    }
});