import { useNavigate } from 'react-router-dom'
import { livePreviews } from '@/data/live'
import './LivePreview.css'

export function LivePreview() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <button type="button" className="back" onClick={() => void navigate('/home/live')}>
        ← 直播大厅
      </button>
      <h1>直播预告</h1>
      <p className="sub">预约开播，不错过秒杀</p>

      <div className="list">
        {livePreviews.map((room) => (
          <article key={room.id} className="card">
            <img src={room.cover} alt={room.title} />
            <div>
              <span className="time">{room.startAt}</span>
              <h3>{room.title}</h3>
              <p>@{room.host}</p>
              <button type="button">预约提醒</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
