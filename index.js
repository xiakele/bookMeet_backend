const express = require("express")
const app = express()
const fs = require("fs").promises
const port = 3030
const startScrapers=require("./startScrapers")


app.listen(port, () => {
    console.log(`https://api.bookmeet.tk running at http://127.0.0.1:${port}\n`)
    startScrapers()
    setInterval(startScrapers, 21600000)
})

app.get("/", (req, res) => {
    res.send("Welcome to api.bookmeet.tk!")
})

app.get("/douban", async (req, res) => {
    let data
    if (req.query.t) {
        switch (req.query.t) {
            case "literature":
                data = JSON.parse(await fs.readFile("./results/douban_literature.json"))
                break
            case "novel":
                data = JSON.parse(await fs.readFile("./results/douban_novel.json"))
                break
            case "science":
                data = JSON.parse(await fs.readFile("./results/douban_science.json"))
                break
            default:
                data = JSON.parse(await fs.readFile("./results/douban.json"))
                break
        }
    } else {
        data = JSON.parse(await fs.readFile("./results/douban.json"))
    }
    if (req.query.n) {
        data.data = data.data.slice(0, parseInt(req.query.n))
    }
    res.json(data)
})

app.get("/dangdang", async (req, res) => {
    data = JSON.parse(await fs.readFile("./results/dangdang.json"))
    if (req.query.n) {
        data.data = data.data.slice(0, parseInt(req.query.n))
    }
    res.json(data)
})

app.get("/jd", async (req, res) => {
    data = JSON.parse(await fs.readFile("./results/jd.json"))
    if (req.query.n) {
        data.data = data.data.slice(0, parseInt(req.query.n))
    }
    res.json(data)
})