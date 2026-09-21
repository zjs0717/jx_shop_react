import { useNavigate } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import HeroSlideshow from '@/components/fx/HeroSlideshow'
import SceneCanvas from '@/components/fx/SceneCanvas'
import { liveRooms, formatViewers } from '@/data/live'
import { shopProducts, formatSales } from '@/data/shop'
import './DiscoverPage.css'

const hotProducts = shopProducts.slice(0, 4)
const liveNow = liveRooms.slice(0, 3)

export function DiscoverPage() {
  const navigate = useNavigate()

  const go = (path: string): void => {
    void navigate(path)
  }

  return (
    <div className="discover">
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <HeroSlideshow />
          <SceneCanvas mode="full" />
          <div className="hero__shade" />
        </div>

        <div className="hero__content">
          <BrandMark size={56} />
          <p className="hero__brand">乐享</p>
          <p className="hero__pinyin">LEXIANG</p>
          <h1 className="hero__title">分享美好，传播快乐</h1>
          <p className="hero__sub">商城下单 · 竖屏刷剧 · 边看边买</p>
          <div className="hero__cta">
            <button type="button" className="btn btn--primary" onClick={() => go('/home/shop')}>
              去逛商城
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => go('/home/video')}>
              刷短视频
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => go('/home/live')}>
              看直播
            </button>
          </div>
          <div className="hero__chips" aria-hidden="true">
            <span>商城动效</span>
            <span>短视频浪</span>
            <span>LIVE 波</span>
          </div>
        </div>
      </section>

      <section className="section entries">
        <h2 className="section__title">现在出发</h2>
        <p className="section__desc">选一个你想沉浸的入口</p>
        <div className="entries__row">
          <button type="button" className="entry" onClick={() => go('/home/shop')}>
            <span className="entry__emoji" aria-hidden="true">
              袋
            </span>
            <strong>商城</strong>
            <span>精选好物</span>
          </button>
          <button type="button" className="entry" onClick={() => go('/home/video')}>
            <span className="entry__emoji" aria-hidden="true">
              播
            </span>
            <strong>短视频</strong>
            <span>上下滑刷</span>
          </button>
          <button type="button" className="entry" onClick={() => go('/home/live')}>
            <span className="entry__emoji entry__emoji--live" aria-hidden="true">
              LIVE
            </span>
            <strong>直播</strong>
            <span>边看边买</span>
          </button>
          <button type="button" className="entry" onClick={() => go('/home/dashboard')}>
            <span className="entry__emoji" aria-hidden="true">
              屏
            </span>
            <strong>数据屏</strong>
            <span>运营看板</span>
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">正在热卖</h2>
            <p className="section__desc">为你挑好的今日好物</p>
          </div>
          <button type="button" className="section__more" onClick={() => go('/home/shop')}>
            全部
          </button>
        </div>
        <div className="product-rail">
          {hotProducts.map((p) => (
            <article key={p.id} className="product" onClick={() => go('/home/shop')}>
              <img className="product__cover" src={p.cover} alt={p.title} loading="lazy" />
              <div className="product__body">
                <h3 className="product__title">{p.title}</h3>
                <div className="product__meta">
                  <span className="product__price">
                    <small>¥</small>
                    {p.price}
                  </span>
                  <span className="product__sales">已售 {formatSales(p.sales)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--last">
        <div className="section__head">
          <div>
            <h2 className="section__title">直播进行中</h2>
            <p className="section__desc">主播正在讲解同款</p>
          </div>
          <button type="button" className="section__more" onClick={() => go('/home/live')}>
            进入大厅
          </button>
        </div>
        <div className="live-rail">
          {liveNow.map((room) => (
            <article key={room.id} className="live" onClick={() => go('/home/live')}>
              <img className="live__cover" src={room.cover} alt={room.title} loading="lazy" />
              <div className="live__overlay">
                <span className="live__badge">直播中</span>
                <span className="live__viewers">{formatViewers(room.viewers)} 人看</span>
              </div>
              <div className="live__info">
                <h3>{room.title}</h3>
                <p>@{room.host}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
