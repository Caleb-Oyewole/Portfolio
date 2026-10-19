import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api.js'
import StatusPage from './StatusPage.jsx'

export default function NewsletterUnsubscribe() {
  const { token } = useParams()
  const [state, setState] = useState({ status: 'idle', message: '' })

  const run = async () => {
    setState({ status: 'working', message: '' })
    try {
      const r = await api.unsubscribe(token)
      setState({ status: 'ok', message: r?.detail || 'You have been unsubscribed' })
    } catch (e) {
      setState({ status: 'error', message: e.message })
    }
  }

  if (state.status === 'ok')
    return (
      <StatusPage tone="ok" title="You're unsubscribed">
        {state.message}. Sorry to see you go.
      </StatusPage>
    )
  if (state.status === 'error')
    return (
      <StatusPage tone="error" title="Couldn't unsubscribe">
        {state.message}. You may already be unsubscribed.
      </StatusPage>
    )
  return (
    <StatusPage title="Unsubscribe?">
      <p>Stop receiving the monthly newsletter?</p>
      <button className="btn btn--forest" onClick={run} disabled={state.status === 'working'}>
        {state.status === 'working' ? 'Working…' : 'Yes, unsubscribe me'}
      </button>
    </StatusPage>
  )
}
