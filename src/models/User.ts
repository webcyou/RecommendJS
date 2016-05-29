/// <reference path='../_all.ts' />

module Model {

  export class User {
    constructor(
      public id: number,
      public name: string,
      public itemList: Item[]
      ) {
    }

    static fromData(data: any): User {
      return new User(
        data.id,
        data.name,
        data.item_list ? data.item_list.map((m) => { return Item.fromData(m); }) : null
      );
    }
  }

  export class RecommendUser extends User {
    score: number;

    static fromData (data: any): RecommendUser {
      var recommendUser: RecommendUser = <RecommendUser> User.fromData(data);
      recommendUser.score = parseFloat(data.score);
      return recommendUser;
    }
  }

}
