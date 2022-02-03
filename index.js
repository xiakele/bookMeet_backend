const chalk = require("chalk")
const express = require("express")
const app = express()
const fs = require("fs").promises
const port = 3030
const startScrapers = require(`${__dirname}/startScrapers`)

async function readJSON(fileDir) {
    const category = /.*\/(.*).json$/.exec(fileDir)[1]
    try {
        return JSON.parse(await fs.readFile(fileDir))
    } catch (err) {
        console.log(chalk.bgRed(`an error occured while reading ${fileDir}\n${err}\n`))
        return { "category": category, "time": -1, "data": [] }
    }
}

app.listen(port, () => {
    console.log(chalk.inverse(`https://api.bookmeet.tk running at http://127.0.0.1:${port}\n`))
    setInterval(startScrapers, 21600000)
    startScrapers()
})

app.get("/", (req, res) => {
    res.send("Welcome to api.bookmeet.tk!")
})

app.get("/douban", async (req, res) => {
    let data
    if (req.query.c) {
        switch (req.query.c) {
            case "literature":
                data = await readJSON(`${__dirname}/results/douban_literature.json`)
                break
            case "novel":
                data = await readJSON(`${__dirname}/results/douban_novel.json`)
                break
            case "science":
                data = await readJSON(`${__dirname}/results/douban_science.json`)
                break
            default:
                data = await readJSON(`${__dirname}/results/douban.json`)
                break
        }
    } else {
        data = await readJSON(`${__dirname}/results/douban.json`)
    }
    if (req.query.n) {
        data.data = data.data.slice(0, parseInt(req.query.n))
    }
    res.json(data)
})

app.get("/dangdang", async (req, res) => {
    data = await readJSON(`${__dirname}/results/dangdang.json`)
    if (req.query.n) {
        data.data = data.data.slice(0, parseInt(req.query.n))
    }
    res.json(data)
})

app.get("/jd", async (req, res) => {
    data = await readJSON(`${__dirname}/results/jd.json`)
    if (req.query.n) {
        data.data = data.data.slice(0, parseInt(req.query.n))
    }
    res.json(data)
})

app.get("/bookschina", async (req, res) => {
    data = await readJSON(`${__dirname}/results/booksChina.json`)
    if (req.query.n) {
        data.data = data.data.slice(0, parseInt(req.query.n))
    }
    res.json(data)
})