const path = require('path')
const fs = require('fs').promises

async function getBooks (page) {
  if (!await page.$('.good_text')) {
    throw new Error('cannot find target element')
  }
  await page.waitForFunction('document.querySelectorAll(".good_text .score_num > span").length===16', { timeout: 5000 })
  return page.$$eval('.good_text', items => items.map(item => {
    const name = item.querySelector('h3 > a').title
    const author = item.querySelector('br+p').innerHTML
    const img = item.querySelector('img').src
    const rate = item.querySelector('.score_num > span').innerHTML === '(0人评价)' ? 0 : Math.round(Number(item.querySelector('.score_num font').innerHTML) * 20) / 10
    const url = item.querySelector('h3 > a').href
    const json = { name, author, img, rate, url }
    return json
  }))
}

module.exports = async function start ({ page }) {
  let books = []
  await page.goto('http://book.chaoxing.com/', { waitUntil: 'domcontentloaded' })
  books = await getBooks(page)
  const updateTime = new Date().getTime()
  books = { category: 'chaoxing', time: updateTime, data: books }
  await fs.writeFile(path.join(__dirname, '/../results/chaoxing.json'), JSON.stringify(books))
  console.log(`chaoxing updated successfully at ${new Date()}`)
}
