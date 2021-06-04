import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../app/utilities/props';
import Loading from '../../app/components/Loading';
import ComplianceReportAlert from './ComplianceReportAlert';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';
import history from '../../app/History';
import ComplianceReportSignOff from './ComplianceReportSignOff';
import ConsumerSalesLDVModalTable from './ConsumerSalesLDVModelTable';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';

const ConsumerSalesDetailsPage = (props) => {
  const {
    details,
    handleCancelConfirmation,
    user,
    loading,
    handleSave,
    vehicles,
    assertions,
    checkboxes,
    disabledCheckboxes: propsDisabledCheckboxes,
    handleCheckboxClick,
    modelYear,
    statuses,
    id,
  } = props;

  const [showModal, setShowModal] = useState(false);
  let disabledCheckboxes = propsDisabledCheckboxes;

  if (loading) {
    return <Loading />;
  }

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

  return (
    <div id="compliance-consumer-sales-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{modelYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {details && details.consumerSales &&
            details.consumerSales.history && (
              <ComplianceReportAlert
                next="Compliance Obligation"
                report={details.consumerSales}
                status={statuses.consumerSales}
                type="Consumer ZEV Sales"
              />
            )}
        </div>
      </div>

      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 consumer-sales">
            {!user.isGovernment && statuses.consumerSales.status === 'CONFIRMED' && (
                <button
                  className="btn button primary float-right"
                  onClick={() => {
                    setShowModal(true);
                  }}
                  type="button"
                >
                  Edit
                </button>
              )}
            <div className="ldv-zev-models mt-2">
              <label className="text-blue mr-4 font-weight-bold">
                {modelYear} Model Year Zero-Emission Vehicles Sales
              </label>
              <div className="text-blue mt-2">
                If you have { modelYear } model year ZEV sales or leases that occurred before Oct. 1,{' '}
                {modelYear + 1} that you haven&apos;t
                applied for credits you must{' '}
                <label
                  className="text-primary"
                  onClick={() => {
                    history.push('/credit-requests/new');
                  }}
                >
                  {' '}
                  <u>enter an Application for Credits for Consumer sales</u>
                </label>{' '}
                before submitting this model year report.
              </div>
              <div className="total-ldv-sales mt-2 mb-2">
                *Sales Submitted are VIN submitted in credit applications
                awaiting government review, Sales Issued are those VIN already
                verified by government and have been issued credits.
              </div>
              <div className="sales-table mt-2">
                <ConsumerSalesLDVModalTable vehicles={vehicles} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 my-3">
          <ComplianceReportSignOff
            assertions={assertions}
            checkboxes={checkboxes}
            handleCheckboxClick={handleCheckboxClick}
            disabledCheckboxes={disabledCheckboxes}
            user={user}
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
              <Button
                buttonType="next"
                optionalClassname="button"
                optionalText="Next"
                action={() => {
                  history.push(
                    ROUTES_COMPLIANCE.REPORT_CREDIT_ACTIVITY.replace(':id', id)
                  );
                }}
              />
              {!user.isGovernment && (
                <Button
                  buttonType="save"
                  disabled={
                    ['SAVED', 'UNSAVED'].indexOf(
                      statuses.consumerSales.status
                    ) < 0
                  }
                  optionalClassname="button primary"
                  action={(event) => {
                    handleSave(event);
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
ConsumerSalesDetailsPage.defaultProps = {
  assertions: [],
  checkboxes: [],
};

ConsumerSalesDetailsPage.propTypes = {
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    consumerSales: PropTypes.shape(),
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
  loading: PropTypes.bool.isRequired,
  handleSave: PropTypes.func.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ),
  handleCancelConfirmation: PropTypes.func.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  disabledCheckboxes: PropTypes.string.isRequired,
  modelYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
};
export default ConsumerSalesDetailsPage;
