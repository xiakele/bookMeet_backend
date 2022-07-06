const puppeteer = require("puppeteer")
module.exports = async function getTags(id, reqNum) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        page.goto(`https://www.douban.com/subject/${id}/`).catch(err => browser.close())
        let tags = await page.waitForRequest(req => req.url().includes("erebor.douban.com"))
            .then(data => /crtr=7:(.*)\|3:/.exec(decodeURIComponent(data.url()))[1])
            .then(str => str.split("|7:"))
            .then(allTags => {
                let validTags = []
                allTags.forEach(tag => {
                    if (tag.length >= 2 && tag.length <= 4) {
                        validTags.push(tag)
                    }
                })
                return validTags
            })
        updateTime = new Date().getTime()
        return { "category": "getTags", "time": updateTime, "data": tags, "id": reqNum * 1 }
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}