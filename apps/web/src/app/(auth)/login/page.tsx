'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import {
  loginUserSchema,
  useLoginUserMutation,
  type LoginUserInput,
} from '@/services/useLoginUserMutation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
    mode: 'onChange',
  })

  const { mutate, isPending } = useLoginUserMutation()

  const onSubmit = (data: LoginUserInput) => {
    mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 sm:p-8">
          {/* ヘッダー */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              ログイン
            </h1>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              {/* ユーザー名フィールド */}
              <Field orientation="vertical">
                <FieldLabel htmlFor="username" className="text-sm font-medium">
                  ユーザー名
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="username"
                    className='text-xs'
                    type="text"
                    placeholder="ユーザー名を入力してください"
                    aria-invalid={!!errors.username}
                    {...register("username")}
                  />
                  {errors.username && (
                    <FieldError className='text-xs'>{errors.username.message}</FieldError>
                  )}
                </FieldContent>
              </Field>

              {/* パスワードフィールド */}
              <Field orientation="vertical">
                <FieldLabel htmlFor="password" className="text-sm font-medium">
                  パスワード
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="password"
                      className='text-xs'
                      type={showPassword ? "text" : "password"}
                      placeholder="パスワードを入力してください"
                      aria-invalid={!!errors.password}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showPassword ? "パスワードを隠す" : "パスワードを表示"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldError className='text-xs'>{errors.password.message}</FieldError>
                  )}
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="flex justify-center">
              {/* ログインボタン */}
              <Button type="submit" disabled={!isValid || isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>
            </div>
          </form>

          {/* アカウント作成リンク */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              アカウントをお持ちでないですか？{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                アカウント作成
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
