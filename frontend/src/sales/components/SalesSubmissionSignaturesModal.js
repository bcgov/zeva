import React from 'react';
import PropTypes from 'prop-types';

import CustomPropTypes from '../../app/utilities/props';
import Modal from '../../app/components/Modal';

const SalesSubmissionSignaturesModal = (props) => {
  const {
    user, handleCancel, handleSubmit, showModal,
  } = props;

  return (
    <Modal
      confirmLabel="Sign and Submit"
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      showModal={showModal}
      title="Signing Authority Declaration"
    >
      <strong>I, {user.displayName}, senior Signing Officer, {user.organization.name}:</strong>
      <div>
        <input type="checkbox" id="sd-1" />
        <label htmlFor="sd-1"> confirm that records
          evincing each matter
          reported under section 11.11 (2) of the Regulation
          are available on request.
        </label>
      </div>
      <div>
        <input type="checkbox" id="sd-2" />
        <label htmlFor="sd-2"> confirm that I am an
          officer or employee of
          the vehicle supplier, and that records evidencing my authority to
          submit this proposal are available on
          request.
        </label>
      </div>
      <div>
        <input type="checkbox" id="sd-3" />
        <label htmlFor="sd-3"> certify that the
          information in this report
          is true and complete to the best of my knowledge and I
          understand that the Director may require records
          evidencing the truth of that information
        </label>
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
