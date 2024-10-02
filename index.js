const express = require('express')
const fs = require("fs")
const app = express()
const index = fs.readFileSync("index.html").toString()
const mod = fs.readFileSync("mod.html").toString()
let files = {}
const mods = require("./mods.json")
const gatekept = fs.readFileSync("./gatekept.html").toString()
const reg = "🇦  🇧  🇨  🇩  🇪  🇫  🇬  🇭  🇮  🇯  🇰  🇱  🇲  🇳  🇴  🇵  🇶  🇷  🇸  🇹  🇺  🇻  🇼  🇽  🇾  🇿".split("  ")
function resource(req) {
    console.log(`[${req.ip}] ${req.method} to ${req.path}`)
}
function getIndex (req, res) {
    resource(req)
    let content = index
    let mod = []
    let total = 0
    for (let i of mods) {
        total += i.versions.length
        mod.push(`<a href="${i.id}"><button class="button">${i.name}</button></a>`)
    }
    content = content.replace('<button class="button">%%MOD_NAME%%</button>', mod.join(""))
    .replace("%%MODS_UNIQUE%%", mods.length)
    .replace("%%MODS_TOTAL%%", total)
    res.send(content)
}
app.get(['/gatekept', '/gatekept.html'], function(req, res) {
    res.send(gatekept)
})
app.get(['/', './index', '/index.html'], getIndex)
app.get(['/random'], (req, res) => {
    resource(req)
    res.redirect(`/${mods[Math.floor(Math.random()*mods.length)].id}`)
})
for (let i of mods) {
    app.get(`/${i.id}`, function (req, res) {
        resource(req)
        let content = mod
        let ver = []
        for (let j of i.versions) {
            ver.push(`<a href="${j.download}" target="_blank"><button class="button">${j.name}</button></a>`)
        }
        content = content.replace('<button class="button">%%MOD_RELEASE%%</button>', ver.join(""))
        .replace(/%%MOD_NAME%%/g, i.name)
        .replace(/%%MOD_AUTHOR%%/g, i.creator)
        .replace("%%MOD_DATE%%", i.date ? new Date(i.date).toISOString() : "-")
        .replace("%%MOD_UNITALE_VERSION%%", i.version || "unknown")
        .replace("%%MOD_COUNTRY%%", i.country ? i.country.split("").map(e => reg[e.charCodeAt(0) - 65]).join("") : "")
        res.send(content)
    })
}
for (let i of fs.readdirSync("./assets").filter(e => e != "." && e != "..")) {
    files[i] = fs.readFileSync(`./assets/${i}`)
    app.get(`/assets/${i}`, function (req, res) {
        res.send(files[i])
    })
}

app.listen(3000)