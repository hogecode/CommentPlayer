'use client'

import { useEffect, useState } from 'react'
import type { DtoFolderResponse } from '@/generated'
import { useFoldersQuery, useAddFolderMutation, useDeleteFolderMutation } from '@/services/useFolders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'

export function FolderManagement() {
  const [folderPath, setFolderPath] = useState('')
  const [mounted, setMounted] = useState(false)
  
  // マウント後のみクエリを実行
  const { data: foldersData, isLoading, error, isError } = useFoldersQuery({
    enabled: mounted
  })
  
  const addFolderMutation = useAddFolderMutation()
  const deleteFolderMutation = useDeleteFolderMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

  const folders: DtoFolderResponse[] = foldersData?.data ?? []

  // エラーをログに出力
  if (error) {
    console.error('Failed to fetch folders:', error)
  }

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderPath.trim()) {
      return
    }
    try {
      await addFolderMutation.mutateAsync(folderPath)
      setFolderPath('')
    } catch (error) {
      console.error('Failed to add folder:', error)
    }
  }

  const handleDeleteFolder = async (id: number) => {
    if (confirm('このフォルダを削除してもよろしいですか？')) {
      try {
        await deleteFolderMutation.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete folder:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold mb-4">新規フォルダを追加</h3>
      <form onSubmit={handleAddFolder} className="flex gap-2">
        <Input
          type="text"
          placeholder="フォルダパスを入力してください（例：/path/to/folder）"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          disabled={addFolderMutation.isPending}
          className="text-xs"
        />
        <Button
          type="submit"
          disabled={!folderPath.trim() || addFolderMutation.isPending}
          className="whitespace-nowrap bg-primary"
        >
          {addFolderMutation.isPending ? (
            <>
              <Spinner className="mr-2 size-4" />
              追加中...
            </>
          ) : (
            '追加'
          )}
        </Button>
      </form>

      {/* フォルダ一覧 */}
      <div>
        <h3 className="font-semibold mb-4">監視対象フォルダ</h3>
        {!mounted ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : error ? (
          <div className="border border-destructive rounded-lg p-4 bg-destructive/10">
            <p className="text-sm text-destructive">フォルダ情報の取得に失敗しました</p>
          </div>
        ) : folders.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/30">
            <p className="text-muted-foreground">監視対象フォルダが登録されていません</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">フォルダパス</TableHead>
                <TableHead className="w-1/4">状態</TableHead>
                <TableHead className="w-1/4 text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folders.map((folder) => (
                <TableRow key={folder.id}>
                  <TableCell className="break-all">
                    <code className="text-xs px-2 py-1 rounded">
                      {folder.path}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        folder.is_watched
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {folder.is_watched ? '監視中' : '監視停止'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFolder(folder.id!)}
                      disabled={deleteFolderMutation.isPending}
                    >
                      {deleteFolderMutation.isPending ? (
                        <>
                          <Spinner className="mr-1 size-3" />
                          削除中...
                        </>
                      ) : (
                        '削除'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
