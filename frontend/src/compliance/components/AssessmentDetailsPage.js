/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import ComplianceObligationAmountsTable from './ComplianceObligationAmountsTable';
import ComplianceReportAlert from './ComplianceReportAlert';
import formatNumeric from '../../app/utilities/formatNumeric';
import ComplianceObligationReductionOffsetTable from './ComplianceObligationReductionOffsetTable';
import ComplianceObligationTableCreditsIssued from './ComplianceObligationTableCreditsIssued';
import CommentInput from '../../app/components/CommentInput';
import DisplayComment from '../../app/components/DisplayComment';

const AssessmentDetailsPage = (props) => {
  const {
    creditActivityDetails,
    details,
    id,
    handleAddBceidComment,
    handleAddIdirComment,
    handleCommentChangeBceid,
    handleCommentChangeIdir,
    loading,
    makes,
    reportYear,
    radioDescriptions,
    statuses,
    user,
    sales,
    handleSubmit,
    directorAction,
    analystAction,
    setDetails,
    classAReductions,
    ratios,
    pendingBalanceExist,
    supplierClass,
    totalReduction,
    unspecifiedReductions,
    deductions,
    updatedBalances,
  } = props;

  const assessmentDecision = details.assessment.decision && details.assessment.decision.description ? details.assessment.decision.description.replace(/{user.organization.name}/g, details.organization.name).replace(/{modelYear}/g, reportYear) : '';
  const disabledInputs = false;
  const showDescription = (each) => (
    <div className="mb-3" key={each.id}>
      <input
        defaultChecked={details.assessment.decision.description === each.description}
        className="mr-3"
        type="radio"
        name="assessment"
        disabled={directorAction || ['RECOMMENDED', 'ASSESSED'].indexOf(details.assessment.validationStatus) >= 0}
        onChange={() => {
          setDetails({
            ...details,
            assessment: {
              ...details.assessment,
              decision: {
                description: each.description,
                id: each.id,
              },
            },
          });
        }}
      />
      {each.description
      && (
      <label className="d-inline text-blue" htmlFor="complied">
        {each.description
          .replace(/{user.organization.name}/g, details.organization.name)
          .replace(/{modelYear}/g, reportYear)}
      </label>
      )}
    </div>
  );
  let disabledRecommendBtn = false;
  let recommendTooltip = '';

  if (!assessmentDecision) {
    disabledRecommendBtn = true;
    recommendTooltip = 'Please select an Analyst Recommendation before recommending this assessment.';
  }

  if (pendingBalanceExist) {
    disabledRecommendBtn = true;
    recommendTooltip = 'There are credit applications that must be issued prior to recommending this assessment.';
  }

  if (loading) {
    return <Loading />;
  }

  const getClassDescriptions = (_supplierClass) => {
    switch (_supplierClass) {
      case 'L':
        return 'Large';
      case 'M':
        return 'Medium';
      default:
        return 'Small';
    }
  };

  return (
    <div id="assessment-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{reportYear} Model Year Report</h2>
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
          {user.isGovernment
          && (
            <>
              {(details.changelog.ldvChanges
              || details.idirComment.length > 0
              || statuses.assessment.status !== 'ASSESSED')
              && (
              <div className="grey-border-area p-3 comment-box mt-2">
                {details.changelog.ldvChanges && (
                  Object.keys(details.changelog.makesAdditions)
              || details.changelog.ldvChanges > 0
                )
           && (
           <>
             <h3>Assessment Adjustments</h3>
             <div className="text-blue">
               The analyst made the following adjustments:
               {details.changelog.makesAdditions
               && (
               <ul>
                 {details.changelog.makesAdditions.map((addition) => (
                   <li key={addition.make}>added Make: {addition.make}</li>
                 ))}
                 {/* {details.analystChanges.ldvChanges.map((change) => ( */}
                 <li>changed the {details.changelog.ldvChanges.year} Model Year LDV Sales\Leases total from {formatNumeric(details.changelog.ldvChanges.notFromGov, 0)} to {formatNumeric(details.changelog.ldvChanges.fromGov, 0)}</li>
               </ul>
               )}
             </div>
           </>
           )}
                {details.idirComment && details.idirComment.length > 0 && user.isGovernment && (
                <DisplayComment
                  commentArray={details.idirComment}
                />
                )}
                {statuses.assessment.status !== 'ASSESSED'
            && (
            <CommentInput
              handleAddComment={handleAddIdirComment}
              handleCommentChange={handleCommentChangeIdir}
              title={analystAction ? 'Add comment to director: ' : 'Add comment to the analyst'}
              buttonText="Add Comment"
            />
            )}
              </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div id="compliance-obligation-page">
            {!user.isGovernment && statuses.assessment.status === 'ASSESSED' && (
              <button
                className="btn button primary float-right"
                onClick={() => {
                  console.log('create supplemental');
                }}
                type="button"
              >
                Create Supplemental Report
              </button>
            )}
            {analystAction && (['RETURNED', 'SUBMITTED', 'UNSAVED'].indexOf(statuses.assessment.status) >= 0) && (
              <button
                className="btn button primary float-right"
                onClick={() => {
                  history.push(ROUTES_COMPLIANCE.ASSESSMENT_EDIT.replace(':id', id));
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
            {details.organization.organizationAddress
            && details.organization.organizationAddress.length > 0 && (
            <div>
              <div className="d-inline-block mr-5 mt-3 col-5 text-blue">
                <h4>Service Address</h4>
                {details.organization.organizationAddress.map((address) => (
                  address.addressType.addressType === 'Service' && (
                    <div key={address.id}>
                      {address.representativeName && (
                        <div> {address.representativeName} </div>
                      )}
                      <div> {address.addressLine1} </div>
                      <div> {address.addressLine2} </div>
                      <div> {address.city} {address.state} {address.country} </div>
                      <div> {address.postalCode} </div>
                    </div>
                  )
                ))}
              </div>
              <div className="d-inline-block mt-3 col-xs-12 col-sm-5 text-blue">
                <h4>Records Address</h4>
                {details.organization.organizationAddress.map((address) => (
                  address.addressType.addressType === 'Records' && (
                    <div key={address.id}>
                      {address.representativeName && (
                        <div> {address.representativeName} </div>
                      )}
                      <div> {address.addressLine1} </div>
                      <div> {address.addressLine2} </div>
                      <div> {address.city} {address.state} {address.country} </div>
                      <div> {address.postalCode} </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            )}
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
              <p className="d-inline ml-2">{getClassDescriptions(supplierClass)} Volume Supplier</p>
            </div>

            <div className="mt-4">
              <ComplianceObligationAmountsTable
                classAReductions={classAReductions}
                page="assessment"
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
                reportDetails={creditActivityDetails}
              />
            </div>

            <h3 className="mt-4 mb-2">Credit Reduction</h3>

            <ComplianceObligationReductionOffsetTable
              creditReductionSelection={details.creditReductionSelection}
              deductions={deductions}
              pendingBalanceExist={pendingBalanceExist}
              statuses={statuses}
              supplierClass={supplierClass}
              updatedBalances={updatedBalances}
              user={user}
            />
          </div>
        </div>
      </div>
      {(details.assessment && details.assessment.decision
        && details.assessment.decision.description)
        && (!user.isGovernment || (user.isGovernment && ['ASSESSED', 'RECOMMENDED'].indexOf(statuses.assessment.status) >= 0)) && (
          <>
            <h3 className="mt-4 mb-1">Director Assessment</h3>
            <div className="row mb-3">
              <div className="col-12">
                <div className="grey-border-area comment-box p-3 mt-2">
                  <div className="text-blue">
                    <div>The Director has assessed that {assessmentDecision} {details.assessment.assessmentPenalty
                    && `$${details.assessment.assessmentPenalty} CAD`}
                    </div>
                    {details.bceidComment && details.bceidComment.comment
                    && <div className="mt-2">{parse(details.bceidComment.comment)}</div>}
                  </div>
                </div>
              </div>
            </div>
          </>
      )}
      {analystAction && ['ASSESSED'].indexOf(statuses.assessment.status) < 0
      && (
        <>
          {['RECOMMENDED'].indexOf(statuses.assessment.status) < 0 && (
          <h3 className="mt-4 mb-1">Analyst Recommended Director Assessment</h3>
          )}
          <div className="row mb-3">
            <div className="col-12">
              <div className="grey-border-area comment-box p-3 mt-2">
                <div>
                  {['RECOMMENDED'].indexOf(statuses.assessment.status) < 0 && (
                  <>
                    {radioDescriptions.map((each) => (
                      (each.displayOrder === 0) && showDescription(each)
                    ))}
                    <div className="text-blue mt-3 ml-3 mb-1">
                      &nbsp;&nbsp; {details.organization.name} has not complied with section 10 (2) of the
                      Zero-Emission Vehicles Act for the {reportYear} adjustment period.
                    </div>
                    {radioDescriptions.map((each) => (
                      (each.displayOrder > 0) && showDescription(each)
                    ))}
                    <label className="d-inline" htmlFor="penalty-radio">
                      <div>
                        <input
                          disabled={
                            directorAction
                            || ['RECOMMENDED', 'ASSESSED'].indexOf(details.assessment.validationStatus) >= 0
                            || assessmentDecision.indexOf('Section 10 (3) applies') < 0
                          }
                          type="text"
                          className="ml-4 mr-1"
                          defaultValue={details.assessment.assessmentPenalty}
                          name="penalty-amount"
                          onChange={(e) => {
                            setDetails({
                              ...details,
                              assessment: {
                                ...details.assessment,
                                assessmentPenalty: e.target.value,
                              },
                            });
                          }}
                        />
                        <label className="text-grey" htmlFor="penalty-amount">$5,000 CAD x ZEV unit deficit</label>
                      </div>
                    </label>
                  </>
                  )}
                  <CommentInput
                    disable={details.assessment.validationStatus === 'ASSESSED'}
                    defaultComment={details.bceidComment}
                    handleAddComment={handleAddBceidComment}
                    handleCommentChange={handleCommentChangeBceid}
                    title="Assessment Message to the Supplier: "
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              <Button buttonType="back" locationRoute="/compliance/reports" />

              {directorAction && (
                <button
                  className="button text-danger"
                  onClick={() => {
                    handleSubmit('RETURNED');
                  }}
                  type="button"
                >
                  Return to Analyst
                </button>
              )}
            </span>

            <span className="right-content">
              {(directorAction || analystAction) && (
                <Button
                  buttonTooltip={recommendTooltip}
                  buttonType="button"
                  optionalClassname="button"
                  optionalText="Save"
                  disabled={disabledRecommendBtn}
                  action={() => {
                    handleSubmit(details.assessment.validationStatus);
                  }}
                />
              )}
              {analystAction && (
                <Button
                  buttonTooltip={recommendTooltip}
                  buttonType="submit"
                  optionalClassname="button primary"
                  optionalText="Recommend Assessment"
                  disabled={disabledRecommendBtn}
                  action={() => {
                    handleSubmit('RECOMMENDED');
                  }}
                />
              )}
              {directorAction && (
                <Button
                  buttonType="submit"
                  optionalClassname="button primary"
                  optionalText="Issue Assessment"
                  action={() => {
                    handleSubmit('ASSESSED');
                  }}
                />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

AssessmentDetailsPage.defaultProps = {
  pendingBalanceExist: false,
  sales: 0,
};

AssessmentDetailsPage.propTypes = {
  creditActivityDetails: PropTypes.shape().isRequired,
  details: PropTypes.shape().isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  loading: PropTypes.bool.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
  reportYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
  sales: PropTypes.number,
  handleSubmit: PropTypes.func.isRequired,
  directorAction: PropTypes.bool.isRequired,
  analystAction: PropTypes.bool.isRequired,
  handleAddBceidComment: PropTypes.func.isRequired,
  handleAddIdirComment: PropTypes.func.isRequired,
  handleCommentChangeBceid: PropTypes.func.isRequired,
  handleCommentChangeIdir: PropTypes.func.isRequired,
  radioDescriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setDetails: PropTypes.func.isRequired,
  classAReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  ratios: PropTypes.shape().isRequired,
  pendingBalanceExist: PropTypes.bool,
  supplierClass: PropTypes.string.isRequired,
  totalReduction: PropTypes.number.isRequired,
  unspecifiedReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  deductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  updatedBalances: PropTypes.shape().isRequired,
};
export default AssessmentDetailsPage;
