import { useNavigate } from 'react-router-dom'
import './ShopOrders.css'

const orders = [
  {
    id: 'o1',
    status: '待发货',
    title: '柔雾唇釉套装 · 日常显白三色',
    price: 89,
    cover: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
  },
  {
    id: 'o2',
    status: '配送中',
    title: '降噪蓝牙耳机 Pro · 续航 36h',
    price: 299,
    cover: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
  },
  {
    id: 'o3',
    status: '已完成',
    title: '日式低糖曲奇礼盒',
    price: 49,
    cover: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  },
]

export function ShopOrders() {
  const navigate = useNavigate()

  return (
    <div className="orders">
      <header className="orders__head">
        <button type="button" className="back" onClick={() => void navigate('/home/shop')}>
          ← 商城
        </button>
        <h1>我的订单</h1>
        <p>跟踪包裹，复购更方便</p>
      </header>

      <div className="list">
        {orders.map((o) => (
          <article key={o.id} className="order">
            <div className="order__top">
              <span>订单 {o.id.toUpperCase()}</span>
              <strong>{o.status}</strong>
            </div>
            <div className="order__body">
              <img src={o.cover} alt={o.title} />
              <div>
                <h3>{o.title}</h3>
                <p className="price">
                  <small>¥</small>
                  {o.price}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
