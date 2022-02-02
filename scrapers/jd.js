const puppeteer = require("puppeteer")
const fs = require("fs").promises
async function getBooks(page) {
    return await page.$eval("pre", item => {
        let data = JSON.parse(item.innerHTML).data.books
        return data.map(item => {
            const name = item.bookName
            const author = item.authors.length?item.authors[0].name:""
            const img = item.coverUrl
            const rate = 0
            const url="https://item.jd.com/"+item.bookId+".html"
            const json = { "name": name, "author": author, "img": img, "rate": rate, "url": url }
            return json
        })
    })
}
module.exports = async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        await page.goto("https://gw-e.jd.com/client.action?body=%7B%22moduleType%22:1,%22page%22:1,%22pageSize%22:100,%22scopeType%22:1%7D&functionId=bookRank")
        let books = await getBooks(page)
        updateTime = new Date().getTime()
        books = { "category": "jd", "time": updateTime, "data": books }
        await fs.writeFile(`${__dirname}/../results/jd.json`, JSON.stringify(books))
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}