import { useNavigate } from 'react-router-dom'
import { liveRooms, formatViewers } from '@/data/live'
import './LiveHall.css'

export function LiveHall() {
  const navigate = useNavigate()

  return (
    <div className="live-hall">
      <header className="live-hall__head">
        <div>
          <h1>直播大厅</h1>
          <p>边看讲解，边把同款带回家</p>
        </div>
        <div className="live-hall__tools">
          <button type="button" className="chip" onClick={() => void navigate('/home/live/preview')}>
            预告
          </button>
          <button type="button" className="chip" onClick={() => void navigate('/home/live/replay')}>
            回放
          </button>
        </div>
      </header>

      <div className="grid">
        {liveRooms.map((room) => (
          <article key={room.id} className="room">
            <img className="room__cover" src={room.cover} alt={room.title} loading="lazy" />
            <div className="room__top">
              <span className="room__live">
                <i />
                直播中
              </span>
              <span className="room__viewers">{formatViewers(room.viewers)} 在看</span>
            </div>
            <div className="room__body">
              <span className="room__tag">{room.tag}</span>
              <h3>{room.title}</h3>
              <p>
                @{room.host} · {room.productHint}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
