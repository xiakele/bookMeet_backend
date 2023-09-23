const path = require('path')
const fs = require('fs').promises

const subcatToFilename = {
  全部: '',
  文学: '_literature',
  小说: '_novel',
  科学新知: '_science'
}

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

async function fetch (page, subcat) {
  let books = []
  const baseURI = `https://book.douban.com/latest?subcat=${encodeURIComponent(subcat)}`
  const statCode = (await page.goto(baseURI, { waitUntil: 'domcontentloaded' })).status()
  if (statCode === 403) {
    throw new Error('access to douban is restricted')
  }
  const pageCnt = await page.$eval('.paginator>:nth-last-child(2)', item => Number(item.innerHTML))
    .catch(() => 1)
  for (let i = 1; i <= pageCnt; i++) {
    await page.goto(`${baseURI}&p=${i}`, { waitUntil: 'domcontentloaded' })
    books = books.concat(await getBooks(page))
  }
  const updateTime = new Date().getTime()
  books = { category: `douban${subcatToFilename[subcat]}`, time: updateTime, data: books }
  await fs.writeFile(path.join(__dirname, `/../results/douban${subcatToFilename[subcat]}.json`), JSON.stringify(books))
  console.log(`douban${subcatToFilename[subcat]} updated successfully at ${new Date()}`)
}

module.exports = async function ({ page, data: subcat }) {
  await fetch(page, subcat)
}
