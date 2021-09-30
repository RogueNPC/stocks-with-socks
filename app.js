const express = require("express")

// Routes
const stocks = require("./static/client.js")

const app = express()

const http = require("http")
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

app.use("/stocks", stocks)

app.get('/', (req, res) => {
    return res.json({response: "Hello world"})
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})
