const puppeteer = require("puppeteer")
const fs = require("fs").promises
async function getBooks(page) {
    if (! await page.$(".bookList li")) {
        throw new Error("cannot find target element")
    }
    return page.$$eval(".bookList li", items => items.map(item => {
        const name = item.querySelector(".name>a").innerHTML
        const author = item.querySelector(".author>a").innerHTML
        const img = item.querySelector("img").src
        const rate = (item.querySelectorAll(".startWrap>.one").length + item.querySelectorAll(".startWrap>.half").length * 0.5) * 2
        const url = item.querySelector(".name>a").href
        const json = { "name": name, "author": author, "img": img, "rate": rate, "url": url }
        return json
    }))
}
module.exports = async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        let books = []
        // await page.goto(`http://www.bookschina.com/24hour/1_0_1/`)
        // const pageCnt = await page.$eval(".p-skip b", item => Number(item.innerHTML))
        for (let i = 1; i <= 10; i++) {
            await page.goto(`http://www.bookschina.com/24hour/1_0_${i}`, { waitUntil: "domcontentloaded" })
            books = books.concat(await getBooks(page))
        }
        updateTime = new Date().getTime()
        books = { "category": "booksChina", "time": updateTime, "data": books }
        await fs.writeFile(`${__dirname}/../results/booksChina.json`, JSON.stringify(books))
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}