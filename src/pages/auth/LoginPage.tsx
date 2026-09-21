import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { loginApi } from '@/api/auth'
import { ApiError } from '@/api/request'
import BrandMark from '@/components/brand/BrandMark'
import HeroSlideshow from '@/components/fx/HeroSlideshow'
import SceneCanvas from '@/components/fx/SceneCanvas'
import { useAuthStore } from '@/stores/auth'
import type { LoginForm, LoginPayload } from '@/types/login'
import './auth.css'

const isFormValid = (data: LoginForm): boolean => Boolean(data.username.trim() && data.password)

const buildPayload = (data: LoginForm): LoginPayload => ({
  username: data.username.trim(),
  password: data.password,
})

export function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
    remember: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loginMutation = useMutation({
    mutationFn: loginApi,
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!isFormValid(form)) return

    setErrorMessage('')
    try {
      const data = await loginMutation.mutateAsync(buildPayload(form))
      useAuthStore.getState().setToken(data.token)
      void navigate('/home')
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '登录失败，请稍后重试')
    }
  }

  const loading = loginMutation.isPending

  return (
    <div className="auth">
      <section className="auth__hero" aria-hidden="true">
        <HeroSlideshow />
        <SceneCanvas mode="full" />
        <div className="auth__shade" />
        <div className="auth__hero-copy">
          <BrandMark size={64} />
          <p className="auth__brand">乐享</p>
          <p className="auth__pinyin">LEXIANG</p>
          <p className="auth__tagline">分享美好 · 传播快乐</p>
          <div className="auth__chips">
            <span>商城</span>
            <span>短视频</span>
            <span>LIVE</span>
          </div>
        </div>
      </section>

      <section className="auth__panel">
        <div className="auth__panel-inner">
          <header className="auth__head">
            <BrandMark size={44} />
            <h1>欢迎回来</h1>
            <p>登录后继续发现好物与精彩内容</p>
          </header>

          <form className="auth__form" onSubmit={(event) => void handleSubmit(event)}>
            <label className="field">
              <span className="field__label">用户名</span>
              <input
                className="field__input"
                type="text"
                placeholder="请输入用户名"
                autoComplete="username"
                required
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              />
            </label>

            <label className="field">
              <span className="field__label">密码</span>
              <div className="field__password">
                <input
                  className="field__input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                />
                <button
                  type="button"
                  className="field__toggle"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M3 3l18 18M10.5 10.5a3 3 0 0 0 4.24 4.24" />
                      <path d="M6.7 6.7C4.6 8.2 3 10.5 2 12c2.5 4 6.5 7 10 7 1.5 0 2.9-.4 4.2-1.1M9.9 5.1A9.7 9.7 0 0 1 12 5c3.5 0 7.5 3 10 7-.8 1.3-1.9 2.5-3.1 3.5" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <div className="auth__options">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) => setForm((prev) => ({ ...prev, remember: event.target.checked }))}
                />
                <span className="checkbox__box" />
                <span>记住我</span>
              </label>
              <a
                href="#"
                className="auth__link"
                onClick={(event) => {
                  event.preventDefault()
                }}
              >
                忘记密码？
              </a>
            </div>

            {errorMessage ? (
              <div className="auth__error" role="alert">
                {errorMessage}
              </div>
            ) : null}

            <button className="auth__btn" type="submit" disabled={loading}>
              {loading ? <span className="auth__spinner" /> : null}
              {loading ? '登录中…' : '进入乐享'}
            </button>
          </form>

          <footer className="auth__foot">
            <span>还没有账户？</span>
            <Link to="/register" className="auth__link">
              立即注册
            </Link>
          </footer>
        </div>
      </section>
    </div>
  )
}
