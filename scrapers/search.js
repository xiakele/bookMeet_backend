async function getBooks(page) {
    if (! await page.$(".result-list > .result")) {
        return []
    }
    return page.$$eval(".result-list > .result", items => items.map(item => {
        const name = item.querySelector(".nbg").title
        const author = item.querySelector(".subject-cast") ? item.querySelector(".subject-cast").innerHTML.split(" / ")[0] : ""
        const img = item.querySelector("img").src
        const rate = item.querySelector(".rating_nums") ? Number.parseFloat(item.querySelector(".rating_nums").innerHTML) : 0
        const url = item.querySelector(".nbg").href
        const json = { "name": name, "author": author, "img": img, "rate": rate, "url": url }
        return json
    }))
}

module.exports = async function start({ page, data: { query } }) {
    try {
        await page.goto(`https://www.douban.com/search?cat=1001&q=${query}`, { waitUntil: "domcontentloaded" })
        let books = await getBooks(page)
        updateTime = new Date().getTime()
        return { "category": "search", "time": updateTime, "data": books }
    } catch (err) {
        throw err
    }
}