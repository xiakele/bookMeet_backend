const puppeteer=require("puppeteer")
const fs=require("fs").promises
async function getBooks(page){
    return page.$$eval(".chart-dashed-list>li",items=>items.map(item=>`{"name":"${item.querySelector(".clearfix>a").innerHTML}","img":"${item.querySelector(".media__img>a").href}"}`))
}
module.exports=async function start(){
    const browser=await puppeteer.launch({defaultViewport:{width:1920,height:1080}})
    const page=await browser.newPage()
    await page.goto("https://book.douban.com/latest?tag=%E5%85%A8%E9%83%A8")
    books=await getBooks(page)
    await fs.writeFile("./results/douban",`[${books}]`)
    console.log(`douban refreshed at ${new Date()}`)
    await browser.close()
}
