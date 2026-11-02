import { useCallback, useRef, useState } from 'react'

// In-page replacement for window.confirm (embedded browsers such as the VS Code
// Simple Browser silently block native dialogs, which made Delete do nothing).
export function useConfirm() {
  const [state, setState] = useState(null)
  const resolver = useRef(null)

  const ask = useCallback(
    (message, { confirmLabel = 'Delete', danger = true } = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve
        setState({ message, confirmLabel, danger })
      }),
    [],
  )
  const close = (value) => {
    resolver.current?.(value)
    resolver.current = null
    setState(null)
  }

  const dialog = state && (
    <div className="adm__modal" role="alertdialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && close(false)}>
      <div className="adm__sheet adm__confirm">
        <p>{state.message}</p>
        <div className="adm__actions">
          <button type="button" className="adm__btn" onClick={() => close(false)}>Cancel</button>
          <button type="button" autoFocus className={`adm__btn ${state.danger ? 'adm__btn--dangerfill' : 'adm__btn--primary'}`} onClick={() => close(true)}>
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
  return [ask, dialog]
}
