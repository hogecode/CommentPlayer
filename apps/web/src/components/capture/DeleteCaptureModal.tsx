'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteCaptureMutation } from '@/services/useCaptures'
import Message from '@/message'

interface DeleteCaptureModalProps {
  captureId: number
  filename: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCaptureModal({
  captureId,
  filename,
  open,
  onOpenChange,
}: DeleteCaptureModalProps) {
  const deleteCaptureMutation = useDeleteCaptureMutation()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteCaptureMutation.mutateAsync(captureId)
      Message.success('キャプチャを削除しました')
      onOpenChange(false)
    } catch (error) {
      console.error('削除エラー:', error)
      Message.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-black'>キャプチャを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mt-2 break-words">
              ファイル: <span className="font-mono text-sm">{filename}</span>
            </div>
            <div className="mt-2 text-sm">
              この操作は取り消すことができません。
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isDeleting}  className='text-black'>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
          >
            {isDeleting ? '削除中...' : '削除'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
