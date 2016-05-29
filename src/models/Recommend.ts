/// <reference path='../_all.ts' />

module RecommendAlgorithm {
  import User = Model.User;
  import Item = Model.Item;
  import RecommendUser = Model.RecommendUser;

  export class RecommendModel {
    constructor() {
    }

    public getUserData(data: any, id: number): User {
      for(var i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          return data[i];
        }
      }
    }

    public getItemDataName(data: any, itemId: number): string {
      for(var i = 0; i < data.length; i++) {
        for(var n = 0; n < data[i].itemList.length; n++) {
          if(data[i].itemList[n].id == itemId) {
            return data[i].itemList[n].name;
          }
        }
      }
    }

    public getMatchItemIdList(myData: User, otherData: User): number[] {
      var matchItemIdList: number[] = [];
      for(var i = 0; i < myData.itemList.length; i++) {
        for(var n = 0; n < otherData.itemList.length; n++) {
          if(myData.itemList[i].id === otherData.itemList[n].id) {
            matchItemIdList.push(myData.itemList[i].id);
          }
        }
      }
      return matchItemIdList;
    }

    public getItemScore(data: Item[], id: number): number {
      for(var i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          return data[i].score;
        }
      }
    }

    public isSearchItem(data: Item[], id: number): boolean {
      for(var i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          return true;
        }
      }
      return false;
    }


    /**
     * pearson correlation coefficient
     * @param data
     * @param myId
     * @param otherId
     * @returns number
    */
    public pearson(data: any, myId: number, otherId: number): number {
      var that = this,
          myData: User = this.getUserData(data, myId),
          otherData: User = this.getUserData(data, otherId),
          matchItemIdList: number[] = this.getMatchItemIdList(myData, otherData),
          sum1: number = 0, sum2: number = 0, sum1Sq: number = 0, sum2Sq: number = 0,
          pSum: number = 0, n: number = 0, num: number = 0, den: number = 0;

      if (matchItemIdList.length == 0) return 0;

      n = matchItemIdList.length;

      matchItemIdList.forEach((id: number) => {
        sum1 += that.getItemScore(myData.itemList, id);
        sum2 += that.getItemScore(otherData.itemList, id);

        sum1Sq += Math.pow(that.getItemScore(myData.itemList, id), 2);
        sum2Sq += Math.pow(that.getItemScore(otherData.itemList, id), 2);

        pSum += that.getItemScore(myData.itemList, id) * that.getItemScore(otherData.itemList, id);
      });

      num = pSum - (sum1 * sum2 / n);

      den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) * (sum2Sq - Math.pow(sum2, 2) / n));

      if (den == 0) return 0;

      return (num / den);
    }

    /**
     * TopMatches User
     * @param data
     * @param myId
     * @returns RecommendUser[]
    */
    public getTopMatchUserList(data: any, myId: number): RecommendUser[] {
      var that = this,
          topMatchUserList: RecommendUser[] = [];

      data.forEach((user: User) => {
        if(user.id !== myId) {
          topMatchUserList.push(
            RecommendUser.fromData({
              id: user.id,
              name: user.name,
              score: that.pearson(data, myId, user.id)
            })
          );
        }
      });

      topMatchUserList.sort((a, b) => {
        if (a.score > b.score) return -1;
        if (a.score < b.score) return 1;
        return 0;
      });

      return topMatchUserList;
    }

    /**
     * Recommendations
     * @param data
     * @param myId
     * @returns Item[]
    */
    public getRecommendations(data: any, myId: number): Item[] {
      var myData: User = this.getUserData(data, myId),
          sim: number = 0,
          totals: Object = {},
          simSums: Object = {},
          recommendItemList: Item[] = [];

      for (var i in data) {
        if(data[i].id == myId) continue;

        sim = this.pearson(data, myId, data[i].id);

        if (sim <= 0) continue;

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
        recommendItemList.push(
          Item.fromData({
            id: itemId,
            name: this.getItemDataName(data, parseInt(itemId, 10)),
            score: Math.round((totals[itemId] / simSums[itemId]) * 10000) / 10000
          })
        );
      }

      return recommendItemList;
    }
  }
}
