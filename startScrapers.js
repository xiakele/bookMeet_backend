const fs = require("fs").promises
const chalk = require("chalk")
const douban = require("./scrapers/douban")
const douban_literature = require("./scrapers/douban_literature")
const douban_novel = require("./scrapers/douban_novel")
const douban_science = require("./scrapers/douban_science")
const dangdang = require("./scrapers/dangdang")
const jd = require("./scrapers/jd")
let success = 0, failed = 0, tried=false

async function checkUpdate(func, name) {
    try {
        updateTime = JSON.parse(await fs.readFile(`./results/${name}.json`)).time
        if (new Date().getTime() - updateTime < 10800000) {
            console.log(chalk.green(`${name} is up to date`))
            success += 1
        } else {
            try {
                await func()
                console.log(chalk.green(`${name} updated successfully at ${new Date()}`))
                success += 1
            } catch (err) {
                if (tried) {
                    console.log(chalk.bgRed(`${name} update failed\n${err}`))
                    tried=false
                    failed += 1
                } else {
                    console.log(chalk.yellow(`${name} update failed\n${err}\nretrying...`))
                    tried = true
                    await checkUpdate(func, name)
                }
            }
        }
    } catch {
        try {
            await fs.writeFile(`./results/${name}.json`, JSON.stringify({ "category": name, "time": -1, "data": [] }))
            await func()
            console.log(chalk.green(`${name} updated successfully at ${new Date()}`))
            success += 1
        } catch (err) {
            if (tried) {
                console.log(chalk.bgRed(`${name} update failed\n${err}`))
                failed+=1
            } else {
                console.log(chalk.yellow(`${name} update failed\n${err}\nretrying...`))
                tried = true
                await checkUpdate(func,name)
            }
        }
    }
}

module.exports=async function startScrapers() {
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
        console.log(chalk.bgYellow.black(`end updating with errors at ${end}\nsuccess: ${success}, failed: ${failed}\ntime total: ${(end.getTime() - start.getTime()) / 1000} seconds\n`))
    } else {
        console.log(chalk.bgGreen.black(`end updating successfully at ${end}\ntime total: ${(end.getTime() - start.getTime()) / 1000} seconds\n`))
    }
}
