import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cart'
import './ShopCart.css'

export function ShopCart() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const setQty = useCartStore((state) => state.setQty)
  const toggleChecked = useCartStore((state) => state.toggleChecked)

  const total = useMemo(
    () => items.filter((item) => item.checked).reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  )

  const count = useMemo(
    () => items.filter((item) => item.checked).reduce((sum, item) => sum + item.qty, 0),
    [items],
  )

  return (
    <div className="cart">
      <header className="cart__head">
        <button type="button" className="back" onClick={() => void navigate('/home/shop')}>
          ← 继续逛
        </button>
        <h1>购物车</h1>
        <p>已选 {count} 件，准备结算</p>
      </header>

      <div className="list">
        {items.map((item) => (
          <article key={item.id} className="row">
            <label className="check">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(event) => toggleChecked(item.id, event.target.checked)}
              />
            </label>
            <img src={item.cover} alt={item.title} />
            <div className="row__body">
              <h3>{item.title}</h3>
              <div className="row__foot">
                <span className="price">
                  <small>¥</small>
                  {item.price}
                </span>
                <div className="qty">
                  <button
                    type="button"
                    disabled={item.qty <= 1}
                    onClick={() => setQty(item.id, item.qty - 1)}
                  >
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button type="button" onClick={() => setQty(item.id, item.qty + 1)}>
                    +
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="bar">
        <div>
          <span className="bar__label">合计</span>
          <strong className="bar__total">
            <small>¥</small>
            {total}
          </strong>
        </div>
        <button type="button" className="bar__pay">
          去结算 ({count})
        </button>
      </footer>
    </div>
  )
}
