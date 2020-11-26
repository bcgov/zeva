import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../app/components/Button';

const CreditTransfersDetailsActionBar = (props) => {
  const {
    setShowModal, setModalType, comment, allChecked, permissions, checkboxes, assertions,
  } = props;

  const actionBar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <Button buttonType="back" locationRoute="/credit-transfers" />
            {permissions.tradePartner
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
            {permissions.governmentAnalyst
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
            {permissions.governmentDirector
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
            { permissions.initiatingSupplier
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
            {permissions.governmentAnalyst
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
            {permissions.tradePartner
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
            {permissions.governmentDirector
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
  permissions: PropTypes.shape().isRequired,
  setModalType: PropTypes.func.isRequired,
  setShowModal: PropTypes.func.isRequired,

};
export default CreditTransfersDetailsActionBar;
