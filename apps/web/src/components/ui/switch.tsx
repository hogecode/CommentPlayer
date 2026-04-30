'use client'

import React from 'react'
import RcSwitch from 'rc-switch'
import { cn } from '@/lib/utils'
import 'rc-switch/assets/index.css'

interface SwitchProps {
  // コンポーネント固有のプロパティ
  checked?: boolean
  onChange?: (checked: boolean) => void
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  size?: 'sm' | 'default'
  // その他の HTML 属性
  'aria-label'?: string
  [key: string]: any
}

function Switch({
  className,
  size = 'default',
  disabled = false,
  checked = false,
  onChange,
  onCheckedChange,
  id,
  ...props
}: SwitchProps) {
  // onCheckedChange が渡された場合は、onChange にマッピング
  const handleChange = (newChecked: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(newChecked)
    } else if (onChange) {
      onChange(newChecked)
    }
  }

  const sizeClasses = {
    default: 'rc-switch-default',
    sm: 'rc-switch-sm',
  }

  return (
    <>
      <style>{`
        /* rc-switchのスタイルをカスタマイズ */
        .rc-switch-default {
          min-width: 32px !important;
          height: 18.4px !important;
        }

        .rc-switch-sm {
          min-width: 24px !important;
          height: 14px !important;
        }

        .rc-switch {
          position: relative;
          display: inline-flex;
          align-items: center;
          background-color: hsl(var(--color-primary));
          border-radius: 9999px;
          border: 1px solid white;
          transition: all 200ms;
          outline: none;
          cursor: pointer;
        }

        .rc-switch:not(.rc-switch-disabled):hover {
          box-shadow: 0 0 0 2px hsl(var(--color-ring) / 0.1);
        }

        .rc-switch.rc-switch-checked {
          background-color: hsl(var(--color-primary));
        }

        .rc-switch-disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .rc-switch-inner {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          transition: all 200ms;
        }
      `}</style>
      <RcSwitch
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className={cn(
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      />
    </>
  )
}

export { Switch }
