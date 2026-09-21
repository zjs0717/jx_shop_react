import { useNavigate } from 'react-router-dom'
import './VideoFollow.css'

export function VideoFollow() {
  const navigate = useNavigate()

  function goFeed(): void {
    void navigate('/home/video')
  }

  return (
    <div className="page">
      <div className="tabs">
        <button type="button" onClick={goFeed}>
          推荐
        </button>
        <button type="button" className="is-active">
          关注
        </button>
        <button type="button" onClick={() => void navigate('/home/video/nearby')}>
          同城
        </button>
      </div>
      <div className="empty">
        <p className="empty__title">还没有关注的创作者</p>
        <p className="empty__desc">去推荐页刷一刷，把喜欢的人留下来</p>
        <button type="button" className="empty__btn" onClick={goFeed}>
          去刷推荐
        </button>
      </div>
    </div>
  )
}
