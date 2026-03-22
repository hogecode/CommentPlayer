import { useSnackbarStore } from '@/stores/snackbar-store'
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import './snackbar.css'

/**
 * スナックバーコンテナコンポーネント
 * 複数のスナックバーをスタック表示する
 */
export function SnackbarContainer() {
  const snackbars = useSnackbarStore((state) => state.snackbars)
  const hide = useSnackbarStore((state) => state.hide)

  return (
    <div className='flex flex-col-reverse items-center fixed bottom-0 left-0 right-0 pointer-events-none z-[9999] p-2 gap-2 snackbar-container-mobile'>
      {snackbars.map((snackbar) => (
        <div
          key={snackbar.id}
          className={cn(
            'flex items-center relative max-w-[672px] min-w-[344px] min-h-12 rounded shadow-lg overflow-hidden pointer-events-auto z-10 snackbar-transition',
            {
              'bg-success text-white': snackbar.level === 'success',
              'bg-warning text-white': snackbar.level === 'warning',
              'bg-error text-white': snackbar.level === 'error',
              'bg-info text-white': snackbar.level === 'info',
              'bg-background-lighten-2 text-foreground': snackbar.level === 'default',
              'opacity-100 visible': snackbar.showing,
              'opacity-0 invisible': !snackbar.showing,
              'snackbar-destroying': snackbar.destroying,
            }
          )}
        >
          <div className='flex items-center flex-1 px-4 py-3.5 mr-auto text-sm font-medium'>
            {/* レベルに応じたアイコンを表示する */}
            {snackbar.level === 'success' && (
              <CircleCheckIcon className='mr-3 w-5 h-5 flex-shrink-0' />
            )}
            {snackbar.level === 'warning' && (
              <TriangleAlertIcon className='mr-3 w-5 h-5 flex-shrink-0' />
            )}
            {snackbar.level === 'error' && (
              <OctagonXIcon className='mr-3 w-5 h-5 flex-shrink-0' />
            )}
            {snackbar.level === 'info' && (
              <InfoIcon className='mr-3 w-5 h-5 flex-shrink-0' />
            )}

            <div className='flex flex-col gap-1'>
              {snackbar.text.split('\n').map((line, idx) => (
                <p key={idx} className='text-sm font-medium'>
                  {line}
                </p>
              ))}
            </div>
          </div>

          <button
            className={cn(
              'flex items-center justify-center mr-2 px-2 py-2 bg-none border-0 cursor-pointer opacity-80 hover:opacity-100 transition-opacity duration-200',
              snackbar.level === 'default' && 'text-primary'
            )}
            onClick={() => hide(snackbar.id)}
            aria-label='Close'
          >
            <XIcon className='w-4 h-4' />
          </button>
        </div>
      ))}
    </div>
  )
}
