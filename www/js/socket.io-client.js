/**
 * Created by liboyuan on 2016/10/6.
 */

//socket should be connect after login
var socket;

function initSocket() {
    deleteSocket();
    socket = io.connect(baseUrl)
        .on('connect', function() {
            console.log('con');
        })
        .on('disconnect', function() {
            console.log('dis');
        })
        .on('auth', function () {
            console.log('auth');
            socket.emit('auth', localStorage['auth']);
        })
        .on('auth_done', function () {
            console.log('auth_done');
        })
        .on('auth_err', function () {
            console.log('auer');
            myApp.alert('身份验证失败，请重新登录', '发生错误', function () {
                loginScreen();
            });
        })
        .on('err', function (msg) {
            myApp.alert(msg, '发生错误');
        })
        .on('fail', function (msg) {
            myApp.alert(msg, '失败了');
        })
        .on('event', function (event) {
            if (event.type == AgentCommandType.EnterTable && event.username == localStorage['username']) {
                mainView.router.load({url: 'game.html', ignoreCache: true});
            } else {
                if (mainView.activePage.name != 'game') {
                    //TODO 加一个提醒好一点
                    mainView.router.load({url: 'game.html', ignoreCache: true});
                } else {
                    //已经在游戏页了，VM可用
                    if (event.eid != tableVM.currentEventId ++) {
                        //TODO resync here
                    }
                    //TODO 处理自己离开时候的leave事件，添加一个left事件（为了处理被踢出去）
                    switch (event.type) {
                        case AgentCommandType.LeaveTable:
                            tableVM.onLeaveTable(event);
                            emitCommand(AgentCommandType.LeftTable, {tid: event.tid});
                            break;
                        case AgentCommandType.EnterTable:
                            tableVM.onEnterTable(event);
                            break;
                        case AgentCommandType.Prepare:
                            tableVM.onPrepare(event);
                            break;
                        case AgentCommandType.UnPrepare:
                            tableVM.onUnPrepare(event);
                            break;
                    }
                }
            }

        });
}

function deleteSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

function emitCommand (commandType, commandContent) {
    switch (commandType) {

        case AgentCommandType.Prepare:
        case AgentCommandType.UnPrepare:
        case AgentCommandType.LeaveTable:
            socket.emit('command', { type: commandType });
            break;
        case AgentCommandType.LeftTable:
        case AgentCommandType.EnterTable:
        case AgentCommandType.InGame:
            socket.emit('command', { type: commandType, content: commandContent });
            break;
        default:
            break;
    }
}