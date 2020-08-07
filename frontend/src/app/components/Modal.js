import React from 'react';
import PropTypes from 'prop-types';

const Modal = (props) => {
  const {
    cancelLabel,
    children,
    confirmClass,
    confirmLabel,
    handleCancel,
    handleSubmit,
    modalClass,
    showModal,
    title,
    icon,
  } = props;

  return ([
    <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} key="modal-window" role="dialog" tabIndex="-1">
      <div className={`modal-dialog ${modalClass}`} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              aria-label="Close"
              className="close"
              data-dismiss="modal"
              onClick={handleCancel}
              type="button"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-outline-secondary"
              data-dismiss="modal"
              id="cancel"
              onClick={handleCancel}
              type="button"
            >{cancelLabel}
            </button>
            <button
              className={`btn ${confirmClass}`}
              id="confirm"
              type="button"
              onClick={handleSubmit}
            >{icon}{confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    <div className={`modal-backdrop ${showModal ? 'd-block' : 'd-none'}`} key="modal-backdrop" />,
  ]);
};

Modal.defaultProps = {
  icon: '',
  cancelLabel: 'Cancel',
  confirmClass: 'btn-outline-primary',
  confirmLabel: 'Confirm',
  modalClass: '',
  title: 'Confirm',
};

Modal.propTypes = {
  cancelLabel: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  confirmClass: PropTypes.string,
  confirmLabel: PropTypes.string,
  handleCancel: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  modalClass: PropTypes.string,
  showModal: PropTypes.bool.isRequired,
  title: PropTypes.string,
  icon: PropTypes.node,
};

export default Modal;
