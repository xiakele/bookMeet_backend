const fs = require("fs").promises
async function getBooks(page) {
    if (! await page.$(".good_text")) {
        throw new Error("cannot find target element")
    }
    return page.$$eval(".good_text", items => items.map(item => {
        const name = item.querySelector("h3 > a").title
        const author = item.querySelector("br+p").innerHTML
        const img = item.querySelector("img").src
        const rate = item.querySelector(".score_num > span").innerHTML == "(0人评价)" ? 0 : Math.round(Number(item.querySelector(".score_num font").innerHTML) * 20) / 10
        const url = item.querySelector("h3 > a").href
        const json = { "name": name, "author": author, "img": img, "rate": rate, "url": url }
        return json
    }))
}
module.exports = async function start({ page }) {
    try {
        let books = []
        await page.goto(`http://book.chaoxing.com/`)
        books = await getBooks(page)
        updateTime = new Date().getTime()
        books = { "category": "chaoxing", "time": updateTime, "data": books }
        await fs.writeFile(`${__dirname}/../results/chaoxing.json`, JSON.stringify(books))
        console.log(`chaoxing updated successfully at ${new Date()}`)
    } catch (err) {
        throw err
    }
}