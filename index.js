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

    app.get(["/douban", "/dangdang", "/chaoxing", "/bookschina"], async (req, res) => {
        const subCats = ["literature", "novel", "science"]
        let data = {}
        if (req.query.c) {
            if (req.path == "/douban" && subCats.indexOf(req.query.c) != -1) {
                data = await readJSON(`${__dirname}/results/douban_${req.query.c}.json`)
            } else {
                return res.status(400).json({ "category": req.path.slice(1), "time": -1, "data": [] })
            }
        } else {
            data = await readJSON(`${__dirname}/results/${req.path.slice(1)}.json`)
        }
        if (req.query.n) {
            if (isNaN(req.query.n * 1)) {
                return res.status(400).json({ "category": req.path.slice(1), "time": -1, "data": [] })
            }
            data.data = data.data.slice(0, req.query.n * 1)
        }
        if (data.time == -1) {
            return res.status(500).json(data)
        }
        return res.json(data)
    })

    app.get("/search", async (req, res) => {
        let data = {}
        if (!req.query.q) {
            return res.status(400).json({ "category": "search", "time": -1, "data": [] })
        }
        try {
            data = await cluster.execute({ query: req.query.q }, search)
            if (req.query.n) {
                if (isNaN(req.query.n * 1)) {
                    return res.status(400).json({ "category": req.path.slice(1), "time": -1, "data": [] })
                }
                data.data = data.data.slice(0, req.query.n * 1)
            }
            if (data.data.length == 0) {
                return res.status(404).json(data)
            }
            return res.json(data)
        } catch (err) {
            console.log(chalk.bgRed(`an error occured while searching for "${req.query.q}"\n${err}\n`))
            return res.status(500).json({ "category": "search", "time": -1, "data": [] })
        }
    })

    app.get("/gettags", async (req, res) => {
        let data = {}
        if (isNaN(req.query.id * 1) || isNaN(req.query.idd * 1)) {
            return res.status(400).json({ "category": "getTags", "time": -1, "data": [], "id": req.query.idd * 1 })
        }
        try {
            try {
                const localData = JSON.parse(await fs.readFile(`${__dirname}/results/tags/${req.query.id}.json`))
                data = { "category": "getTags", "time": localData.time, "data": localData.data, "id": req.query.idd * 1 }
            } catch {
                data = await cluster.execute({ id: req.query.id, reqNum: req.query.idd }, getTags)
            }
            if (data.time == -1) {
                return res.status(404).json(data)
            }
            if (req.query.n) {
                if (isNaN(req.query.n * 1)) {
                    return res.status(400).json({ "category": req.path.slice(1), "time": -1, "data": [] })
                }
                data.data = data.data.slice(0, req.query.n * 1)
            }
            return res.json(data)
        } catch (err) {
            if (err.name != "TypeError") {
                console.log(chalk.bgRed(`an error occured while fetching tags for bookID ${req.query.id}\n${err}\n`))
                return res.status(500).json({ "category": "getTags", "time": -1, "data": [], "id": req.query.idd * 1 })
            }
            return res.status(400).json({ "category": "getTags", "time": -1, "data": [], "id": req.query.idd * 1 })
        }
    })
}

start()