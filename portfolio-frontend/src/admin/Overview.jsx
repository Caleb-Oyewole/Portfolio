import { Link } from 'react-router-dom'
import { admin } from './adminApi.js'
import { useLoad } from './hooks.js'

const cards = [
  ['projects', 'Manual projects', '/admin/projects'],
  ['achievements', 'Achievements', '/admin/achievements'],
  ['unread_messages', 'Unread messages', '/admin/messages'],
  ['subscribers', 'Confirmed subscribers', '/admin/subscribers'],
]

export default function Overview() {
  const { data, error, loading } = useLoad(() => admin.stats())
  return (
    <>
      <h2 className="adm__h">Overview</h2>
      {error && <div className="adm__error">{error}</div>}
      <div className="adm__cards">
        {cards.map(([k, label, to]) => (
          <Link key={k} to={to} className="adm__stat">
            <strong>{loading ? '…' : data?.[k] ?? 0}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <div className="adm__panel">
        <h3>Quick tips</h3>
        <ul className="adm__tips">
          <li>Your GitHub repos show on the site automatically; the <b>Projects</b> tab is for extra projects (merged by title).</li>
          <li>Put your photo link in <b>Profile → Photo URL</b> (any public image link, or a file inside <code>public/</code> like <code>/me.jpg</code>).</li>
          <li>Changes are live on the site straight away. Refresh the public page to see them.</li>
        </ul>
      </div>
    </>
  )
}
