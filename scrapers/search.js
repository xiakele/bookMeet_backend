async function getBooks (page) {
  if (!await page.$('.sc-bZQynM')) {
    return []
  }
  return page.$$eval('.sc-bZQynM', items => items.map(item => {
    const name = item.querySelector('.title-text').innerHTML
    const author = item.querySelector('.abstract') ? item.querySelector('.abstract').innerHTML.split(' / ')[0] : ''
    const img = item.querySelector('img').src
    const rate = item.querySelector('.rating_nums') ? Number.parseFloat(item.querySelector('.rating_nums').innerHTML) : 0
    const url = item.querySelector('.title-text').href
    const json = { name, author, img, rate, url }
    return json
  }))
}

module.exports = async function start ({ page, data: { query } }) {
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0')
  const statCode = (await page.goto(`https://search.douban.com/book/subject_search?search_text=${query}`, { waitUntil: 'domcontentloaded' })).status()
  if (statCode === 403) {
    throw new Error('access to douban is restricted')
  }
  const books = await getBooks(page)
  const updateTime = new Date().getTime()
  return { category: 'search', time: updateTime, data: books }
}
