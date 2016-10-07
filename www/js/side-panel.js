/**
 * Created by liboyuan on 2016/10/6.
 */

var panelVM = new Vue({
    el: '#panel-v',
    data: {
        username: localStorage['username'] || '未知用户'
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
            mainView.router.load({pageName: 'welcome', animatePages: false, ignoreCache: true});
            localStorage.removeItem('auth');
            localStorage.removeItem('username');
            myApp.closePanel();
            deleteSocket();
            pauseTableList();
            myApp.alert('已登出，回到登录页面', '登出成功', function () {
                loginScreen();
            });
        }
    }
});