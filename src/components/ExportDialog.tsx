import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X } from 'lucide-react'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reportName: string, date: string) => void
}

export function ExportDialog({ isOpen, onClose, onConfirm }: ExportDialogProps) {
  const [reportName, setReportName] = useState('')
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  if (!isOpen) return null

  const handleConfirm = () => {
    const finalName = reportName.trim() || 'Retrospective'
    onConfirm(finalName, date)
    setReportName('')
    onClose()
  }

  const handleCancel = () => {
    setReportName('')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95">
        <div className="bg-background rounded-lg shadow-lg border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Export Report</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div>
              <label htmlFor="report-name" className="block text-sm font-medium mb-2">
                Report Name
              </label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Sprint 45 Retrospective"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm()
                  if (e.key === 'Escape') handleCancel()
                }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to use default name
              </p>
            </div>

            <div>
              <label htmlFor="report-date" className="block text-sm font-medium mb-2">
                Date
              </label>
              <Input
                id="report-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button onClick={handleConfirm} className="flex-1">
              Export
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
