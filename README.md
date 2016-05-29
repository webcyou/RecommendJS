# RecommendJS
RecommendJS - Recommend Algorithm JavaScript Library

![](http://webcyou.com/recommend_js/demo/img/screen_shot_ogp.png)

### これは何？
「RecommendJS」は、レコメンドアルゴリズムを簡単に実装できる、JavaScriptライブラリです。


### demo
[デモページ](http://webcyou.com/recommend_js/demo/)

### Install

#### Bower
```
bower install recommend
```
#### npm

```
npm install recommend_js
```


### Basic Usage

```
<script src="recommend.js"></script>
```

Singleton Object

```
var recommend = new Recommend();
```

or

```
var recommend = global.Recommend;
```

### Start DataSet

```
var recommend = new Recommend(data, userId);
```

or

```
var recommend = global.Recommend.setUserData(data);
```

### Basic Data

review.json
```
{
  "user_list": [{
    "id": 1,
    "name": "サンプルユーザー1",
    "item_list": [{
      "id": 1,
      "name": "ドラゴンクエスト",
      "score": 8
    },
    {
      "id": 2,
      "name": "スーパーマリオ",
      "score": 10
    }]
  }
}
```


### Function

類似性の高いユーザーを取得

```
global.Recommend.getTopMatch(userId);
```

評価のないアイテムをレコメンド
```
global.Recommend.getRecommend(userId);
```


### Algorithm

・ピアソン相関係数

・ユーザーベース協調フィルタリング

### Functions Reference

| FunctionsName | SetValue         | Detail                | 
| --------------- |:---------------:| -------------------- |
| setUserData(data) | object | Recommendオブジェクトに、レビューデータをセット |
| setUserId(userId) | number | Recommendオブジェクトに、参照元となるユーザーIDをセット |
| getTopMatch(userId) | number | 与えられたユーザーIDのユーザーと類似性の高いユーザーを取得 |
| getRecommend(userId) | number | 与えられたユーザーIDのユーザーの評価のないアイテムをレコメンド |

### Author
Daisuke Takayama
[Web帳](http://www.webcyou.com/)


### License
Free

### Thanks
素材提供：株式会社ブリリアントサービス
『星宝転生ジュエルセイバー』[http://www.jewel-s.jp/](http://www.jewel-s.jp/)