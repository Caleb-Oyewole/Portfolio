import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api.js'
import StatusPage from './StatusPage.jsx'

export default function NewsletterConfirm() {
  const { token } = useParams()
  const [state, setState] = useState({ status: 'loading', message: '' })
  const ran = useRef(false) // React StrictMode runs effects twice in dev; confirm once.

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    api
      .confirm(token)
      .then((r) => setState({ status: 'ok', message: r?.detail || 'Subscription confirmed' }))
      .catch((e) => setState({ status: 'error', message: e.message }))
  }, [token])

  if (state.status === 'loading') return <StatusPage title="Confirming…">One moment while I confirm your subscription.</StatusPage>
  if (state.status === 'ok')
    return (
      <StatusPage tone="ok" title="You're in!">
        {state.message}. You&apos;ll get a note about once a month, and every email has an unsubscribe link.
      </StatusPage>
    )
  return (
    <StatusPage tone="error" title="That link didn't work">
      {state.message}. It may have expired or already been used. Try subscribing again from the site.
    </StatusPage>
  )
}
