const path = require('path')
const fs = require('fs').promises
const chalk = require('chalk')
const douban = require(path.join(__dirname, '/scrapers/douban'))
/* eslint-disable camelcase */
const douban_literature = require(path.join(__dirname, '/scrapers/douban_literature'))
const douban_novel = require(path.join(__dirname, '/scrapers/douban_novel'))
const douban_science = require(path.join(__dirname, '/scrapers/douban_science'))
/* eslint-enable camelcase */
const dangdang = require(path.join(__dirname, '/scrapers/dangdang'))
const chaoxing = require(path.join(__dirname, '/scrapers/chaoxing'))
const booksChina = require(path.join(__dirname, '/scrapers/booksChina'))
const total = 7
let failed = 0

module.exports = async function startScrapers (cluster) {
  failed = 0
  function onError (err, name, willRetry) {
    if (willRetry) {
      console.log(chalk.yellow(`${name} update failed\n${err}\nretrying...`))
    } else {
      console.log(chalk.bgRed(`${name} update failed\n${err}`))
      failed++
    }
  }
  async function checkUpdate (func, name) {
    try {
      const updateTime = JSON.parse(await fs.readFile(path.join(__dirname, `/results/${name}.json`))).time
      if (new Date().getTime() - updateTime < 10800000) {
        console.log(`${name} is up to date`)
        return
      }
    } catch {
      await fs.writeFile(path.join(__dirname, `/results/${name}.json`), JSON.stringify({ category: name, time: -1, data: [] }))
    }
    cluster.queue(name, func)
  }

  try {
    await fs.stat(path.join(__dirname, '/results/tags'))
  } catch {
    console.log(chalk.bgYellow.black('cannot find "results/tags" directory\ncreating it...'))
    try {
      await fs.mkdir(path.join(__dirname, '/results/tags'))
    } catch {
      console.log(chalk.bgYellow.black('cannot find "results" directory\ncreating it...'))
      await fs.mkdir(path.join(__dirname, '/results/'))
      await fs.mkdir(path.join(__dirname, '/results/tags'))
    }
  }

  cluster.on('taskerror', onError)
  const start = new Date()
  console.log(chalk.bgBlue(`start updating at ${start}`))
  await checkUpdate(douban, 'douban')
  await checkUpdate(douban_literature, 'douban_literature')
  await checkUpdate(douban_novel, 'douban_novel')
  await checkUpdate(douban_science, 'douban_science')
  await checkUpdate(dangdang, 'dangdang')
  await checkUpdate(chaoxing, 'chaoxing')
  await checkUpdate(booksChina, 'booksChina')
  await cluster.idle()
  const end = new Date()
  cluster.off('taskerror', onError)

  if (failed) {
    console.log(chalk.bgYellow.black(`end updating with errors at ${end}\nsuccess: ${total - failed}, failed: ${failed}\ntime total: ${(end.getTime() - start.getTime()) / 1000} seconds\n`))
  } else {
    console.log(chalk.bgGreen.black(`end updating successfully at ${end}\ntime total: ${(end.getTime() - start.getTime()) / 1000} seconds\n`))
  }
}
