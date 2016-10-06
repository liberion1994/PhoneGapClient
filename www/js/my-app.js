var myApp = new Framework7();
var $$ = Framework7.$;

// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: false
});

setTimeout(function () {
    if (localStorage['auth'])
        mainView.router.loadPage('table-list.html');
    else
        myApp.loginScreen();
}, 500);

//page init
myApp.onPageAfterAnimation('table-list', function (page) {
    initTableList();
});

myApp.onPageBeforeRemove('table-list', function(page) {
    removeTableListVM();
});