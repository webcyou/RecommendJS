/*
 * Author: Daisuke Takayama
 */
/// <reference path='_all.ts' />

'use strict';
var e = eval, global: NodeJS.Global = e('this');

module RecommendAlgorithm {
  import User = Model.User;
  import Item = Model.Item;
  import RecommendUser = Model.RecommendUser;

  export class Recommend extends RecommendModel {
    private static _instance: Recommend = null;
    private _user_list: User[] = [];
    private _user_id: number = 1;

    constructor(
      userData?: any,
      userId?: number
      ) {
      super();

      if (Recommend._instance) {
        if(userData !== void 0) {
          Recommend._instance.setUserData(userData);
          if(userId !== void 0) {
            Recommend._instance._user_id = userId;
          }
        }
        return Recommend._instance;
      } else {
        if(userData !== void 0) {
          this.setUserData(userData);
          if(userId !== void 0) {
            this._user_id = userId;
          }
        }
        Recommend._instance = this;
      }
    }

    public setUserData(userData: User[]) {
      var that = this;
      userData.forEach((user) => {
        that._user_list.push(User.fromData(user));
      });
    }

    public setUserId(userId: number) {
      this._user_id = userId;
    }

    public getTopMatch(userId?: number): RecommendUser[] {
      if(userId) {
        return this.getTopMatchUserList(this._user_list, userId);
      } else {
        return this.getTopMatchUserList(this._user_list, this._user_id);
      }
    }

    public getRecommend(userId?: number): Item[] {
      if(userId) {
        return this.getRecommendations(this._user_list, userId);
      } else {
        return this.getRecommendations(this._user_list, this._user_id);
      }
    }

  }
}

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
