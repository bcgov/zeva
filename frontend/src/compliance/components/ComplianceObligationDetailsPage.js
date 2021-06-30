/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportAlert from './ComplianceReportAlert';
import ComplianceObligationAmountsTable from './ComplianceObligationAmountsTable';
import ComplianceObligationReductionOffsetTable from './ComplianceObligationReductionOffsetTable';
import ComplianceObligationTableCreditsIssued from './ComplianceObligationTableCreditsIssued';
import ComplianceReportSignoff from './ComplianceReportSignOff';

import Modal from '../../app/components/Modal';
import history from '../../app/History';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';

const ComplianceObligationDetailsPage = (props) => {
  const {
    assertions,
    checkboxes,
    details,
    handleCancelConfirmation,
    handleCheckboxClick,
    handleSave,
    loading,
    user,
    ratios,
    reportDetails,
    reportYear,
    supplierClass,
    statuses,
    disabledCheckboxes: propsDisabledCheckboxes,
    handleUnspecifiedCreditReduction,
    id,
    zevClassAReduction,
    creditBalance,
    sales,
    handleChangeSales,
    creditReductionSelection,
    pendingBalanceExist,
    classAReductions,
    unspecifiedReductions,
    totalReduction,
  } = props;
  const [showModal, setShowModal] = useState(false);
  let disabledCheckboxes = propsDisabledCheckboxes;

  const modal = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => { setShowModal(false); }}
      handleSubmit={() => { setShowModal(false); handleCancelConfirmation(); }}
      modalClass="w-75"
      showModal={showModal}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>
          Do you want to edit this page? This action will allow you to make further changes to{' '}
          this information, it will also query the database to retrieve any recent updates.{' '}
          Your previous confirmation will be cleared.
        </h3>
      </div>
    </Modal>
  );

  assertions.forEach((assertion) => {
    if (checkboxes.indexOf(assertion.id) >= 0) {
      disabledCheckboxes = 'disabled';
    }
  });
  if (loading) {
    return <Loading />;
  }

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{reportYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {details && details.complianceObligation && details.complianceObligation.history && (
            <ComplianceReportAlert
              next="Summary"
              report={details.complianceObligation}
              status={statuses.complianceObligation}
              type="Compliance Obligation"
            />
          )}
        </div>
      </div>
      <div id="compliance-obligation-page">
        <div>
          {!user.isGovernment && statuses.complianceObligation.status === 'CONFIRMED' && (
            <button
              className="btn button primary float-right mb-2"
              onClick={() => {
                setShowModal(true);
              }}
              type="button"
            >
              Edit
            </button>
          )}
          <h3 className="mb-2">Compliance Obligation</h3>
        </div>
        <div className="clear">
          <ComplianceObligationAmountsTable
            classAReductions={classAReductions}
            handleChangeSales={handleChangeSales}
            page="obligation"
            ratios={ratios}
            reportYear={reportYear}
            sales={sales}
            statuses={statuses}
            supplierClass={supplierClass}
            totalReduction={totalReduction}
            unspecifiedReductions={unspecifiedReductions}
          />
        </div>
        <div className="mt-4">
          <ComplianceObligationTableCreditsIssued
            pendingBalanceExist={pendingBalanceExist}
            reportYear={reportYear}
            reportDetails={reportDetails}
          />
        </div>
        <h3 className="mt-4 mb-2">Credit Reduction</h3>
        You must select your ZEV class credit preference below.
        <ComplianceObligationReductionOffsetTable
          statuses={statuses}
          handleUnspecifiedCreditReduction={handleUnspecifiedCreditReduction}
          supplierClass={supplierClass}
          user={user}
          classAReductions={classAReductions}
          unspecifiedReductions={unspecifiedReductions}
          reportYear={reportYear}
          creditBalance={creditBalance}
          creditReductionSelection={creditReductionSelection}
        />
      </div>
      <ComplianceReportSignoff
        assertions={assertions}
        handleCheckboxClick={handleCheckboxClick}
        user={user}
        checkboxes={checkboxes}
        disabledCheckboxes={disabledCheckboxes}
      />
      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              {/* <Button buttonType="back" locationRoute="/compliance/reports" /> */}
            </span>
            <span className="right-content">
              <Button
                buttonType="next"
                optionalClassname="button"
                optionalText="Next"
                action={() => {
                  history.push(ROUTES_COMPLIANCE.REPORT_SUMMARY.replace(':id', id));
                }}
              />
              {!user.isGovernment && (
              <Button
                buttonType="save"
                disabled={['SAVED', 'UNSAVED'].indexOf(statuses.complianceObligation.status) < 0}
                optionalClassname="button primary"
                action={() => { handleSave(); }}
              />
              )}
            </span>
          </div>
        </div>
      </div>
      {modal}
    </div>
  );
};

ComplianceObligationDetailsPage.defaultProps = {
  ratios: {
    complianceRatio: 0,
    zevClassA: 0,
  },
  creditReductionSelection: null,
  sales: 0,
};

ComplianceObligationDetailsPage.propTypes = {
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    complianceObligation: PropTypes.shape(),
  }).isRequired,
  handleCancelConfirmation: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
  supplierClass: PropTypes.string.isRequired,
  reportDetails: PropTypes.shape().isRequired,
  ratios: PropTypes.shape(),
  reportYear: PropTypes.number.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ).isRequired,
  statuses: PropTypes.shape().isRequired,
  // handleOffsetChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  disabledCheckboxes: PropTypes.string.isRequired,
  handleUnspecifiedCreditReduction: PropTypes.func.isRequired,
  zevClassAReduction: PropTypes.shape().isRequired,
  unspecifiedReductions: PropTypes.shape().isRequired,
  creditBalance: PropTypes.shape().isRequired,
  sales: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  handleChangeSales: PropTypes.func.isRequired,
  creditReductionSelection: PropTypes.string,
  totalReduction: PropTypes.number.isRequired,
};
export default ComplianceObligationDetailsPage;
