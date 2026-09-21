import { useNavigate } from 'react-router-dom'
import { shopCategories } from '@/data/shop'
import './ShopCategory.css'

const cats = shopCategories.filter((c) => c.id !== 'all')

const covers: Record<string, string> = {
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
  digital: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
  home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
  food: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
  sport: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
}

export function ShopCategory() {
  const navigate = useNavigate()

  const back = (): void => {
    void navigate('/home/shop')
  }

  return (
    <div className="page">
      <header className="page__head">
        <button type="button" className="back" onClick={back}>
          ← 商城
        </button>
        <h1>商品分类</h1>
        <p>按兴趣逛起来</p>
      </header>
      <div className="grid">
        {cats.map((c) => (
          <article key={c.id} className="cat" onClick={back}>
            <img src={covers[c.id]} alt={c.name} loading="lazy" />
            <span>{c.name}</span>
          </article>
        ))}
      </div>
    </div>
  )
}
