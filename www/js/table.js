/**
 * Created by liboyuan on 2016/10/6.
 */
var tableVM;
var windowWidth = $$(window).width();

Vue.component('pokerInHand', {
    props: ['pokerEntity', 'pokerSize', 'index', 'inHandPokerProp'],
    template:
        '<div class="poker" v-bind:style="pokerStyle" v-on:click="onChosen">' +
            '<div class="poker-top" v-html="cardText" v-bind:style="topAndBottomStyle"></div>' +
            '<div class="poker-center" v-bind:style="centerFontSize" v-html="pokerEntity.color"></div>' +
            '<div class="poker-bottom" v-html="cardText" v-bind:style="topAndBottomStyle"></div>' +
        '</div>',
    data: function () {
        return {chosen: false}
    },
    methods: {
        onChosen: function () {
            this.chosen = !this.chosen;
            this.$emit('chosen', this.index, this.chosen);
        }
    },
    computed: {
        topAndBottomStyle: function () {
            return {
                'width': 1.5 * parseFloat(this.pokerSize['font-size']) + 'px'
            }
        },
        cardText: function () {
            var ret = '';
            switch (this.pokerEntity.color) {
                case '♥': ret = '<i class="iconfont">&#xe655;</i><br>'; break;
                case '♠': ret = '<i class="iconfont">&#xe681;</i><br>'; break;
                case '♦': ret = '<i class="iconfont">&#xe67f;</i><br>'; break;
                case '♣': ret = '<i class="iconfont">&#xe67e;</i><br>'; break;
                case 'J':
                    if (this.pokerEntity.number == 0) {
                        return '小<br>王'
                    } else {
                        return '大<br>王';
                    }
            }
            switch (this.pokerEntity.number) {
                case 11: ret += 'J'; break;
                case 12: ret += 'Q'; break;
                case 13: ret += 'K'; break;
                case 14: ret += 'A'; break;
                default: ret += this.pokerEntity.number;
            }
            return ret;
        },
        pokerStyle: function () {
            var ret = this.pokerSize;
            var transformX = 0, transformY = -15 * this.chosen;
            ret.top = this.inHandPokerProp.startY + 'px';
            ret.left = this.inHandPokerProp.startX + 'px';
            if (this.index >= this.inHandPokerProp.firstLineSum) {
                transformX = this.inHandPokerProp.interWidth * (this.index - this.inHandPokerProp.firstLineSum);
                transformY += 0.5 * parseFloat(ret.height);
            } else {
                transformX = this.inHandPokerProp.interWidth * this.index;
            }
            ret.transform = 'translate3d(' + transformX + 'px, ' + transformY + 'px, 0)';
            if (this.chosen)
                ret.border = '2px solid dodgerblue';
            else
                ret.border = '2px solid white';
            if (this.pokerEntity.color == '♥' || this.pokerEntity.color == '♦' ||
                this.pokerEntity.color == 'J' && this.pokerEntity.number == 1) {
                ret.color = 'red';
            } else {
                ret.color = 'black';
            }
            return ret;
        },
        centerFontSize: function () {
            var fontSize = parseFloat(this.pokerSize.height) / 2;
            return {'font-size': fontSize * 0.75 + 'px', 'line-height': this.pokerSize.height};
        }
    }
});

function initTable() {
    if (tableInfoBundle) {
        console.log('init bundled');
        initTableVM(tableInfoBundle);
        tableInfoBundle = null;
    } else {
        $$.ajax({
            type: 'GET',
            url: baseUrl + 'tables/current_table/info',
            data: {auth: localStorage['auth']},
            dataType: "json",
            success: function (table) {
                console.log('init no bundle');
                initTableVM(table);
            },
            error: function (xhr) {
                switch (xhr.status) {
                    case 401:
                        myApp.alert('身份验证失败，请重新登录', '发生错误', function () {
                            loginScreen();
                        });
                        break;
                    case 400:
                        myApp.alert('没有找到进行中的游戏，返回大厅', '失败了', function () {
                            mainView.router.load({url: 'table-list.html', ignoreCache: true});
                        });
                        break;
                    default:
                        break;
                }
            }
        });
    }
}

