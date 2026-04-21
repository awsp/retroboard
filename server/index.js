import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

let boardState = {
  wentWell: {
    title: 'What Went Well',
    color: 'border-t-green-500',
    cards: [],
  },
  toImprove: {
    title: 'What Could Be Improved',
    color: 'border-t-yellow-500',
    cards: [],
  },
  actionItems: {
    title: 'Action Items',
    color: 'border-t-blue-500',
    cards: [],
  },
  kudos: {
    title: 'Kudos',
    color: 'border-t-purple-500',
    cards: [],
  },
}

let connectedUsers = 0

io.on('connection', (socket) => {
  connectedUsers++
  console.log(`User connected. Total users: ${connectedUsers}`)

  socket.emit('board-state', boardState)
  io.emit('user-count', connectedUsers)

  socket.on('add-card', ({ columnKey, text }) => {
    const newCard = {
      id: `${columnKey}-${Date.now()}-${Math.random()}`,
      text,
      votes: 0,
    }
    boardState[columnKey].cards.push(newCard)
    io.emit('board-state', boardState)
  })

  socket.on('delete-card', ({ columnKey, cardId }) => {
    boardState[columnKey].cards = boardState[columnKey].cards.filter(
      (card) => card.id !== cardId
    )
    io.emit('board-state', boardState)
  })

  socket.on('vote-card', ({ columnKey, cardId }) => {
    const card = boardState[columnKey].cards.find((c) => c.id === cardId)
    if (card) {
      card.votes++
      io.emit('board-state', boardState)
    }
  })

  socket.on('reset-board', () => {
    boardState = {
      wentWell: {
        title: 'What Went Well',
        color: 'border-t-green-500',
        cards: [],
      },
      toImprove: {
        title: 'What Could Be Improved',
        color: 'border-t-yellow-500',
        cards: [],
      },
      actionItems: {
        title: 'Action Items',
        color: 'border-t-blue-500',
        cards: [],
      },
      kudos: {
        title: 'Kudos',
        color: 'border-t-purple-500',
        cards: [],
      },
    }
    io.emit('board-state', boardState)
  })

  socket.on('disconnect', () => {
    connectedUsers--
    console.log(`User disconnected. Total users: ${connectedUsers}`)
    io.emit('user-count', connectedUsers)
  })
})

const PORT = 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
  console.log(`Access from network at http://<your-ip>:${PORT}`)
})
