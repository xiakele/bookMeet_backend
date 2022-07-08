const fs = require("fs").promises

module.exports = async function getTags({ page, data: { id, reqNum } }) {
    try {
        const statCode = (await page.goto(`https://www.douban.com/subject/${id}/`, { waitUntil: "domcontentloaded" })).status()
        if (statCode >= 400) {
            if (statCode == 403) {
                throw new Error("access to douban is restricted")
            }
            return { "category": "getTags", "time": -1, "data": [], "id": reqNum * 1 }
        }
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
        await fs.writeFile(`${__dirname}/../results/tags/${id}.json`, JSON.stringify({ "time": updateTime, "data": tags }))
        return { "category": "getTags", "time": updateTime, "data": tags, "id": reqNum * 1 }
    } catch (err) {
        throw err
    }
}