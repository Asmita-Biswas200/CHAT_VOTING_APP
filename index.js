const express = require('express')
const path = require('path')
const app = express()
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => console.log(`Server on port ${PORT}`))

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))

let socketsConnected = new Set()
let pollOptions = {}

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id)
  socketsConnected.add(socket.id)
  io.emit('clients-total', socketsConnected.size)
  io.emit('poll-options', pollOptions)

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketsConnected.delete(socket.id)
    io.emit('clients-total', socketsConnected.size)
  })

  socket.on('message', (data) => {
    if (!data.name || data.name.trim() === '') {
      data.name = 'Unknown User'
    }
    socket.broadcast.emit('chat-message', data)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })

  socket.on('new-option', (opt) => {
    if (!pollOptions[opt]) {
      pollOptions[opt] = 0
      io.emit('poll-options', pollOptions)
    }
  })

  socket.on('vote', (opt) => {
    if (pollOptions[opt] !== undefined) {
      pollOptions[opt] += 1
      io.emit('poll-update', pollOptions)
    }
  })
})