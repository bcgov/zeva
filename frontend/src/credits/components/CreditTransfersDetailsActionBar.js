import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../app/components/Button';
import CustomPropTypes from '../../app/utilities/props';

const CreditTransfersDetailsActionBar = (props) => {
  const {
    allChecked,
    assertions,
    checkboxes,
    comment,
    setModalType,
    setShowModal,
    transferRole,
    user,
  } = props;

  const actionBar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <Button buttonType="back" locationRoute="/credit-transfers" />
            {transferRole.tradePartner
            && (
              <Button
                testid="reject-transfer"
                buttonType="reject"
                optionalText="Reject Notice"
                disabled={comment.length === 0 || allChecked}
                action={() => {
                  setModalType('partner-reject');
                  setShowModal(true);
                }}
              />
            )}
            {transferRole.rescindable
            && (
              <Button
                buttonType="rescind"
                disabled={comment.length === 0}
                action={() => {
                  setModalType('rescind');
                  setShowModal(true);
                }}
              />
            )}
            {transferRole.governmentAnalyst
            && (
            <Button
              testid="recommend-reject-transfer"
              buttonType="reject"
              optionalText="Recommend Rejection"
              action={() => {
                setModalType('recommend-reject');
                setShowModal(true);
              }}
            />
            )}
            {transferRole.governmentDirector
            && (
            <Button
              testid="director-reject-transfer"
              buttonType="reject"
              optionalText="Reject Transfer"
              action={() => {
                setModalType('director-reject');
                setShowModal(true);
              }}
            />
            )}
          </span>
          <span className="right-content">
            { transferRole.initiatingSupplier
            && user.hasPermission('SUBMIT_CREDIT_TRANSFER_PROPOSAL')
            && (
            <Button
              testid="submit-to-partner"
              buttonType="submit"
              action={() => {
                setModalType('initiating-submit');
                setShowModal(true);
              }}
              optionalText="Submit Notice"
              disabled={!checkboxes.authority || !checkboxes.accurate || !checkboxes.consent || comment.length > 0}
            />
            )}
            {transferRole.governmentAnalyst
            && (
            <Button
              testid="recommend-approve-transfer"
              buttonType="approve"
              optionalText="Recommend transfer"
              action={() => {
                setModalType('recommend-transfer');
                setShowModal(true);
              }}
            />
            )}
            {transferRole.tradePartner
            && user.hasPermission('SUBMIT_CREDIT_TRANSFER_PROPOSAL')
            && (
            <Button
              testid="submit-to-gov"
              buttonType="submit"
              action={() => {
                setModalType('partner-accept');
                setShowModal(true);
              }}
              optionalText="Submit Notice"
              disabled={checkboxes.length < assertions.length}
            />
            )}
            {transferRole.governmentDirector
            && (
            <Button
              testid="director-record"
              buttonType="approve"
              optionalText="Record Transfer"
              action={() => {
                setModalType('director-record');
                setShowModal(true);
              }}
            />
            )}
          </span>

        </div>
      </div>
    </div>
  );
  return (
    <>
      {actionBar}
    </>
  );
};
CreditTransfersDetailsActionBar.defaultProps = {
  assertions: [],
  comment: '',
};

CreditTransfersDetailsActionBar.propTypes = {
  allChecked: PropTypes.bool.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])).isRequired,
  comment: PropTypes.string,
  transferRole: PropTypes.shape().isRequired,
  setModalType: PropTypes.func.isRequired,
  setShowModal: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
};
export default CreditTransfersDetailsActionBar;
