import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAddressApi,
  deleteAddressApi,
  fetchAddressesApi,
  updateAddressApi,
} from '@/api/user'
import { queryKeys } from '@/lib/queryKeys'
import type { AddressItem, AddressPayload } from '@/types/user'
import './AddressPage.css'

const emptyForm = (): AddressPayload => ({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

export function AddressPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddressPayload>(() => emptyForm())
  const [error, setError] = useState('')

  const listQuery = useQuery({
    queryKey: queryKeys.addresses,
    queryFn: fetchAddressesApi,
  })

  const createMutation = useMutation({
    mutationFn: createAddressApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddressPayload }) =>
      updateAddressApi(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAddressApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses })
    },
  })

  const list = listQuery.data ?? []
  const loading = listQuery.isPending
  const saving = createMutation.isPending || updateMutation.isPending
  const queryError = listQuery.error instanceof Error ? listQuery.error.message : ''
  const displayError = error || queryError

  function resetForm(): void {
    setEditingId(null)
    setForm(emptyForm())
  }

  function openCreate(): void {
    resetForm()
    setShowForm(true)
  }

  function openEdit(item: AddressItem): void {
    setEditingId(item.id)
    setForm({
      name: item.name,
      phone: item.phone,
      province: item.province,
      city: item.city,
      district: item.district,
      detail: item.detail,
      isDefault: item.isDefault,
    })
    setShowForm(true)
  }

  async function save(e: FormEvent): Promise<void> {
    e.preventDefault()
    setError('')
    const payload: AddressPayload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      province: form.province.trim(),
      city: form.city.trim(),
      district: (form.district || '').trim(),
      detail: form.detail.trim(),
      isDefault: Boolean(form.isDefault),
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      setShowForm(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    }
  }

  async function remove(id: number): Promise<void> {
    if (!confirm('确定删除该地址？')) return
    setError('')
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  return (
    <div className="page">
      <button type="button" className="back" onClick={() => void navigate('/home/me')}>
        ← 我的
      </button>
      <div className="head">
        <div>
          <h1>收货地址</h1>
          <p>管理下单常用地址</p>
        </div>
        <button type="button" className="add" onClick={openCreate}>
          新增地址
        </button>
      </div>

      {displayError ? <p className="err">{displayError}</p> : null}
      {loading ? <p className="hint">加载中…</p> : null}

      {!loading && !list.length && !showForm ? (
        <div className="empty">
          <p>还没有地址</p>
          <button type="button" onClick={openCreate}>
            添加第一个地址
          </button>
        </div>
      ) : !loading ? (
        <div className="list">
          {list.map((item) => (
            <article key={item.id} className="card">
              <div className="card__top">
                <strong>{item.name}</strong>
                <span>{item.phone}</span>
                {item.isDefault ? <em>默认</em> : null}
              </div>
              <p>
                {item.province} {item.city} {item.district} {item.detail}
              </p>
              <div className="card__actions">
                <button type="button" onClick={() => openEdit(item)}>
                  编辑
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    void remove(item.id)
                  }}
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {showForm ? (
        <form className="form" onSubmit={(e) => void save(e)}>
          <h2>{editingId ? '编辑地址' : '新增地址'}</h2>
          <label>
            <span>收货人</span>
            <input
              value={form.name}
              required
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label>
            <span>手机号</span>
            <input
              value={form.phone}
              required
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <div className="row">
            <label>
              <span>省</span>
              <input
                value={form.province}
                required
                onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
              />
            </label>
            <label>
              <span>市</span>
              <input
                value={form.city}
                required
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </label>
          </div>
          <label>
            <span>区/县</span>
            <input
              value={form.district ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
            />
          </label>
          <label>
            <span>详细地址</span>
            <input
              value={form.detail}
              required
              onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={Boolean(form.isDefault)}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            <span>设为默认地址</span>
          </label>
          <div className="form__actions">
            <button type="button" className="ghost" onClick={() => setShowForm(false)}>
              取消
            </button>
            <button type="submit" disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
