import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomPropTypes from '../../app/utilities/props';
import Modal from '../../app/components/Modal';

const SalesSubmissionSignaturesModal = (props) => {
  const {
    user, handleCancel, handleSubmit, showModal,
  } = props;

  return (
    <Modal
      confirmLabel=" Submit"
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      modalClass="w-75"
      showModal={showModal}
      confirmClass={"button primary"}
      icon={<FontAwesomeIcon icon="paper-plane" />}
    >
      <div>
        <div><br /><br /></div>
        <h4 className="d-inline">Submit credit request to government?
        </h4>
        <div><br /><br /></div>
      </div>
    </Modal>
  );
};

SalesSubmissionSignaturesModal.defaultProps = {};

SalesSubmissionSignaturesModal.propTypes = {
  handleCancel: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionSignaturesModal;
