const puppeteer = require("puppeteer")

module.exports = async function getSubjects(id, reqNum) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        await page.goto(`https://www.douban.com/subject/${id}/`, { waitUntil: "domcontentloaded" })
        let introCnt = await page.$$(".intro")
        if (introCnt.length == 0) {
            return { "category": "getSub", time: -1, "data": [], "id": reqNum * 1 }
        } else {
            const intro = await page.$eval(".intro", item => item.innerHTML)
            const dict = ["哲学", "科学", "文学", "心理学", "政治", "工程学", "计算机", "化学", "物理", "数学", "经济学", "美学", "史学", "生物学", "地理学", "建筑学"]
            let subjects = []
            dict.forEach(item => {
                if (intro.includes(item)) {
                    subjects.push(item)
                }
            })
            updateTime = new Date().getTime()
            return { "category": "getSub", "time": subjects.length ? updateTime : -1, "data": subjects, "id": reqNum * 1 }
        }
    } catch (err) {
        throw err
    } finally {
        await browser.close()
    }
}