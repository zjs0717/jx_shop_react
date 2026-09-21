import { useNavigate } from 'react-router-dom'
import './VideoNearby.css'

export function VideoNearby() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="tabs">
        <button type="button" onClick={() => void navigate('/home/video')}>
          推荐
        </button>
        <button type="button" onClick={() => void navigate('/home/video/follow')}>
          关注
        </button>
        <button type="button" className="is-active">
          同城
        </button>
      </div>
      <div className="empty">
        <p className="empty__title">同城内容准备中</p>
        <p className="empty__desc">开启定位后，这里会出现附近的人在拍什么</p>
        <button type="button" className="empty__btn" onClick={() => void navigate('/home/video')}>
          先看推荐
        </button>
      </div>
    </div>
  )
}
