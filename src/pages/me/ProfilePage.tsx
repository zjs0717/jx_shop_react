import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProfileApi, updateProfileApi, uploadAvatarApi } from '@/api/user'
import { queryKeys } from '@/lib/queryKeys'
import type { UserGender } from '@/types/user'
import './ProfilePage.css'

const genderOptions: { value: UserGender; label: string }[] = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
  { value: 'unknown', label: '保密' },
]

export function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState<UserGender>('unknown')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [hydratedId, setHydratedId] = useState<number | null>(null)

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfileApi,
  })

  const updateMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: uploadAvatarApi,
    onSuccess: async (profile) => {
      setAvatarPreview(profile.avatarUrl)
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })

  const profile = profileQuery.data
  if (profile && profile.id !== hydratedId) {
    setHydratedId(profile.id)
    setNickname(profile.nickname || profile.username)
    setGender(profile.gender || 'unknown')
    setBio(profile.bio || '')
    setAvatarPreview(profile.avatarUrl || '')
  }

  async function onPickAvatar(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return
    setMessage('')
    setError('')
    try {
      await uploadMutation.mutateAsync(file)
      setMessage('头像已更新')
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      input.value = ''
    }
  }

  async function save(e: FormEvent): Promise<void> {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await updateMutation.mutateAsync({
        nickname: nickname.trim(),
        gender,
        bio: bio.trim(),
      })
      setMessage('资料已保存')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    }
  }

  const loading = profileQuery.isPending
  const saving = updateMutation.isPending
  const uploading = uploadMutation.isPending
  const loadError =
    error || (profileQuery.error instanceof Error ? profileQuery.error.message : '')

  return (
    <div className="page">
      <button type="button" className="back" onClick={() => void navigate('/home/me')}>
        ← 我的
      </button>
      <h1>编辑资料</h1>
      <p className="sub">头像、昵称、性别与简介</p>

      {loading ? (
        <div className="hint">加载中…</div>
      ) : (
        <form className="form" onSubmit={(e) => void save(e)}>
          <div className="avatar-block">
            <button
              type="button"
              className="avatar"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="头像" />
              ) : (
                <span>{nickname.slice(0, 1) || 'J'}</span>
              )}
            </button>
            <div>
              <strong>个人头像</strong>
              <p>{uploading ? '上传中…' : '点击更换，支持 jpg / png'}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                void onPickAvatar(e)
              }}
            />
          </div>

          <label className="field">
            <span>昵称</span>
            <input
              value={nickname}
              maxLength={50}
              placeholder="怎么称呼你"
              required
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>

          <fieldset className="gender">
            <legend>性别</legend>
            {genderOptions.map((item) => (
              <label key={item.value}>
                <input
                  type="radio"
                  name="gender"
                  value={item.value}
                  checked={gender === item.value}
                  onChange={() => setGender(item.value)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </fieldset>

          <label className="field">
            <span>个人简介</span>
            <textarea
              value={bio}
              maxLength={200}
              rows={4}
              placeholder="介绍一下自己"
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          {message ? <p className="ok">{message}</p> : null}
          {loadError ? <p className="err">{loadError}</p> : null}

          <button type="submit" className="save" disabled={saving}>
            {saving ? '保存中…' : '保存资料'}
          </button>
        </form>
      )}
    </div>
  )
}
