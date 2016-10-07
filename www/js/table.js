/**
 * Created by liboyuan on 2016/10/6.
 */
var tableVM;
var windowWidth = $$(window).width();

var cards = [
    { number: 1, color: 'J', type: 6 },
    { number: 1, color: 'J', type: 6 },
    { number: 0, color: 'J', type: 6 },
    { number: 3, color: '♥', type: 5 },
    { number: 3, color: '♥', type: 5 },
    { number: 3, color: '♦', type: 4 },
    { number: 3, color: '♦', type: 4 },
    { number: 7, color: '♥', type: 3 },
    { number: 7, color: '♥', type: 3 },
    { number: 7, color: '♠', type: 2 },
    { number: 7, color: '♦', type: 2 },
    { number: 12, color: '♥', type: 1 },
    { number: 11, color: '♥', type: 1 },
    { number: 8, color: '♥', type: 1 },
    { number: 6, color: '♥', type: 1 },
    { number: 2, color: '♥', type: 1 },
    { number: 10, color: '♠', type: 0 },
    { number: 8, color: '♠', type: 0 },
    { number: 4, color: '♠', type: 0 },
    { number: 3, color: '♠', type: 0 },
    { number: 14, color: '♦', type: 0 },
    { number: 8, color: '♦', type: 0 },
    { number: 5, color: '♦', type: 0 },
    { number: 9, color: '♣', type: 0 },
    { number: 8, color: '♣', type: 0 },
    { number: 6, color: '♣', type: 0 },
    { number: 5, color: '♣', type: 0 },
    { number: 5, color: '♣', type: 0 },
    { number: 3, color: '♣', type: 0 },
    { number: 3, color: '♣', type: 0 },
    { number: 2, color: '♣', type: 0 }
];
//TODO need to add id to each card
for (var i = 0; i < cards.length; i ++) {
    cards[i].id = i;
}

Vue.component('pokerInHand', {
    props: ['pokerEntity', 'pokerSize', 'index', 'inHandPokerProp'],
    template:
        '<div class="poker" v-bind:style="pokerStyle" v-on:click="onChosen">' +
            '<div class="poker-top" v-html="cardText"></div>' +
            '<div class="poker-center" v-bind:style="centerFontSize" v-html="pokerEntity.color"></div>' +
            '<div class="poker-bottom" v-html="cardText"></div>' +
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
        cardText: function () {
            var ret = this.pokerEntity.color + '<br>';
            if (this.pokerEntity.color == 'J') {
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
            ret.top = this.inHandPokerProp.bottomLineTop - 0.25 * parseFloat(ret.height) * this.chosen;
            if (this.index >= this.inHandPokerProp.firstLineSum) {
                ret.left = this.inHandPokerProp.leftRowLeft +
                    this.inHandPokerProp.interWidth * (this.index - this.inHandPokerProp.firstLineSum) + 'px';
            } else {
                ret.left = this.inHandPokerProp.leftRowLeft + this.inHandPokerProp.interWidth * this.index + 'px';
                ret.top -= 0.5 * parseFloat(ret.height);
            }
            ret.top += 'px';
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
            return {'font-size': fontSize + 'px', 'line-height': this.pokerSize.height};
        }
    }
});

function initTable() {
    if (tableInfoBundle) {
        initTableVM(tableInfoBundle);
        tableInfoBundle = null;
    } else {
        $$.ajax({
            type: 'GET',
            url: baseUrl + 'tables/current_table/info',
            data: {auth: localStorage['auth']},
            dataType: "json",
            success: function (table) {
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
    if (tableVM) {
        tableVM.agentSid = tableInfoBundle.agentSid;
        tableVM.id = tableInfoBundle.id;
        tableVM.seats = tableInfoBundle.seats;
        tableVM.currentEventId = tableInfoBundle.currentEventId;
        tableVM.masterInGame = tableInfoBundle.masterInGame;
        tableVM.game = tableInfoBundle.game;
        tableVM.timerCount = tableInfoBundle.timerCount
        return;
    }
    tableVM = new Vue({
        el: '#table-v',
        data: {
            cards: cards,
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
                var sum = this.cards.length;
                if (sum > 14)
                    if (sum > 28)
                        sum = Math.ceil(sum / 2);
                    else
                        sum = 14;
                return {
                    firstLineSum: sum,
                    parWidth: windowWidth - 10,
                    interWidth: (windowWidth - 10 - windowWidth / 7) / (sum - 1) > (windowWidth / 14) ? (windowWidth / 14) : (windowWidth - 10 - windowWidth / 7) / (sum - 1) ,
                    leftRowLeft: 5,
                    bottomLineTop: windowWidth / 7 * 1.5 * 0.75 + 40
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
            }
        },
        methods: {
            chooseCard: function (index, chosen) {
                tableVM.cards[index].chosen = chosen;
            },
            playCards: function () {
                var size = this.cards.length;
                for (var i = 0; i < size; i ++) {
                    if (this.cards[i].chosen) {
                        this.cards.splice(i, 1);
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
                    function (value) {
                    },
                    function () {
                    }
                );
            },
            onLeaveTable: function (event) {
                if (event.sid == this.agentSid) {
                    mainView.router.load({url: 'table-list.html', ignoreCache: true});
                } else {
                    myApp.alert(event.username + '离开了座位');
                }
            },
            onEnterTable: function (event) {
                //here sid won't equal agentSid
                myApp.alert(event.username + '加入了座位');
                this.seats[event.sid] = {
                    username: event.username,
                    majorNumber: event.majorNumber,
                    status: AgentStatus.UNPREPARED,
                    tableId: this.id
                };
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
                        url: baseUrl + '/tables/current_table/game/info',
                        success: function (res) {
                            //TODO set value here
                            console.log(res);
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
            }
        },
        filters: {

        }
    });
}

function pauseTable() {
    if (tableVM) {
        tableVM = null;
    }
}