import React, { useEffect, useState } from 'react';

const SessionTimeout = (keycloak) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [diffTime, setDiffTime] = useState(10476000); //2 hours 55 mins 10476000,
  //to test with one minute use 60000 and update keykoak

  // the following code is for retrieving the time until warning from keycloak settings
  // let tokenExp = new Date(keycloak.refreshTokenParsed.exp * 1000);
  // diffTime = getSessionTimeout(tokenExp);

  let timeout = setTimeout(() => {
    setShowTimeout(true);
  }, diffTime);

  const closeModal = () => {
    setShowTimeout(false);
  };
  const resetIdleTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setShowTimeout(true);
    }, diffTime);
  };

  useEffect(() => {
    const events = ['load', 'mousedown', 'click', 'scroll', 'keypress'];
    for (let i in events) {
      window.addEventListener(events[i], resetIdleTimeout);
    }
    resetIdleTimeout();
    return () => {
      for (let i in events) {
        window.removeEventListener(events[i], resetIdleTimeout);
        clearTimeout(timeout);
      }
    };
  });
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
  );
};
export default SessionTimeout;
