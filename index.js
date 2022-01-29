const express=require("express")
const app=express()
const fs=require('fs').promises
const port=3030
const douban=require("./scrapers/douban")

async function startScraper(func){
    await func()
    setInterval(func,60000)
}

startScraper(douban)

app.listen(port,()=>{
    console.log(`api.bookmeet.tk running at 127.0.0.1:${port}`)
})
app.get("/",(req,res)=>{
    res.send("Welcome to api.bookmeet.tk!")
})
app.get("/douban",async (req,res)=>{
    res.send(String(await fs.readFile("./results/douban")))
})