function initTableVM(tableInfoBundle) {
    console.log(tableInfoBundle);
    if (tableVM) {
        tableVM.agentSid = tableInfoBundle.agentSid;
        tableVM.id = tableInfoBundle.id;
        tableVM.seats = tableInfoBundle.seats;
        tableVM.currentEventId = tableInfoBundle.currentEventId;
        tableVM.masterInGame = tableInfoBundle.masterInGame;
        tableVM.game = tableInfoBundle.game;
        tableVM.timerCount = tableInfoBundle.timerCount;
        return;
    }
    tableVM = new Vue({
        el: '#table-v',
        data: {
            cardSize: {
                'width': windowWidth / 7 - 4 + 'px',
                'height': windowWidth / 7 * 1.5 - 4 + 'px',
                'font-size': windowWidth / 35 + 'px',
                'line-height': windowWidth / 35 + 'px'
            },
            operationAreaSize: {
                'height': windowWidth / 7 * 1.5 * 1.75 + 40 + 'px',
                'padding': '5px 2px',
                'position': 'relative',
                'overflow': 'hidden'
            },
            tableDisplayAreaSize: {
                'height': $$('#table-page-content').height() - parseFloat($$('#table-page-content').css('padding-top')) - (windowWidth / 7 * 1.5 * 1.75 + 40) - 15 + 'px',
                'padding': '5px 2px 0',
                'position': 'relative',
                'overflow': 'hidden'
            },

            agentSid: tableInfoBundle.agentSid,
            id: tableInfoBundle.id,
            seats: tableInfoBundle.seats,
            currentEventId: tableInfoBundle.currentEventId,
            masterInGame: tableInfoBundle.masterInGame,
            game: tableInfoBundle.game,
            timerCount: tableInfoBundle.timerCount
        },
        computed: {
            inHandPokerProp: function () {
                var sum = this.game.cards.length;
                if (sum > 14)
                    if (sum > 28)
                        sum = Math.ceil(sum / 2);
                    else
                        sum = 14;
                return {
                    firstLineSum: sum,
                    parWidth: windowWidth - 10,
                    interWidth: (windowWidth - 10 - windowWidth / 7) / (sum - 1) > (windowWidth / 14) ? (windowWidth / 14) : (windowWidth - 10 - windowWidth / 7) / (sum - 1) ,
                    startX: 5,
                    startY: windowWidth / 7 * 1.5 * 0.25 + 40
                }
            },
            myStatus: function () {
                return this.seats[this.agentSid].status;
            },
            gameStatus: function () {
                if (!this.game)
                    return '尚未开始';
                switch (this.game.currentTurn.status) {
                    case GameStatus.OFFER_MAJOR_AMOUNT:
                        return '报主阶段';
                    case GameStatus.CHOOSE_MAJOR_COLOR:
                        return '叫主阶段';
                    case GameStatus.RESERVE_CARDS:
                        return '埋底阶段';
                    case GameStatus.CHOOSE_A_COLOR:
                        return '叫A阶段';
                    case GameStatus.PLAY_CARDS:
                        return '出牌阶段';
                    default:
                        return '未知阶段';
                }
            },
            seatUsername: function () {
                var ret = [];
                for (var ind = 0; ind < 5; ind ++) {
                    var rInd = (this.agentSid + ind) % 5;
                    if (!this.seats[rInd])
                        ret[ind] = '空座位';
                    else
                        ret[ind] = this.seats[rInd].username;
                }
                return ret;
            },
            seatStatus: function () {
                var ret = [];
                for (var ind = 0; ind < 5; ind ++) {
                    var rInd = (this.agentSid + ind) % 5;
                    if (!this.seats[rInd])
                        ret[ind] = 0;
                    else
                        ret[ind] = this.seats[rInd].status;
                }
                return ret;
            }

        },
        methods: {
            chooseCard: function (index, chosen) {
                this.game.cards[index].chosen = chosen;
            },
            playCards: function () {
                var size = this.game.cards.length;
                for (var i = 0; i < size; i ++) {
                    if (this.game.cards[i].chosen) {
                        this.game.cards.splice(i, 1);
                        i --;
                        size --;
                    }
                }
            },
            prepare: function () {
                emitCommand(AgentCommandType.Prepare);
            },
            unPrepare: function () {
                emitCommand(AgentCommandType.UnPrepare);
            },
            leave: function () {
                emitCommand(AgentCommandType.LeaveTable);
            },
            chat: function () {
                myApp.prompt('说点什么呢', '发言',
                    function (msg) {
                        if (msg != '') {
                            socket.emit('chat', msg);
                        }
                    },
                    function () {
                    }
                );
            },
            onLeaveTable: function (event) {
                //here sid won't equal agentSid
                if (event.force)
                    notify('事件', event.username + '被系统踢出了座位');
                else
                    notify('事件', event.username + '离开了座位');
                Vue.set(this.seats, event.sid, null);
            },
            onEnterTable: function (event) {
                //here sid won't equal agentSid
                notify('事件', event.username + '加入了座位');
                Vue.set(this.seats, event.sid, {
                    username: event.username,
                    majorNumber: event.majorNumber,
                    status: AgentStatus.UNPREPARED,
                    tableId: this.id
                });
            },
            onPrepare: function (event) {
                this.seats[event.sid].status = AgentStatus.PREPARED;
                var allPrepared = true;
                for (var i = 0; i < 5; i ++) {
                    if (!this.seats[i] || this.seats[i].status != AgentStatus.PREPARED) {
                        allPrepared = false;
                        break;
                    }
                }
                if (allPrepared) {
                    $$.ajax({
                        type: 'GET',
                        url: baseUrl + 'tables/current_table/game/info',
                        data: {auth: localStorage['auth']},
                        dataType: 'json',
                        success: function (res) {
                            notify('事件', '游戏开始');
                            //TODO set value here
                            this.game = res;
                        },
                        error: function (xhr) {
                            switch (xhr.status) {
                                case 401:
                                    myApp.alert('身份验证失败，请重新登录', '发生错误', function () {
                                        loginScreen();
                                    });
                                    break;
                                case 400:
                                    myApp.alert(xhr.responseText, '出错了', function () {
                                        initTable();
                                    });
                                    break;
                            }
                        }
                    });
                }
            },
            onUnPrepare: function (event) {
                this.seats[event.sid].status = AgentStatus.UNPREPARED;
            },
            onChat: function (sid, content) {
                notify(this.seats[sid].username, content);
            }
        },
        filters: {

        },
        created: function () {

        }
    });
}

function pauseTable() {
    if (tableVM) {
        tableVM = null;
    }
}