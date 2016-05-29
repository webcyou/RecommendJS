/// <reference path='../_all.ts' />

module Model {

  export class Item {
    constructor(
      public id: number,
      public name: string,
      public score: number
      ) {
    }

    static fromData(data: any): Item {
      return new Item(
        parseInt(data.id, 10),
        data.name,
        data.score ? parseFloat(data.score) : 0
      );
    }
  }

}
