import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login, fetchMe } from '../../entities/auth/api'
import { useAuthStore } from '../../entities/auth/store'
import { Button } from '../../shared/ui/button'
import { Input } from '../../shared/ui/input'
import { useTranslation } from 'react-i18next'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'login' })
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      await login(values)
      const me = await fetchMe()
      setUser(me)
    },
    onSuccess: () => {
      navigate('/')
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Ошибка авторизации'
      form.setError('email', { message })
    }
  })

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600" htmlFor="email">
              {t('email')}
            </label>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} aria-invalid={!!form.formState.errors.email} />
            {form.formState.errors.email && <p className="text-xs text-danger">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600" htmlFor="password">
              {t('password')}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...form.register('password')}
                aria-invalid={!!form.formState.errors.password}
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1" onClick={() => setShowPassword((prev) => !prev)}>
                {t('showPassword')}
              </Button>
            </div>
            {form.formState.errors.password && <p className="text-xs text-danger">{form.formState.errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? '...' : t('submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
