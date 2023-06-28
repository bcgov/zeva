import React, { useEffect, useState } from 'react'
import getSessionTimeout from '../utilities/getSessionTimeout'

const SessionTimeout = (props) => {
  const { keycloak, logout } = props
  const [showTimeout, setShowTimeout] = useState(false)

  // the following code is for retrieving the time until warning from keycloak settings
  const diffTime = getSessionTimeout(new Date(keycloak.refreshTokenParsed?.exp * 1000))

  let timeout = setTimeout(() => {
    setShowTimeout(true)
  }, diffTime)

  useEffect(() => {
    if (showTimeout) {
      setTimeout(() => {
        if (showTimeout) {
          logout()
        }
      }, 5 * 60 * 1000)
    }
  })

  const closeModal = () => {
    setShowTimeout(false)
  }
  const resetIdleTimeout = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      setShowTimeout(true)
    }, diffTime)
  }

  useEffect(() => {
    const events = ['load', 'mousedown', 'click', 'scroll', 'keypress']
    for (const i in events) {
      window.addEventListener(events[i], resetIdleTimeout)
    }
    resetIdleTimeout()
    return () => {
      for (const i in events) {
        window.removeEventListener(events[i], resetIdleTimeout)
        clearTimeout(timeout)
      }
    }
  })
  return (
    <>
      {showTimeout && (
        <div
          className="modal d-block"
          id="session-expiry-modal"
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Session Expiry</h4>
              </div>
              <div className="modal-body">
                <p>
                  Your session will end in a few minutes. If you would like to
                  continue working, please click Continue Session to extend your
                  session.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  id="modal-yes"
                  type="button"
                  className="btn btn-primary"
                  data-dismiss="modal"
                  onClick={closeModal}
                >
                  Continue Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default SessionTimeout
