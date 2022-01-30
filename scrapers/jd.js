const puppeteer = require("puppeteer")
const fs = require("fs").promises
async function getBooks(page) {
    return page.$$eval(".main-content-list>div", items => items.map(item => {
        const name = item.querySelector(".main-list-content-right>div>p[title]").title
        const author = item.querySelector(".main-list-content-right>div a[href*='writer']").innerHTML
        const img = item.querySelector(".main-list-content-left img").src
        const rate = 0
        const url = item.querySelector(".main-list-content-left a").href
        const json = { "name": name, "author": author, "img": img, "rate": rate, "url": url }
        return json
    }))
}
module.exports = async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let books = []
    await page.goto("https://book.jd.com/booktop/0-0-0.html?category=1713-0-0-0-10002-1")
    for (let i = 1; i <= 5; i++) {
        await page.click(`.pageGination>ul>li[data-index='${i}']`)
        books = books.concat(await getBooks(page))
    }
    refreshTime = new Date().getTime()
    books = { "category": "jd", "time": refreshTime, "data": books }
    await fs.writeFile("./results/jd.json", JSON.stringify(books))
    console.log(`jd refreshed at ${new Date(refreshTime)}`)
    await browser.close()
}