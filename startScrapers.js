const fs = require("fs").promises
const chalk = require("chalk")
const douban = require(`${__dirname}/scrapers/douban`)
const douban_literature = require(`${__dirname}/scrapers/douban_literature`)
const douban_novel = require(`${__dirname}/scrapers/douban_novel`)
const douban_science = require(`${__dirname}/scrapers/douban_science`)
const dangdang = require(`${__dirname}/scrapers/dangdang`)
const chaoxing = require(`${__dirname}/scrapers/chaoxing`)
const booksChina = require(`${__dirname}/scrapers/booksChina`)
const total = 7

module.exports = async function startScrapers(cluster) {
    failed = 0
    try {
        await fs.stat(`${__dirname}/results`)
    } catch {
        console.log(chalk.bgYellow.black("cannot find \"results\" directory\ncreating it..."))
        await fs.mkdir(`${__dirname}/results`)
    }
    const onError = (err, name, willRetry) => {
        if (willRetry) {
            console.log(chalk.yellow(`${name} update failed\n${err}\nretrying...`))
        } else {
            console.log(chalk.bgRed(`${name} update failed\n${err}`))
            failed++
        }
    }
    cluster.on("taskerror", onError)
    async function checkUpdate(func, name) {
        try {
            updateTime = JSON.parse(await fs.readFile(`${__dirname}/results/${name}.json`)).time
            if (new Date().getTime() - updateTime < 10800000) {
                console.log(`${name} is up to date`)
                return
            }
        } catch {
            await fs.writeFile(`${__dirname}/results/${name}.json`, JSON.stringify({ "category": name, "time": -1, "data": [] }))
        }
        cluster.queue(name, func)
    }
    start = new Date()
    console.log(chalk.bgBlue(`start updating at ${start}`))
    await checkUpdate(douban, "douban")
    await checkUpdate(douban_literature, "douban_literature")
    await checkUpdate(douban_novel, "douban_novel")
    await checkUpdate(douban_science, "douban_science")
    await checkUpdate(dangdang, "dangdang")
    await checkUpdate(chaoxing, "chaoxing")
    await checkUpdate(booksChina, "booksChina")
    await cluster.idle()
    end = new Date()
    if (failed) {
        console.log(chalk.bgYellow.black(`end updating with errors at ${end}\nsuccess: ${total - failed}, failed: ${failed}\ntime total: ${(end.getTime() - start.getTime()) / 1000} seconds\n`))
    } else {
        console.log(chalk.bgGreen.black(`end updating successfully at ${end}\ntime total: ${(end.getTime() - start.getTime()) / 1000} seconds\n`))
    }
    cluster.off("taskerror", onError)
}
