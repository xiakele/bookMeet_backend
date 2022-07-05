const puppeteer = require("puppeteer")
const fs = require("fs").promises
async function getBooks(page) {
    if (! await page.$(".bang_list>li")) {
        throw new Error("cannot find target element")
    }
    return page.$$eval(".bang_list>li", items => items.map(item => {
        const name = item.querySelector(".pic>a>img").title.split("（")[0]
        const author = item.querySelector(".publisher_info>a").innerHTML
        const img = item.querySelector(".pic>a>img").src
        const rate = Math.round(Number(parseFloat(item.querySelector(".tuijian").innerHTML.split("%")[0]))) / 10
        const url = item.querySelector(".pic>a").href
        const json = { "name": name, "author": author, "img": img, "rate": rate, "url": url }
        return json
    }))
}
module.exports = async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        let books = []
        await page.goto(`http://bang.dangdang.com/books/newhotsales/01.00.00.00.00.00-24hours-0-0-1-1`)
        const pageCnt = await page.$eval(".data > .or+span", data => Number(data.innerHTML.slice(1)))
        for (let i = 1; i <= pageCnt; i++) {
            await page.goto(`http://bang.dangdang.com/books/newhotsales/01.00.00.00.00.00-24hours-0-0-1-${i}`, { waitUntil: "domcontentloaded" })
            books = books.concat(await getBooks(page))
        }
        updateTime = new Date().getTime()
        books = { "category": "dangdang", "time": updateTime, "data": books }
        await fs.writeFile(`${__dirname}/../results/dangdang.json`, JSON.stringify(books))
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}