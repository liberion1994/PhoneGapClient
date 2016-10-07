// var baseUrl = 'http://liberion.space/';
var baseUrl = 'http://127.0.0.1:3000/';
var myApp = new Framework7();
var $$ = Framework7.$;

var AgentCommandType = {
    LeftTable:  0,
    EnterTable: 1,
    LeaveTable: 2,
    Prepare:    3,
    UnPrepare:  4,
    InGame:     5,
    Disconnect: 6
};

var AgentStatus = {
    HALL        : 1,
    UNPREPARED  : 2,
    PREPARED    : 3,
    IN_GAME     : 4
};

var GameStatus = {
    OFFER_MAJOR_AMOUNT  : 1,
    CHOOSE_MAJOR_COLOR  : 2,
    RESERVE_CARDS       : 3,
    CHOOSE_A_COLOR      : 4,
    PLAY_CARDS          : 5
};

// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: false
});

var tableInfoBundle;

setTimeout(function () {
    if (localStorage['auth']) {
        $$.ajax({
            type: 'GET',
            url: baseUrl + 'tables/current_table/info',
            data: {auth: localStorage['auth']},
            dataType: "json",
            success: function (table) {
                tableInfoBundle = table;
                initSocket();
                mainView.router.load({url: 'game.html', ignoreCache: true});
            },
            error: function (xhr) {
                switch (xhr.status) {
                    case 401:
                        myApp.alert('身份验证失败，请重新登录', '发生错误', function () {
                            loginScreen();
                        });
                        break;
                    case 400:
                        //means not in any table
                        initSocket();
                        mainView.router.load({url: 'table-list.html', ignoreCache: true});
                        break;
                    default:
                        break;
                }
            }
        });
    }
    else
        loginScreen();
}, 500);

//page init
myApp.onPageAfterAnimation('table-list', function (page) {
    initTableList();
});
myApp.onPageAfterAnimation('game', function (page) {
    initTable();
});


myApp.onPageBeforeRemove('table-list', function (page) {
    pauseTableList();
});
myApp.onPageBeforeRemove('game', function (page) {
    pauseTable();
});