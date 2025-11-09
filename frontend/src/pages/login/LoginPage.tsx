import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login, fetchMe, register as registerUser } from '../../entities/auth/api'
import { useAuthStore } from '../../entities/auth/store'
import { Button } from '../../shared/ui/button'
import { Input } from '../../shared/ui/input'
import { useTranslation } from 'react-i18next'

interface LoginFormValues {
  email: string
  password: string
}

interface RegisterFormValues {
  email: string
  password: string
}

type AuthMode = 'login' | 'register'

export function LoginPage() {
  const { t } = useTranslation('translation')
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z
          .string({ required_error: t('login.errors.required') })
          .email({ message: t('login.errors.email') }),
        password: z
          .string({ required_error: t('login.errors.required') })
          .min(6, { message: t('login.errors.passwordMin') })
      }),
    [t]
  )

  const registerSchema = useMemo(
    () =>
      z.object({
        email: z
          .string({ required_error: t('register.errors.required') })
          .email({ message: t('register.errors.email') }),
        password: z
          .string({ required_error: t('register.errors.required') })
          .min(6, { message: t('register.errors.passwordMin') })
      }),
    [t]
  )

  const loginResolver = useMemo(() => zodResolver(loginSchema), [loginSchema])
  const registerResolver = useMemo(() => zodResolver(registerSchema), [registerSchema])

  const loginForm = useForm<LoginFormValues>({
    resolver: loginResolver,
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: registerResolver,
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const resolveErrorMessage = (
    error: unknown,
    fallback: string,
    mapping?: Record<string, string>
  ) => {
    const tryMap = (value: string | undefined) => {
      if (!value) return undefined
      if (mapping && mapping[value]) {
        return mapping[value]
      }
      return value
    }

    if (error instanceof Error && error.message) {
      try {
        const parsed = JSON.parse(error.message) as { detail?: string }
        const detail = tryMap(parsed?.detail)
        if (detail) {
          return detail
        }
      } catch {
        const mapped = tryMap(error.message)
        if (mapped) {
          return mapped
        }
      }
    }

    if (typeof error === 'string') {
      const mapped = tryMap(error)
      if (mapped) {
        return mapped
      }
    }

    return fallback
  }

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      await login(values)
      const me = await fetchMe()
      setUser(me)
    },
    onSuccess: () => {
      navigate('/')
    },
    onError: (error: unknown) => {
      const message = resolveErrorMessage(error, t('login.errors.generic'), {
        'Incorrect credentials': t('login.errors.incorrectCredentials')
      })
      loginForm.setError('email', { message })
      setFeedback({ type: 'error', message })
    }
  })

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await registerUser(values)
    },
    onSuccess: (_data, variables) => {
      loginForm.reset({ email: variables.email, password: '' })
      registerForm.reset({ email: '', password: '' })
      loginForm.clearErrors()
      registerForm.clearErrors()
      setShowPassword(false)
      setMode('login')
      setFeedback({ type: 'success', message: t('register.success') })
    },
    onError: (error: unknown) => {
      const message = resolveErrorMessage(error, t('register.errors.generic'), {
        'User already exists': t('register.errors.userExists')
      })
      registerForm.setError('email', { message })
      setFeedback({ type: 'error', message })
    }
  })

  const handleModeChange = (nextMode: AuthMode) => {
    if (mode === nextMode) return
    setShowPassword(false)
    setFeedback(null)
    if (nextMode === 'register') {
      registerForm.reset({
        email: loginForm.getValues('email') ?? '',
        password: ''
      })
    } else {
      loginForm.reset({
        email: registerForm.getValues('email') ?? loginForm.getValues('email') ?? '',
        password: ''
      })
    }
    loginForm.clearErrors()
    registerForm.clearErrors()
    setMode(nextMode)
  }

  const onLoginSubmit = (values: LoginFormValues) => {
    setFeedback(null)
    loginMutation.mutate(values)
  }

  const onRegisterSubmit = (values: RegisterFormValues) => {
    setFeedback(null)
    registerMutation.mutate(values)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {mode === 'login' ? t('login.title') : t('register.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'login' ? t('login.subtitle') : t('register.subtitle')}
        </p>
        {feedback && (
          <div
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
            }`}
            role="status"
          >
            {feedback.message}
          </div>
        )}
        {mode === 'login' ? (
          <form className="mt-6 space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600" htmlFor="email">
                {t('login.email')}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...loginForm.register('email')}
                aria-invalid={!!loginForm.formState.errors.email}
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-danger">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600" htmlFor="password">
                {t('login.password')}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...loginForm.register('password')}
                  aria-invalid={!!loginForm.formState.errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {t('login.showPassword')}
                </Button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-danger">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? '...' : t('login.submit')}
            </Button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)} noValidate>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600" htmlFor="register-email">
                {t('register.email')}
              </label>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                {...registerForm.register('email')}
                aria-invalid={!!registerForm.formState.errors.email}
              />
              {registerForm.formState.errors.email && (
                <p className="text-xs text-danger">{registerForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600" htmlFor="register-password">
                {t('register.password')}
              </label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...registerForm.register('password')}
                  aria-invalid={!!registerForm.formState.errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {t('register.showPassword')}
                </Button>
              </div>
              {registerForm.formState.errors.password && (
                <p className="text-xs text-danger">{registerForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? '...' : t('register.submit')}
            </Button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <>
              {t('login.switch.toRegister.label')}{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => handleModeChange('register')}
              >
                {t('login.switch.toRegister.action')}
              </button>
            </>
          ) : (
            <>
              {t('login.switch.toLogin.label')}{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => handleModeChange('login')}
              >
                {t('login.switch.toLogin.action')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
