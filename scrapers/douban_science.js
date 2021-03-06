const path = require('path')
const fs = require('fs').promises

async function getBooks (page) {
  if (!await page.$('.chart-dashed-list>li')) {
    throw new Error('cannot find target element')
  }
  return page.$$eval('.chart-dashed-list>li', items => items.map(item => {
    const name = item.querySelector('.clearfix>a').innerHTML
    const author = item.querySelector('.subject-abstract').innerHTML.trim().split(' / ')[0]
    const img = item.querySelector('.subject-cover').src
    const rate = Number(item.querySelector('.font-small').innerHTML)
    const url = item.querySelector('.media__img>a').href
    const json = { name, author, img, rate, url }
    return json
  }))
}

module.exports = async function start ({ page }) {
  let books = []
  const statCode = (await page.goto('https://book.douban.com/latest?subcat=%E7%A7%91%E5%AD%A6%E6%96%B0%E7%9F%A5')).status()
  if (statCode === 403) {
    throw new Error('access to douban is restricted')
  }
  let pageCnt = 1
  try {
    pageCnt = await page.$eval('.paginator>:nth-last-child(2)', item => Number(item.innerHTML))
  } catch {
    pageCnt = 1
  }
  for (let i = 1; i <= pageCnt; i++) {
    await page.goto(`https://book.douban.com/latest?subcat=%E7%A7%91%E5%AD%A6%E6%96%B0%E7%9F%A5&p=${i}`, { waitUntil: 'domcontentloaded' })
    books = books.concat(await getBooks(page))
  }
  const updateTime = new Date().getTime()
  books = { category: 'douban_science', time: updateTime, data: books }
  await fs.writeFile(path.join(__dirname, '/../results/douban_science.json'), JSON.stringify(books))
  console.log(`douban_science updated successfully at ${new Date()}`)
}
