const express = require("express")
const app = express()
const fs = require('fs').promises
const port = 3030
const douban = require("./scrapers/douban")

async function startScraper(func) {
    await func()
    setInterval(func, 10800000)
}

startScraper(douban)

app.listen(port, () => {
    console.log(`api.bookmeet.tk running at http://127.0.0.1:${port}`)
})
app.get("/", (req, res) => {
    res.send("Welcome to api.bookmeet.tk!")
})
app.get("/douban", async (req, res) => {
    if (req.query.n) {
        tmp = JSON.parse(await fs.readFile("./results/douban.json"))
        tmp.data = tmp.data.slice(0,parseInt(req.query.n))
        res.json(tmp)
    } else {
        res.json(JSON.parse(await fs.readFile("./results/douban.json")))
    }
})
