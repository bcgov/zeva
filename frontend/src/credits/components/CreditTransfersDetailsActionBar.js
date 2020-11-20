import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../app/components/Button';

const CreditTransfersDetailsSupplierTable = (props) => {
  const {
    setShowModal, setModalType, comment, allChecked, permissions, checkboxes,
  } = props;

  const CreditTransfersDetailsActionBar = (
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
              disabled={!checkboxes.authority || !checkboxes.accurate || !checkboxes.consent || comment.length > 0}
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
      {CreditTransfersDetailsActionBar}
    </>
  );
};
CreditTransfersDetailsSupplierTable.defaultProps = {
  comment: '',
};

CreditTransfersDetailsSupplierTable.propTypes = {
  permissions: PropTypes.shape().isRequired,
  checkboxes: PropTypes.shape().isRequired,
  comment: PropTypes.string,
  allChecked: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  setModalType: PropTypes.func.isRequired,

};
export default CreditTransfersDetailsSupplierTable;
