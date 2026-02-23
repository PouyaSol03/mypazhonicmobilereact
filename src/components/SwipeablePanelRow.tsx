import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { IoPencilOutline, IoTrashOutline } from 'react-icons/io5'

const ACTION_WIDTH = 120
const SNAP_THRESHOLD = ACTION_WIDTH * 0.4
const DRAG_THRESHOLD = 8

interface SwipeablePanelRowProps {
  children: React.ReactNode
  onEdit: () => void
  onDelete: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SwipeablePanelRow({
  children,
  onEdit,
  onDelete,
  isOpen = false,
  onOpenChange,
}: SwipeablePanelRowProps) {
  const controls = useAnimationControls()
  const [dragOffset, setDragOffset] = useState(0)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)
  const didDragRef = useRef(false)

  const openActions = useCallback(() => {
    controls.start({ x: -ACTION_WIDTH })
    setDragOffset(-ACTION_WIDTH)
    onOpenChange?.(true)
  }, [controls, onOpenChange])

  const closeActions = useCallback(() => {
    controls.start({ x: 0 })
    setDragOffset(0)
    onOpenChange?.(false)
  }, [controls, onOpenChange])

  useEffect(() => {
    if (!isOpen) {
      controls.start({ x: 0 })
      setDragOffset(0)
    }
  }, [isOpen, controls])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      startXRef.current = e.clientX
      startOffsetRef.current = dragOffset
      didDragRef.current = false
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [dragOffset]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const delta = e.clientX - startXRef.current
      if (Math.abs(delta) > DRAG_THRESHOLD) didDragRef.current = true
      const next = Math.min(0, Math.max(-ACTION_WIDTH, startOffsetRef.current + delta))
      setDragOffset(next)
      controls.set({ x: next })
    },
    [controls]
  )

  const handlePointerUp = useCallback(() => {
    const shouldOpen = dragOffset < -SNAP_THRESHOLD
    if (shouldOpen) {
      openActions()
    } else {
      closeActions()
    }
  }, [dragOffset, openActions, closeActions])

  const handleRowClick = useCallback((e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.preventDefault()
      e.stopPropagation()
      didDragRef.current = false
    }
  }, [])

  return (
    <div className="relative w-full overflow-hidden">
      {/* Under layer: Edit & Delete buttons (revealed when row slides left) */}
      <div
        className="absolute inset-e-0 top-0 flex h-full w-30 flex-row"
        aria-hidden
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            closeActions()
            setDragOffset(0)
            onEdit()
          }}
          className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2 bg-(--teal-primary)/90 text-white transition active:bg-(--teal-primary)"
          aria-label="ویرایش پنل"
        >
          <IoPencilOutline className="h-5 w-5 shrink-0" />
          <span className="text-xs font-medium">ویرایش</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            closeActions()
            setDragOffset(0)
            onDelete()
          }}
          className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2 bg-red-500/90 text-white transition active:bg-red-600"
          aria-label="حذف پنل"
        >
          <IoTrashOutline className="h-5 w-5 shrink-0" />
          <span className="text-xs font-medium">حذف</span>
        </button>
      </div>

      {/* Draggable row overlay */}
      <motion.div
        className="relative z-10 touch-pan-y bg-(--background-light)"
        initial={false}
        animate={controls}
        transition={{ type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClickCapture={handleRowClick}
      >
        {children}
      </motion.div>
    </div>
  )
}
