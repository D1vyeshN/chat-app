// src/components/chat/CreateRoomModal.tsx
'use client'

import { useState, FormEvent } from 'react'
import api from '@/lib/axios'
import { Room } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'

interface CreateRoomModalProps {
  open: boolean
  onClose: () => void
  onCreated: (room: Room) => void
}

export default function CreateRoomModal({
  open,
  onClose,
  onCreated
}: CreateRoomModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.post<Room>('/api/rooms', {
        name: name.trim()
      })
      onCreated(data)
      setName('')
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 flex items-center
       justify-center z-50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-sm bg-slate-900 border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="text-white">Create Room</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Room Name</label>
              <Input
                placeholder="general"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800 my-2 border-slate-700 text-white
                 placeholder:text-slate-500"
                autoFocus
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 cursor-pointer text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}