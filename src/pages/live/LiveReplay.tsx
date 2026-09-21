import { useNavigate } from 'react-router-dom'
import { liveReplays, formatViewers } from '@/data/live'
import './LiveReplay.css'

export function LiveReplay() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <button type="button" className="back" onClick={() => void navigate('/home/live')}>
        ← 直播大厅
      </button>
      <h1>精彩回放</h1>
      <p className="sub">错过直播也能把好物捡回来</p>

      <div className="grid">
        {liveReplays.map((room) => (
          <article key={room.id} className="item">
            <img src={room.cover} alt={room.title} />
            <div className="item__body">
              <span>回放 · {formatViewers(room.viewers)} 次观看</span>
              <h3>{room.title}</h3>
              <p>@{room.host}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
