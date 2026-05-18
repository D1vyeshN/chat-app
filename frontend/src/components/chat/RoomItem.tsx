// src/components/chat/RoomItem.tsx
import { Room } from '@/types'
import { Hash } from 'lucide-react'

interface RoomItemProps {
  room: Room
  isActive: boolean
  onClick: () => void
}

export default function RoomItem({ room, isActive, onClick }: RoomItemProps) {
  const onlineCount = room.members.filter((m) => m.isOnline).length

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
        text-left transition-colors mb-0.5
        ${isActive
          ? 'bg-slate-700 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
    >
      <Hash className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-sm truncate">{room.name}</span>
      {onlineCount > 0 && (
        <span className="text-xs text-green-400">{onlineCount}</span>
      )}
    </button>
  )
}