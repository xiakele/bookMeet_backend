const puppeteer = require("puppeteer")
const fs = require("fs").promises
async function getBooks(page) {
    return page.$$eval(".bang_list>li", items => items.map(item => {
        const name = item.querySelector(".pic>a>img").title.split("（")[0]
        const author = item.querySelector(".publisher_info>a").innerHTML
        const img = item.querySelector(".pic>a>img").src
        const rate = Number(parseFloat(item.querySelector(".tuijian").innerHTML.split("%")[0])/20)
        const url = item.querySelector(".pic>a").href
        const json = { "name": name, "author": author, "img": img, "rate": rate, "url": url }
        return json
    }))
}
module.exports = async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let books = []
    for (let i = 1; i <= 25; i++) {
        await page.goto(`http://bang.dangdang.com/books/newhotsales/1-${i}`)
        books = books.concat(await getBooks(page))
    }
    refreshTime = new Date().getTime()
    books = { "category": "dangdang", "time": refreshTime, "data": books }
    await fs.writeFile("./results/dangdang.json", JSON.stringify(books))
    console.log(`dangdang refreshed at ${new Date(refreshTime)}`)
    await browser.close()
}