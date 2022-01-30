const express = require("express")
const app = express()
const fs = require('fs').promises
const port = 3030
const douban = require("./scrapers/douban")
const douban_literature = require("./scrapers/douban_literature")

async function startScrapers(func) {
    await douban()
    await douban_literature()
}

startScrapers()
setInterval(startScrapers, 10800000)

app.listen(port, () => {
    console.log(`api.bookmeet.tk running at http://127.0.0.1:${port}`)
})
app.get("/", (req, res) => {
    res.send("Welcome to api.bookmeet.tk!")
})
app.get("/douban", async (req, res) => {
    let data
    if (req.query.t) {
        switch (req.query.t) {
            case "literature":
                data=JSON.parse(await fs.readFile("./results/douban_literature.json"))
                break
            default:
                data=JSON.parse(await fs.readFile("./results/douban.json"))
                break
        }
    } else {
        data=JSON.parse(await fs.readFile("./results/douban.json"))
    }
    if (req.query.n) {
        data.data = data.data.slice(0, parseInt(req.query.n))
        res.json(data)
    } else {
        res.json(data)
    }
})
