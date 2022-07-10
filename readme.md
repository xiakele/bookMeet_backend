# bookMeet_backend

## 简介

通过Node.js的puppeteer库爬取并解析相关数据，以JSON的格式传递给前端

## 支持的数据源

|      数据源      |     url     |
| :--------------: | :---------: |
|   豆瓣新书速递   |   /douban   |
|   豆瓣搜索书目   |   /search   |
| 豆瓣获取书籍标签 |  /getTags   |
|  当当新书热卖榜  |  /dangdang  |
|  超星图书好书榜  |  /chaoxing  |
| 中图网图书畅销榜 | /booksChina |

## 支持的参数

### 类型 (c)

|         数据源          |         url          |
| :---------------------: | :------------------: |
|   豆瓣新书速递 - 文学   | /douban?c=literature |
|   豆瓣新书速递 - 小说   |   /douban?c=novel    |
| 豆瓣新书速递 - 科学新知 |  /douban?c=science   |

### 搜索内容 (q)

“豆瓣搜索书目”适用

### 数量 (n)

所有源皆适用

### 书籍id (id)，请求id (idd)

“豆瓣获取书籍标签”适用（适配原始前端请求）

### 例子

- 获取中图网图书畅销榜的前5本：/booksChina?n=5

- 获取豆瓣新书速递 - 文学的前10本：/douban?c=literature&n=10 或 /douban?n=10&c=literature

- 豆瓣搜索“朝花夕拾”：/search?q=朝花夕拾
- 查询书籍id为33420947（三体全集），请求id为1的标签：/getTags?id=33420947&idd=1

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

- "category" - String类型，表示数据源
- "time" - Number类型，表示数据最后爬取的时间
- "data" - Array类型，每个元素包含一本书的信息，用JSON储存，其中
  - "name" - String类型，书名
  - "author" - String类型，作者
  - "img" - String类型，封面图片
  - "rate" - Number类型，满分10分的用户评分
  - "url" - String类型，书本在相关数据源的链接

特别地，“豆瓣获取书籍标签”返回的数据格式与其余源有些许差别，例：

```json
{
  "category": "getTags",
  "time": 1656998613649,
  "data": [
    "反乌托邦",
    "乔治·奥威尔",
    "政治寓言",
    "政治",
    "1984",
    "外国文学"
  ],
  "id": 1
}
```

其中，

- "category", "time" - 同上
- "data" - Array类型，每个元素包含一个String类型标签
- "id" - Number类型，请求时携带的请求id

## 错误处理

当请求发生错误时，返回空数据，例：

```json
{
  "category": "search",
  "time": "-1",
  "data": []
}
```

其中，

- "category" - String类型，表示数据源
- "time" - Number类型，-1表示请求发生错误
- "data" - Array类型，空数组

特别地，当”豆瓣获取书籍标签“发生错误时，会额外返回"id"属性，值为传入的"idd"参数
