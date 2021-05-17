/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment-timezone';

import CustomPropTypes from '../../app/utilities/props';
import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import ComplianceReportAlert from './ComplianceReportAlert';
import ComplianceReportSignOff from './ComplianceReportSignOff';
import SummaryCreditActivityTable from './SummaryCreditActivityTable';
import SummarySupplierInfo from './SummarySupplierInfo';
import SummaryConsumerSalesTable from './SummaryConsumerSalesTable';
import Modal from '../../app/components/Modal';

const ComplianceReportSummaryDetailsPage = (props) => {
  const [showModal, setShowModal] = useState(false);
  const {
    complianceRatios,
    assertions,
    checkboxes,
    creditActivityDetails,
    user,
    handleSubmit,
    loading,
    supplierDetails,
    consumerSalesDetails,
    handleCheckboxClick,
    makes,
    confirmationStatuses,
    pendingBalanceExist,
  } = props;
  const signedInfomation = {
    supplierInformation: { nameSigned: 'Buzz Collins', dateSigned: '2020-01-01' },
    consumerSales: { nameSigned: 'Buzz Collins', dateSigned: '2020-02-20' },
    creditActivity: { nameSigned: 'Buzz Collins', dateSigned: '2020-03-01' },
  };

  let disableSubmitBtn = true;
  if (loading) {
    return <Loading />;
  }
  const signatureInformation = (input, title) => {
    const { status, confirmedBy } = input;

    return (
      <div className="mt-3">
        {confirmedBy && (
          <span className="text-black">
            {title} confirmed by {confirmedBy.createUser.displayName} {moment(confirmedBy.createTimestamp).format('YYYY-MM-DD h[:]mm a')}
          </span>
        )}
        {status !== 'CONFIRMED' && status !== 'SUBMITTED' && !confirmedBy && (
          <span className="text-red">
            {title} pending confirmation
          </span>
        )}
      </div>
    );
  };

  const disableCheckbox = () => {
    const { supplierInformation, consumerSales, complianceObligation } = confirmationStatuses;
    if (user.hasPermission('SUBMIT_COMPLIANCE_REPORT')
      && supplierInformation.status === 'CONFIRMED'
      && consumerSales.status === 'CONFIRMED'
      && complianceObligation.status === 'CONFIRMED') {
      return false;
    }
    return true;
  };

  assertions.forEach((assertion) => {
    if (checkboxes.indexOf(assertion.id) >= 0) {
      disableSubmitBtn = false;
    }
  });

  const modal = (
    <Modal
      confirmLabel="Submit"
      handleCancel={() => { setShowModal(false); }}
      handleSubmit={() => { setShowModal(false); handleSubmit('SUBMITTED'); }}
      modalClass="w-75"
      showModal={showModal}
      confirmClass="button primary"
      icon={<FontAwesomeIcon icon="paper-plane" />}
    >
      <div>
        <div><br /><br /></div>
        <h3 className="d-inline">Submit Model Year Report to the Government of B.C.?
        </h3>
        <div><br /><br /></div>
      </div>
    </Modal>
  );

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{consumerSalesDetails.year} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {supplierDetails && supplierDetails.supplierInformation && supplierDetails.supplierInformation.history && (
            <ComplianceReportAlert
              report={supplierDetails.supplierInformation}
              status={confirmationStatuses.reportSummary}
              type="Report Summary"
            />
          )}
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 summary-page">
            <h3>Summary</h3>
            <div className="row p3 mt-3">
              <div className="col-lg-6">
                <div className="compliance-report-summary-grey text-blue">
                  <SummarySupplierInfo makes={makes} supplierDetails={supplierDetails} signatureInformation={signatureInformation} signedInfomation={signedInfomation} />
                  {signatureInformation(confirmationStatuses.supplierInformation, 'Supplier Information')}
                </div>

                <div className="mt-4 compliance-report-summary-grey">
                  <h3>Consumer Sales</h3>
                  <SummaryConsumerSalesTable consumerSalesDetails={consumerSalesDetails} />
                  {signatureInformation(confirmationStatuses.consumerSales, 'Consumer Sales')}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="compliance-report-summary-grey">
                  <SummaryCreditActivityTable
                    complianceRatios={complianceRatios}
                    consumerSalesDetails={consumerSalesDetails}
                    creditActivityDetails={creditActivityDetails}
                    pendingBalanceExist={pendingBalanceExist}
                  />
                  {signatureInformation(confirmationStatuses.complianceObligation, 'Compliance Obligation')}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="col-12 my-3">
          <ComplianceReportSignOff
            assertions={assertions}
            handleCheckboxClick={handleCheckboxClick}
            user={user}
            checkboxes={checkboxes}
            disabledCheckboxes={disableCheckbox()}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              <Button buttonType="back" locationRoute="/compliance/reports" />
            </span>
            <span className="right-content">
              {!user.isGovernment && (
                <Button
                  buttonType="submit"
                  disabled={disableSubmitBtn || confirmationStatuses.reportSummary.status === 'SUBMITTED' || !user.hasPermission('SUBMIT_COMPLIANCE_REPORT')}
                  optionalClassname="button primary"
                  action={() => {
                    setShowModal(true);
                  }}
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

ComplianceReportSummaryDetailsPage.defaultProps = {
};

ComplianceReportSummaryDetailsPage.propTypes = {
  assertions: PropTypes.arrayOf().isRequired,
  checkboxes: PropTypes.arrayOf().isRequired,
  complianceRatios: PropTypes.shape().isRequired,
  confirmationStatuses: PropTypes.shape().isRequired,
  consumerSalesDetails: PropTypes.shape().isRequired,
  creditActivityDetails: PropTypes.shape().isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  makes: PropTypes.shape().isRequired,
  pendingBalanceExist: PropTypes.bool.isRequired,
  supplierDetails: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceReportSummaryDetailsPage;
