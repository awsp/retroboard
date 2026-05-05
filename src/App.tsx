import {useEffect, useState} from 'react'
import {io, Socket} from 'socket.io-client'
import {RetroCard, RetroColumn} from './components/RetroColumn'
import {Button} from './components/ui/button'
import {RotateCcw, Users} from 'lucide-react'
import Timer from '@/components/Timer.tsx'
import {Toaster} from 'sonner'

interface ColumnData {
  title: string
  color: string
  cards: RetroCard[]
}

function App() {
  const [columns, setColumns] = useState<Record<string, ColumnData>>({
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
  })
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userCount, setUserCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin.replace(/:\d+$/, ':3001')
    const newSocket = io(socketUrl)
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('board-state', (boardState: Record<string, ColumnData>) => {
      setColumns(boardState)
    })

    newSocket.on('user-count', (count: number) => {
      setUserCount(count)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const addCard = (columnKey: string, text: string) => {
    socket?.emit('add-card', {columnKey, text})
  }

  const deleteCard = (columnKey: string, cardId: string) => {
    socket?.emit('delete-card', {columnKey, cardId})
  }

  const voteCard = (columnKey: string, cardId: string) => {
    socket?.emit('vote-card', {columnKey, cardId})
  }

  const editCard = (columnKey: string, cardId: string, newText: string) => {
    socket?.emit('edit-card', {columnKey, cardId, newText})
  }

  const resetBoard = () => {
    if (confirm('Are you sure you want to clear all cards?')) {
      socket?.emit('reset-board')
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-[80%] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Sprint Retrospective</h1>
              <p className="text-muted-foreground mt-2">
                Reflect on the sprint and identify improvements
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <Users className="h-4 w-4" />
                <span>{userCount} online</span>
              </div>
              <Timer socket={socket} />
              <Button variant="outline" onClick={resetBoard}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Board
              </Button>
            </div>
          </div>

          <div className="flex gap-6 flex-wrap lg:flex-nowrap">
            {Object.entries(columns).map(([key, column]) => (
              <RetroColumn
                key={key}
                title={column.title}
                color={column.color}
                cards={column.cards}
                onAddCard={(text) => addCard(key, text)}
                onDeleteCard={(id) => deleteCard(key, id)}
                onVote={(id) => voteCard(key, id)}
                onEditCard={(id, newText) => editCard(key, id, newText)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
