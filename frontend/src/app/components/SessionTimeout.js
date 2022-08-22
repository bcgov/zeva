import React from 'react';

const SessionTimeout = ({ closeModal }) => {
  return (
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
  );
};
export default SessionTimeout;
