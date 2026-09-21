import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shopCategories, shopProducts, formatSales } from '@/data/shop'
import './ShopHome.css'

export function ShopHome() {
  const navigate = useNavigate()
  const [active, setActive] = useState('all')

  const list = useMemo(
    () => (active === 'all' ? shopProducts : shopProducts.filter((p) => p.category === active)),
    [active],
  )

  return (
    <div className="shop">
      <header className="shop__head">
        <div>
          <h1 className="shop__title">发现好物</h1>
          <p className="shop__sub">精选上新 · 直播同款 · 限时特惠</p>
        </div>
        <div className="shop__tools">
          <button type="button" className="chip" onClick={() => void navigate('/home/shop/category')}>
            分类
          </button>
          <button type="button" className="chip" onClick={() => void navigate('/home/shop/orders')}>
            订单
          </button>
          <button type="button" className="chip chip--brand" onClick={() => void navigate('/home/shop/cart')}>
            购物车
          </button>
        </div>
      </header>

      <div className="cats" role="tablist" aria-label="商品分类">
        {shopCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cats__item${active === c.id ? ' is-active' : ''}`}
            role="tab"
            aria-selected={active === c.id}
            onClick={() => setActive(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid">
        {list.map((p) => (
          <article key={p.id} className="item">
            <div className="item__media">
              <img src={p.cover} alt={p.title} loading="lazy" />
              {p.tag ? <span className="item__tag">{p.tag}</span> : null}
            </div>
            <div className="item__body">
              <h3 className="item__title">{p.title}</h3>
              <div className="item__row">
                <span className="item__price">
                  <small>¥</small>
                  {p.price}
                </span>
                {p.originPrice ? <span className="item__origin">¥{p.originPrice}</span> : null}
              </div>
              <p className="item__sales">已售 {formatSales(p.sales)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
