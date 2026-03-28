'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import {
  registerUserSchema,
  useRegisterUserMutation,
  type RegisterUserInput,
} from '@/services/useRegisterUserMutation'
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

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    mode: 'onChange',
  })

  const { mutate, isPending } = useRegisterUserMutation()

  const onSubmit = (data: RegisterUserInput) => {
    mutate(data)
  }

  const password = watch('password')
  const passwordsMatch = watch('confirmPassword') === password

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 sm:p-8">
          {/* ヘッダー */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              アカウント作成
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
                    <FieldError>{errors.username.message}</FieldError>
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
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </FieldContent>
              </Field>

              {/* 確認用パスワードフィールド */}
              <Field orientation="vertical">
                <FieldLabel
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  パスワード（確認）
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      className='text-xs'
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="パスワードを再度入力してください"
                      aria-invalid={!!errors.confirmPassword}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showConfirmPassword
                          ? "パスワードを隠す"
                          : "パスワードを表示"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                  {password && passwordsMatch && !errors.confirmPassword && (
                    <p className="text-xs text-green-600">
                      ✓ パスワードが一致しています
                    </p>
                  )}
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="flex justify-center">
              {/* 登録ボタン */}
              <Button type="submit" disabled={!isValid || isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登録中...
                  </>
                ) : (
                  "アカウントを作成"
                )}
              </Button>
            </div>
          </form>

          {/* ログインリンク */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              既にアカウントをお持ちですか？{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ログインする
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
