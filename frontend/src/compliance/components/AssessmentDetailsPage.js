/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import Modal from '../../app/components/Modal';
import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import ComplianceObligationAmountsTable from './ComplianceObligationAmountsTable';
import ComplianceReportAlert from './ComplianceReportAlert';
import formatNumeric from '../../app/utilities/formatNumeric';

const AssessmentDetailsPage = (props) => {
  const {
    details,
    loading,
    make,
    makes,
    user,
    modelYear,
    statuses,
    id,
    handleAddComment,
    handleCommentChange,
    ratios,
    creditActivityDetails
  } = props;

  const [showModal, setShowModal] = useState(false);
  const disabledInputs = false;
  console.log(statuses);
  console.log(details);
  console.log(creditActivityDetails);
  if (loading) {
    return <Loading />;
  }
  const totalReduction = ((ratios.complianceRatio / 100) * details.ldvSales);
  const classAReduction = formatNumeric(
    ((ratios.zevClassA / 100) * details.ldvSales),
    2,
  );
  const leftoverReduction = ((ratios.complianceRatio / 100) * details.ldvSales)
  - ((ratios.zevClassA / 100) * details.ldvSales);

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

  return (
    <div id="assessment-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{modelYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div className="m-0">
            {details && details.supplierInformation && details.supplierInformation.history && (
            <ComplianceReportAlert
              next=""
              report={details.assessment}
              status={statuses.assessment}
              type="Assessment"
            />
            )}
          </div>

          <div className="grey-border-area p-4 comment-box mt-2">
            <div className="text-editor">
              <label htmlFor="comment">
                <b>Add comment to director:</b>
              </label>
              <ReactQuill
                theme="snow"
                modules={{
                  toolbar: [
                    ['bold', 'italic'],
                    [{ list: 'bullet' }, { list: 'ordered' }],
                  ],
                }}
                formats={['bold', 'italic', 'list', 'bullet']}
                onChange={handleCommentChange}
              />
              <button
                className="button mt-2"
                onClick={() => { handleAddComment(); }}
                type="button"
              >Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div className="p-3 grey-border-area p-4">
            {user.isGovernment && (statuses.assessment.status === 'SUBMITTED' || statuses.assessment.status === 'UNSAVED') && (
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
            <h3>Notice of Assessment</h3>
            <div className="mt-3">
              <h3> {details.organization.name} </h3>
            </div>
            <div>
              <div className="d-inline-block mr-5 mt-3 col-5">
                <h4>Service Address</h4>
                {details.organization.organizationAddress
                && details.organization.organizationAddress.map((address) => (
                  address.addressType.addressType === 'Service' && (
                    <div key={address.id}>
                      {address.representativeName && (
                        <div> {address.representativeName} </div>
                      )}
                      <div> {address.addressLine1} </div>
                      <div> {address.city} {address.state} {address.country} </div>
                      <div> {address.postalCode} </div>
                    </div>
                  )
                ))}
              </div>
              <div className="d-inline-block mt-3 col-xs-12 col-sm-5">
                <h4>Records Address</h4>
                {details.organization.organizationAddress
                && details.organization.organizationAddress.map((address) => (
                  address.addressType.addressType === 'Records' && (
                    <div key={address.id}>
                      {address.representativeName && (
                        <div> {address.representativeName} </div>
                      )}
                      <div> {address.addressLine1} </div>
                      <div> {address.city} {address.state} {address.country} </div>
                      <div> {address.postalCode} </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            <div className="mt-4">
              <h4>Light Duty Vehicle Makes:</h4>
              {(makes.length > 0) && (
                <div className={`mt-0 list ${disabledInputs ? 'disabled' : ''}`}>
                  <ul>
                    {makes.map((item, index) => (
                      <div className="form-row my-2" key={index}>
                        <li>
                          <div className="col-11">{item}</div>
                        </li>
                      </div>
                    ))}
                  </ul>
                </div>
              )}
              <h4 className="d-inline">Vehicle Supplier Class:</h4>
              <p className="d-inline ml-2">{details.class} Volume Supplier</p>
            </div>
            <div id="assessment-obligation-amounts">

              <ComplianceObligationAmountsTable
                page="assessment"
                reportYear={modelYear}
                supplierClassInfo={details}
                totalReduction={totalReduction}
                ratios={ratios}
                classAReduction={classAReduction}
                leftoverReduction={leftoverReduction}
              />
            </div>
            <div className="my-3 grey-border-area">
              hi
            </div>
          </div>
        </div>
      </div>
      <h3 className="mt-4 mb-1">Analyst Recommended Director Assessment</h3>
      <div className="row mb-3">
        <div className="col-12">
          <div className="grey-border-area comment-box p-4 mt-2">
            <div>

              <input
                className="mr-3"
                type="radio"
                id="complied"
                onChange={(event) => {
                  console.log('radio checked');
                }}
                name="complied"
              />
              <label className="d-inline" htmlFor="complied">
                {details.organization.name} has complied with section 10 (2) of the Zero-Emission
                Vehicles Act for the 2020 adjustment period.
              </label>
            </div>
            <div className="mt-3">
              <input
                className="mr-3"
                type="radio"
                id="not-complied"
                onChange={(event) => {
                  console.log('radio checked');
                }}
                name="not-complied"
              />
              <label className="d-inline" htmlFor="not-complied">
                {details.organization.name} has not complied with section 10 (2) of the Zero-Emission
                Vehicles Act for the 2020 adjustment period. Section 10 (3) does not apply
                as {details.organization.name} did not have a balance at the end of the compliance date
                for the previous model year that contained less than zero ZEV units of the same vehicle
                class and any ZEV class.
              </label>
            </div>
            <div className="mt-3">

              <input
                className="mr-3"
                type="radio"
                id="penalty-radio"
                onChange={(event) => {
                  console.log('radio checked');
                }}
                name="penalty-radio"
              />
              <label className="d-inline" htmlFor="penalty-radio">
                Section 10 (3) applies and {details.organization.name} is subject to an automatic
                administrative penalty As per section 26 of the Act the amount of the administrative
                penalty is:
                <div>

                  <input
                    type="text"
                    className="ml-4 mr-1"
                    name="penalty-amount"
                  />
                  <label className="text-grey" htmlFor="penalty-amount">$5,000 CAD x ZEV unit deficit</label>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              {/* <Button buttonType="back" locationRoute="/compliance/reports" /> */}
            </span>
            <span className="right-content">
              <Button
                buttonType="submit"
                optionalClassname="button primary"
                optionalText="Recommend Assessment"
                action={() => {
                  console.log('submit!');
                }}
              />
            </span>
          </div>
        </div>
        {modal}
      </div>

    </div>
  );
};

AssessmentDetailsPage.defaultProps = {
};

AssessmentDetailsPage.propTypes = {
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    supplierInformation: PropTypes.shape(),
  }).isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  loading: PropTypes.bool.isRequired,
  make: PropTypes.string.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
  modelYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
};
export default AssessmentDetailsPage;
