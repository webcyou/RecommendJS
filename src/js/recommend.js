var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Model;
(function (Model) {
    var Item = (function () {
        function Item(id, name, score) {
            this.id = id;
            this.name = name;
            this.score = score;
        }
        Item.fromData = function (data) {
            return new Item(parseInt(data.id, 10), data.name, data.score ? parseFloat(data.score) : 0);
        };
        return Item;
    }());
    Model.Item = Item;
})(Model || (Model = {}));
var Model;
(function (Model) {
    var User = (function () {
        function User(id, name, itemList) {
            this.id = id;
            this.name = name;
            this.itemList = itemList;
        }
        User.fromData = function (data) {
            return new User(data.id, data.name, data.item_list ? data.item_list.map(function (m) { return Model.Item.fromData(m); }) : null);
        };
        return User;
    }());
    Model.User = User;
    var RecommendUser = (function (_super) {
        __extends(RecommendUser, _super);
        function RecommendUser() {
            _super.apply(this, arguments);
        }
        RecommendUser.fromData = function (data) {
            var recommendUser = User.fromData(data);
            recommendUser.score = parseFloat(data.score);
            return recommendUser;
        };
        return RecommendUser;
    }(User));
    Model.RecommendUser = RecommendUser;
})(Model || (Model = {}));
var RecommendAlgorithm;
(function (RecommendAlgorithm) {
    var Item = Model.Item;
    var RecommendUser = Model.RecommendUser;
    var RecommendModel = (function () {
        function RecommendModel() {
        }
        RecommendModel.prototype.getUserData = function (data, id) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    return data[i];
                }
            }
        };
        RecommendModel.prototype.getItemDataName = function (data, itemId) {
            for (var i = 0; i < data.length; i++) {
                for (var n = 0; n < data[i].itemList.length; n++) {
                    if (data[i].itemList[n].id == itemId) {
                        return data[i].itemList[n].name;
                    }
                }
            }
        };
        RecommendModel.prototype.getMatchItemIdList = function (myData, otherData) {
            var matchItemIdList = [];
            for (var i = 0; i < myData.itemList.length; i++) {
                for (var n = 0; n < otherData.itemList.length; n++) {
                    if (myData.itemList[i].id === otherData.itemList[n].id) {
                        matchItemIdList.push(myData.itemList[i].id);
                    }
                }
            }
            return matchItemIdList;
        };
        RecommendModel.prototype.getItemScore = function (data, id) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    return data[i].score;
                }
            }
        };
        RecommendModel.prototype.isSearchItem = function (data, id) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    return true;
                }
            }
            return false;
        };
        RecommendModel.prototype.pearson = function (data, myId, otherId) {
            var that = this, myData = this.getUserData(data, myId), otherData = this.getUserData(data, otherId), matchItemIdList = this.getMatchItemIdList(myData, otherData), sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0, n = 0, num = 0, den = 0;
            if (matchItemIdList.length == 0)
                return 0;
            n = matchItemIdList.length;
            matchItemIdList.forEach(function (id) {
                sum1 += that.getItemScore(myData.itemList, id);
                sum2 += that.getItemScore(otherData.itemList, id);
                sum1Sq += Math.pow(that.getItemScore(myData.itemList, id), 2);
                sum2Sq += Math.pow(that.getItemScore(otherData.itemList, id), 2);
                pSum += that.getItemScore(myData.itemList, id) * that.getItemScore(otherData.itemList, id);
            });
            num = pSum - (sum1 * sum2 / n);
            den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) * (sum2Sq - Math.pow(sum2, 2) / n));
            if (den == 0)
                return 0;
            return (num / den);
        };
        RecommendModel.prototype.getTopMatchUserList = function (data, myId) {
            var that = this, topMatchUserList = [];
            data.forEach(function (user) {
                if (user.id !== myId) {
                    topMatchUserList.push(RecommendUser.fromData({
                        id: user.id,
                        name: user.name,
                        score: that.pearson(data, myId, user.id)
                    }));
                }
            });
            topMatchUserList.sort(function (a, b) {
                if (a.score > b.score)
                    return -1;
                if (a.score < b.score)
                    return 1;
                return 0;
            });
            return topMatchUserList;
        };
        RecommendModel.prototype.getRecommendations = function (data, myId) {
            var myData = this.getUserData(data, myId), sim = 0, totals = {}, simSums = {}, recommendItemList = [];
            for (var i in data) {
                if (data[i].id == myId)
                    continue;
                sim = this.pearson(data, myId, data[i].id);
                if (sim <= 0)
                    continue;
                for (var n in data[i].itemList) {
                    var otherItem = data[i].itemList[n];
                    if (!this.isSearchItem(myData.itemList, otherItem.id)) {
                        if (totals[otherItem.id] == void 0) {
                            totals[otherItem.id] = 0;
                        }
                        totals[otherItem.id] += otherItem.score * sim;
                        if (simSums[otherItem.id] == void 0) {
                            simSums[otherItem.id] = 0;
                        }
                        simSums[otherItem.id] += sim;
                    }
                }
            }
            for (var itemId in totals) {
                recommendItemList.push(Item.fromData({
                    id: itemId,
                    name: this.getItemDataName(data, parseInt(itemId, 10)),
                    score: Math.round((totals[itemId] / simSums[itemId]) * 10000) / 10000
                }));
            }
            return recommendItemList;
        };
        return RecommendModel;
    }());
    RecommendAlgorithm.RecommendModel = RecommendModel;
})(RecommendAlgorithm || (RecommendAlgorithm = {}));
'use strict';
var e = eval, global = e('this');
var RecommendAlgorithm;
(function (RecommendAlgorithm) {
    var User = Model.User;
    var Recommend = (function (_super) {
        __extends(Recommend, _super);
        function Recommend(userData, userId) {
            _super.call(this);
            this._user_list = [];
            this._user_id = 1;
            if (Recommend._instance) {
                if (userData !== void 0) {
                    Recommend._instance.setUserData(userData);
                    if (userId !== void 0) {
                        Recommend._instance._user_id = userId;
                    }
                }
                return Recommend._instance;
            }
            else {
                if (userData !== void 0) {
                    this.setUserData(userData);
                    if (userId !== void 0) {
                        this._user_id = userId;
                    }
                }
                Recommend._instance = this;
            }
        }
        Recommend.prototype.setUserData = function (userData) {
            var that = this;
            userData.forEach(function (user) {
                that._user_list.push(User.fromData(user));
            });
        };
        Recommend.prototype.setUserId = function (userId) {
            this._user_id = userId;
        };
        Recommend.prototype.getTopMatch = function (userId) {
            if (userId) {
                return this.getTopMatchUserList(this._user_list, userId);
            }
            else {
                return this.getTopMatchUserList(this._user_list, this._user_id);
            }
        };
        Recommend.prototype.getRecommend = function (userId) {
            if (userId) {
                return this.getRecommendations(this._user_list, userId);
            }
            else {
                return this.getRecommendations(this._user_list, this._user_id);
            }
        };
        Recommend._instance = null;
        return Recommend;
    }(RecommendAlgorithm.RecommendModel));
    RecommendAlgorithm.Recommend = Recommend;
})(RecommendAlgorithm || (RecommendAlgorithm = {}));
if (typeof (module) !== 'undefined') {
    if (typeof (module).exports.Recommend === 'undefined') {
        (module).exports.Recommend = {};
    }
    (module).exports.Recommend = new RecommendAlgorithm.Recommend;
}
if (typeof (global) !== 'undefined') {
    if (typeof global['Recommend'] === 'undefined') {
        global['Recommend'] = {};
    }
    global['Recommend'] = new RecommendAlgorithm.Recommend;
}
