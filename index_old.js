const { Cluster } = require("puppeteer-cluster")
const chalk = require("chalk")
const cors = require("cors")
const express = require("express")
const app = express()
const fs = require("fs").promises
const port = 3030
const startScrapers = require(`${__dirname}/startScrapers`)
const search = require(`${__dirname}/scrapers/search`)
const getTags = require(`${__dirname}/scrapers/getTags.js`)

async function readJSON(fileDir) {
    const category = /.*\/(.*).json$/.exec(fileDir)[1]
    try {
        return JSON.parse(await fs.readFile(fileDir))
    } catch (err) {
        console.log(chalk.bgRed(`an error occured while reading ${fileDir}\n${err}\n`))
        return { "category": category, "time": -1, "data": [] }
    }
}

async function start() {
    const cluster = await Cluster.launch({ concurrency: Cluster.CONCURRENCY_PAGE, maxConcurrency: 10, retryLimit: 1 })

    app.use(cors({ origin: /https:\/\/(.*\.)?bookmeet\.tk$/ }))

    app.listen(port, () => {
        console.log(chalk.inverse(`https://api.bookmeet.tk running at http://127.0.0.1:${port}\n`))
        setInterval(startScrapers, 21600000, cluster)
        startScrapers(cluster)
    })

    app.get("/", (req, res) => {
        res.send("Welcome to api.bookmeet.tk!")
    })

    app.get("/douban", async (req, res) => {
        let data = {}
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
        let data = {}
        data = await readJSON(`${__dirname}/results/dangdang.json`)
        if (req.query.n) {
            data.data = data.data.slice(0, parseInt(req.query.n))
        }
        res.json(data)
    })

    app.get("/chaoxing", async (req, res) => {
        let data = {}
        data = await readJSON(`${__dirname}/results/chaoxing.json`)
        if (req.query.n) {
            data.data = data.data.slice(0, parseInt(req.query.n))
        }
        res.json(data)
    })

    app.get("/bookschina", async (req, res) => {
        let data = {}
        data = await readJSON(`${__dirname}/results/booksChina.json`)
        if (req.query.n) {
            data.data = data.data.slice(0, parseInt(req.query.n))
        }
        res.json(data)
    })

    app.get("/search", async (req, res) => {
        let data = {}
        if (!req.query.q) {
            res.json({ "category": "search", "time": "-1", "data": [] })
        } else {
            try {
                data = await cluster.execute({ query: req.query.q }, search)
                if (req.query.n) {
                    data.data = data.data.slice(0, parseInt(req.query.n))
                }
                res.json(data)
            } catch (err) {
                res.json({ "category": "search", "time": -1, "data": [] })
                console.log(chalk.bgRed(`an error occured while searching for "${req.query.q}"\n${err}\n`))
            }
        }
    })

    app.get("/gettags", async (req, res) => {
        let data = {}
        if (!(req.query.id && req.query.idd)) {
            res.json({ "category": "getTags", "time": -1, "data": [], "id": req.query.idd * 1 })
        } else {
            try {
                try {
                    const localData = JSON.parse(await fs.readFile(`${__dirname}/results/tags/${req.query.id}.json`))
                    data = { "category": "getTags", "time": localData.time, "data": localData.data, "id": req.query.idd * 1 }
                } catch {
                    data = await cluster.execute({ id: req.query.id, reqNum: req.query.idd }, getTags)
                }
                if (req.query.n) {
                    data.data = data.data.slice(0, parseInt(req.query.n))
                }
                res.json(data)
            } catch (err) {
                res.json({ "category": "getTags", "time": -1, "data": [], "id": req.query.idd * 1 })
                if (err.name != "TypeError") {
                    console.log(chalk.bgRed(`an error occured while fetching tags for bookID ${req.query.id}\n${err}\n`))
                }
            }
        }
    })
}

start()