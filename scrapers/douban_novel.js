const puppeteer = require("puppeteer")
const fs = require("fs").promises
async function getBooks(page) {
    if (! await page.$(".chart-dashed-list>li")) {
        throw new Error("cannot find target element")
    }
    return page.$$eval(".chart-dashed-list>li", items => items.map(item => {
        const name = item.querySelector(".clearfix>a").innerHTML
        const author = item.querySelector(".subject-abstract").innerHTML.trim().split(" / ")[0]
        const img = item.querySelector(".subject-cover").src
        const rate = Number(item.querySelector(".font-small").innerHTML)
        const url = item.querySelector(".media__img>a").href
        const json = { "name": name, "author": author, "img": img, "rate": rate, "url": url }
        return json
    }))
}
module.exports = async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        let books = []
        await page.goto("https://book.douban.com/latest?subcat=%E5%B0%8F%E8%AF%B4")
        do {
            books = books.concat(await getBooks(page))
            await page.click(".next")
            await page.waitForNetworkIdle()
        } while (await page.$eval(".next", item => item.childElementCount))
        updateTime = new Date().getTime()
        books = { "category": "douban_novel", "time": updateTime, "data": books }
        await fs.writeFile(`${__dirname}/../results/douban_novel.json`, JSON.stringify(books))
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}