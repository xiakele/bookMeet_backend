# api.bookmeet.tk

## 简介

通过Node.js的puppeteer库爬取并解析相关数据，以JSON的格式传递给前端

## 支持的数据源

|      数据源      |     url     |
| :--------------: | :---------: |
|   豆瓣新书速递   |   /douban   |
|  当当新书热卖榜  |  /dangdang  |
|  京东图书销量榜  |     /jd     |
| 中图网图书畅销榜 | /bookschina |

## 支持的参数

### 类型 (c)

|         数据源          |         url          |
| :---------------------: | :------------------: |
|   豆瓣新书速递 - 文学   | /douban?c=literature |
|   豆瓣新书速递 - 小说   |   /douban?c=novel    |
| 豆瓣新书速递 - 科学新知 |  /douban?c=science   |

### 数量 (n)

所有支持的数据源皆适用

### 例子

获取中图网图书畅销榜的前5本：/bookschina?n=5

获取豆瓣新书速递 - 文学的前10本：/douban?t=literature&n=10 或 /douban?n=10&t=literature

## 数据格式

返回JSON格式数据，例：

```json
{
  "category": "douban",
  "time": 1643520838436,
  "data": [
    {
      "name": "宋代中国的改革：王安石及其新政",
      "author": "刘子健",
      "img": "https://img1.doubanio.com/view/subject/s/public/s34062348.jpg",
      "rate": 8.3,
      "url": "https://book.douban.com/subject/35653740/"
    }
  ]
}
```

其中，

- "category" - String类型，表示数据的类型

- "time" - Number类型，表示数据最后爬取的时间
- "data" - Array类型，每个元素包含一本书的信息，用JSON储存，其中
  - "name" - String类型，书名
  - "author" - String类型，作者
  - "img" - String类型，封面图片
  - "rate" - Number类型，满分10分的用户评分
  - "url" - String类型，书本在相关数据源的链接

