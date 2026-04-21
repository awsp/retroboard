import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus, Trash2, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RetroCard {
  id: string
  text: string
  votes: number
}

interface RetroColumnProps {
  title: string
  color: string
  cards: RetroCard[]
  onAddCard: (text: string) => void
  onDeleteCard: (id: string) => void
  onVote: (id: string) => void
}

export function RetroColumn({
  title,
  color,
  cards,
  onAddCard,
  onDeleteCard,
  onVote,
}: RetroColumnProps) {
  const [newCardText, setNewCardText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (newCardText.trim()) {
      onAddCard(newCardText)
      setNewCardText('')
      setIsAdding(false)
    }
  }

  const sortedCards = [...cards].sort((a, b) => b.votes - a.votes)

  return (
    <div className="flex-1 min-w-[280px]">
      <Card className={cn("h-full border-t-4", color)}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedCards.map((card) => (
            <div
              key={card.id}
              className="p-3 bg-secondary rounded-md space-y-2 group hover:shadow-md transition-shadow"
            >
              <p className="text-sm">{card.text}</p>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVote(card.id)}
                  className="gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-xs">{card.votes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteCard(card.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {isAdding ? (
            <div className="space-y-2">
              <Input
                value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
                placeholder="Enter your thought..."
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false)
                    setNewCardText('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
