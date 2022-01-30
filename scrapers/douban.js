const puppeteer = require("puppeteer")
const fs = require("fs").promises
async function getBooks(page) {
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
    let books = []
    for (let i = 1; i <= 15; i++){
        await page.goto(`https://book.douban.com/latest?tag=%E5%85%A8%E9%83%A8&p=${i}`)
        books=books.concat(await getBooks(page))
    }
    refreshTime = new Date().getTime()
    books = {"time":refreshTime,"data":books}
    await fs.writeFile("./results/douban.json", JSON.stringify(books))
    console.log(`douban refreshed at ${new Date(refreshTime)}`)
    await browser.close()
}