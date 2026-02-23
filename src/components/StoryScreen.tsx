import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoPauseOutline,
  IoVolumeHighOutline,
  IoEllipsisHorizontal,
  IoAttachOutline,
  IoHeartOutline,
  IoHappyOutline,
  IoMicOutline,
} from 'react-icons/io5'
import PazhLogo from '../assets/logos/PazhLogo'

const STORY_SEGMENTS = 4
const SEGMENT_DURATION_SEC = 15

interface StoryScreenProps {
  open: boolean
  onClose: () => void
}

export function StoryScreen({ open, onClose }: StoryScreenProps) {
  const [reply, setReply] = useState('')
  const [activeSegment, setActiveSegment] = useState(0)

  useEffect(() => {
    if (!open) {
      setActiveSegment(0)
      return
    }
    const t = setInterval(() => {
      setActiveSegment((prev) => {
        if (prev >= STORY_SEGMENTS - 1) {
          clearInterval(t)
          return prev
        }
        return prev + 1
      })
    }, SEGMENT_DURATION_SEC * 1000)
    return () => clearInterval(t)
  }, [open])

  const handleSend = () => {
    if (!reply.trim()) return
    setReply('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="استوری"
          className="fixed inset-0 z-50 flex flex-col bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Top: progress bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-0.5 px-2 pt-2 safe-area-pt">
            {Array.from({ length: STORY_SEGMENTS }).map((_, i) => (
              <div
                key={i}
                className={`story-progress-segment ${i < activeSegment ? 'done' : ''} ${i === activeSegment ? 'active' : ''}`}
              >
                <div className="story-progress-segment-fill" />
              </div>
            ))}
          </div>

          {/* Top: profile row (below progress) */}
          <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 safe-area-pt">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/50 bg-(--teal-primary)">
                <PazhLogo className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">پارونیک</span>
                <span className="text-xs text-white/75">دیروز ۲:۵۸ بعدازظهر</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                aria-label="توقف"
              >
                <IoPauseOutline className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                aria-label="صدا"
              >
                <IoVolumeHighOutline className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                aria-label="بستن"
              >
                <IoEllipsisHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main content: full area */}
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 bg-linear-to-b from-(--teal-primary)/20 to-black/80">
            <div className="flex items-center justify-center rounded-full border-4 border-(--teal-primary) bg-(--white) p-4">
              <PazhLogo className="h-20 w-20" />
            </div>
            <p className="text-center font-medium text-lg text-white">پارونیک</p>
            <p className="max-w-[280px] text-center text-sm text-white/80">
              استوری دمو — برای مشاهده به‌روزرسانی‌ها اینجا را ببینید.
            </p>
          </div>

          {/* Bottom: reply bar (dark style like reference) */}
          <div className="safe-area-pb z-20 border-t border-white/10 bg-black/60 px-3 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                }}
                placeholder="پاسخ به استوری..."
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40"
                dir="rtl"
                aria-label="پاسخ به استوری"
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                  aria-label="پیوست"
                >
                  <IoAttachOutline className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                  aria-label="پسند"
                >
                  <IoHeartOutline className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                  aria-label="ایموجی"
                >
                  <IoHappyOutline className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                  aria-label="صدا"
                >
                  <IoMicOutline className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
