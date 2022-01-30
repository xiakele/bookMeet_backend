const express = require("express")
const app = express()
const fs = require("fs").promises
const chalk = require("chalk")
const port = 3030
const douban = require("./scrapers/douban")
const douban_literature = require("./scrapers/douban_literature")
const douban_novel = require("./scrapers/douban_novel")
const douban_science = require("./scrapers/douban_science")
const dangdang = require("./scrapers/dangdang")
const jd = require("./scrapers/jd")
let success = 0, failed = 0

async function checkUpdate(func, name) {
    try {
        updateTime = JSON.parse(await fs.readFile(`./results/${name}.json`)).time
        if (new Date().getTime() - updateTime < 10800000) {
            console.log(`${name} is up to date`)
            success += 1
        } else {
            try {
                await func()
                success+=1
            } catch(err) {
                console.log(chalk.bgRed(`${name} update failed\n${err}`))
                failed+=1
            }
        }
    } catch {
        try {
            await func()
            success += 1
        } catch(err) {
            console.log(chalk.bgRed(`${name} update failed\n${err}`))
            failed += 1
        }
    }
}

async function startScrapers(func) {
    success = 0
    failed = 0
    try {
        await fs.stat("./results")
    } catch {
        console.log(chalk.bgYellow.black("cannot find \"results\" directory\ncreating it..."))
        await fs.mkdir("./results")
    }
    start = new Date()
    console.log(chalk.bgBlue(`start updating at ${start}`))
    await checkUpdate(douban, "douban")
    await checkUpdate(douban_literature, "douban_literature")
    await checkUpdate(douban_novel, "douban_novel")
    await checkUpdate(douban_science, "douban_science")
    await checkUpdate(dangdang, "dangdang")
    await checkUpdate(jd, "jd")
    end = new Date()
    if (failed) {
        console.log(chalk.bgYellow.black(`end updating at ${end}\nsuccess: ${success}, failed:${failed}\ntime total: ${(end.getTime() - start.getTime()) / 1000} seconds\n`))
    } else {
        console.log(chalk.bgGreen.black(`end updating at ${end}\nsuccess: ${success}, failed:${failed}\ntime total: ${(end.getTime() - start.getTime()) / 1000} seconds\n`))
    }
}

setInterval(startScrapers, 21600000)

app.listen(port, () => {
    console.log(`api.bookmeet.tk running at http://127.0.0.1:${port}\n`)
    startScrapers()
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