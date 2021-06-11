/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
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
import TableSection from './TableSection';
import ComplianceObligationReductionOffsetTable from './ComplianceObligationReductionOffsetTable';
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
    modelYear,
    radioSelection,
    radioDescriptions,
    setPenalty,
    setRadioSelection,
    ratios,
    statuses,
    user,
    sales,
    handleSubmit,
  } = props;
  const {
    creditBalanceStart, pendingBalance, transactions, provisionalBalance,
  } = creditActivityDetails;
  const {
    creditsIssuedSales, transfersIn, transfersOut,
  } = transactions;
  const directorAction = user.isGovernment
  && ['RECOMMENDED'].indexOf(details.assessment.validationStatus) >= 0
  && user.hasPermission('SIGN_COMPLIANCE_REPORT');

  const analystAction = user.isGovernment
  && ['SUBMITTED'].indexOf(details.assessment.validationStatus) >= 0
  && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT');

  const [showModal, setShowModal] = useState(false);
  const disabledInputs = false;
  const showDescription = (each) => (
    <div className="mb-3" key={each.id}>
      <input
        defaultChecked={details.assessment.decision === each.description}
        className="mr-3"
        type="radio"
        name="assessment"
        disabled={directorAction || ['RECOMMENDED', 'ASSESSED'].indexOf(details.assessment.validationStatus) >= 0}
        onChange={(event) => {
          setRadioSelection(each.id);
        }}
      />
      <label className="d-inline text-blue" htmlFor="complied">
        {each.description
          .replace(/{user.organization.name}/g, details.organization.name)
          .replace(/{modelYear}/g, modelYear)}
      </label>
    </div>
  );
  let disabledRecommendBtn = false;
  let recommendTooltip = ""

   const pendingSalesExist = () => {
     if (Object.keys(pendingBalance).length > 0) {
       pendingBalance.forEach((each) => {
         if (parseInt(each.A) > 0 || parseInt(each.B) > 0) {
           disabledRecommendBtn = true;
           recommendTooltip = "There are some pending credit applications, please edit/referesh consumer zev sales to fetch the latest data";
         }
       });
     }
   };
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

  return (
    <div id="assessment-details" className="page">
      {pendingSalesExist()}
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
          {user.isGovernment
          && (
          <div className="grey-border-area p-4 comment-box mt-2">
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
            <CommentInput
              handleAddComment={handleAddIdirComment}
              handleCommentChange={handleCommentChangeIdir}
              title={analystAction? "Add comment to director: ": "Add comment to the analyst" }
              buttonText="Add Comment"
            />
          </div>
          )}
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div className="p-3 grey-border-area p-4">
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
            {user.isGovernment && (statuses.assessment.status === 'SUBMITTED' || statuses.assessment.status === 'UNSAVED') && (
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
            <div>
              <div className="d-inline-block mr-5 mt-3 col-5 text-blue">
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
              <div className="d-inline-block mt-3 col-xs-12 col-sm-5 text-blue">
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
                statuses={statuses}
                sales={sales}
              />
            </div>
            <div className="my-3 grey-border-area">
              <table>
                <tbody>
                  <tr className="subclass">
                    <th className="large-column">
                      BALANCE AT END OF SEPT. 30,  {modelYear}
                    </th>
                    <th className="small-column text-center text-blue">
                      A
                    </th>
                    <th className="small-column text-center text-blue">
                      B
                    </th>
                  </tr>
                  <tr key="balance-start">
                    <td className="text-blue" />
                    <td className="text-right">
                      {creditBalanceStart.A || 0}
                    </td>
                    <td className="text-right">
                      {creditBalanceStart.B || 0}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
            <h3>
              Credit Activity
            </h3>
            <div className="my-3 grey-border-area">
              <table>
                <tbody>
                  {Object.keys(creditsIssuedSales).length > 0
                  && (
                    <TableSection
                      input={creditsIssuedSales}
                      title="Issued for Consumer ZEV Sales"
                      negativeValue={false}
                    />
                  )}
                  {/* {Object.keys(creditsIssuedInitiative).length > 0
                  && (
                    <TableSection
                      input={creditsIssuedInitiative}
                      title="Issued from Initiative Agreements"
                      negativeValue={false}
                    />

                  )}
                  {Object.keys(creditsIssuedPurchase).length > 0
                  && (
                    <TableSection
                      input={creditsIssuedPurchase}
                      title="Issued from Purchase Agreements"
                      negativeValue={false}
                    />
                  )} */}
                  {Object.keys(transfersIn).length > 0
                  && (
                  <TableSection
                    input={transfersIn}
                    title="Transferred In"
                    negativeValue={false}
                  />

                  )}
                  {Object.keys(transfersOut).length > 0
                && (
                  <TableSection
                    input={transfersOut}
                    title="Transferred Away"
                    negativeValue={false}
                  />
                )}
                </tbody>
              </table>
            </div>
            <div className="my-3 grey-border-area">
              <table>
                <tbody>
                  <tr className="subclass">
                    <th className="large-column">
                      BALANCE BEFORE CREDIT REDUCTION
                    </th>
                    <th className="small-column text-center text-blue"> </th>
                    <th className="small-column text-center text-blue"> </th>
                  </tr>
                  {Object.keys(pendingBalance).length > 0
              && (

                Object.keys(provisionalBalance).sort((a, b) => {
                  if (a.modelYear < b.modelYear) {
                    return 1;
                  }
                  if (a.modelYear > b.modelYear) {
                    return -1;
                  }
                  return 0;
                }).map((each) => (
                  <tr key={each}>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {each} Credits
                    </td>
                    <td className="text-right">
                      {formatNumeric(provisionalBalance[each].A, 2)}
                    </td>
                    <td className="text-right">
                      {formatNumeric(provisionalBalance[each].B, 2)}
                    </td>
                  </tr>
                ))
              )}
                </tbody>
              </table>
            </div>
            <h3>
              Credit Reduction
            </h3>
            <div className="my-3 grey-border-area">
              <table>
                <tbody>
                  <tr className="subclass">
                    <th className="large-column">
                      ZEV Class A Credit Reduction
                    </th>
                    <th className="small-column text-center text-blue">
                      A
                    </th>
                    <th className="small-column text-center text-blue">
                      B
                    </th>
                  </tr>
                  <tr key="reduction">
                    <td className="text-blue">&bull; &nbsp; &nbsp; 2019 Credits:</td>
                    <td className="text-right text-red">
                      -567.43
                    </td>
                    <td className="text-right">
                      0
                    </td>
                  </tr>
                  <tr className="subclass">
                    <th className="large-column">
                      Unspecified ZEV Class Credit Reduction
                    </th>
                    <th className="small-column text-center text-blue" />
                    <th className="small-column text-center text-blue" />
                  </tr>
                  {user.isGovernment
                  && (
                    <tr>
                      <td>
                        Do you want to use ZEV Class A or B credits first for your unspecified ZEV class reduction?
                      </td>

                      <td className="text-center">
                        <input type="radio" name="reduction" readOnly disabled={directorAction || analystAction}/>
                      </td>

                      <td className="text-center">
                        <input checked type="radio" name="reduction" readOnly disabled={directorAction || analystAction} />
                      </td>
                    </tr>
                  )}
                  <tr key="reduction-start">
                    <td className="text-blue">&bull; &nbsp; &nbsp; 2019 Credits:</td>
                    <td className="text-right">
                      0
                    </td>
                    <td className="text-right text-red">
                      147.86
                    </td>
                  </tr>
                </tbody>
              </table>
              {/* <ComplianceObligationReductionOffsetTable
                statuses={statuses}
                offsetNumbers={offsetNumbers}
                // unspecifiedCreditReduction={unspecifiedCreditReduction}
                supplierClassInfo={}
                // handleOffsetChange={handleOffsetChange}
                user={user}
                zevClassAReduction={zevClassAReduction}
                unspecifiedReductions={unspecifiedReductions}
                leftoverReduction={leftoverReduction}
                totalReduction={totalReduction}
                reportYear={modelYear}
                creditBalance={creditBalance}
              /> */}
            </div>
            <div className="my-3 grey-border-area">
              <table>
                <tbody>
                  <tr className="subclass">
                    <th className="large-column">
                      ASSESSED BALANCE AT END OF SEPT. 30, {modelYear + 1}
                    </th>
                    <th className="small-column text-center text-blue">
                      A
                    </th>
                    <th className="small-column text-center text-blue">
                      B
                    </th>
                  </tr>
                  <tr key="start">
                    <td className="text-blue">&bull; &nbsp; &nbsp; {modelYear} Credits:</td>
                    <td className="text-right">
                      977.76
                    </td>
                    <td className="text-right">
                      0
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {!user.isGovernment && details.assessment.decision
        && (
          <>
            <h3 className="mt-4 mb-1">Director Assessment</h3>
            <div className="row mb-3">
              <div className="col-12">
                <div className="grey-border-area comment-box p-4 mt-2">
                  <div className="text-blue">
                    {details.assessment && (<div>The Director has assessed that {details.assessment.decision.replace(/{user.organization.name}/g, user.organization.name)} ${details.assessment.penalty} CAD</div>)}
                    {details.bceidComment
                    && <div className="mt-2">{parse(details.bceidComment.comment)}</div>}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      {user.isGovernment
          && (
            <>
              <h3 className="mt-4 mb-1">Analyst Recommended Director Assessment</h3>
              <div className="row mb-3">
                <div className="col-12">
                  <div className="grey-border-area comment-box p-4 mt-2">
                    <div>
                      {radioDescriptions.map((each) => (
                        (each.displayOrder === 0)
                && showDescription(each)
                      ))}
                      <div className="text-blue mt-3 ml-3 mb-1">
                        &nbsp;&nbsp; {details.organization.name} has not complied with section 10 (2) of the
                        Zero-Emission Vehicles Act for the {modelYear} adjustment period.
                      </div>
                      {radioDescriptions.map((each) => (
                        (each.displayOrder > 0)
               && showDescription(each)
                      ))}
                      <label className="d-inline" htmlFor="penalty-radio">
                        <div>
                          <input
                            disabled={directorAction || ['RECOMMENDED', 'ASSESSED'].indexOf(details.assessment.validationStatus) >= 0}
                            type="text"
                            className="ml-4 mr-1"
                            value={details.assessment.penalty}
                            name="penalty-amount"
                          />
                          <label className="text-grey" htmlFor="penalty-amount">$5,000 CAD x ZEV unit deficit</label>
                        </div>
                      </label>
                      <CommentInput
                        defaultComment={details.bceidComment}
                        handleAddComment={handleAddBceidComment}
                        handleCommentChange={handleCommentChangeBceid}
                        title="Assessment Message to the Supplier: "
                        buttonText="Add/Update Message"
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
            {directorAction
          && (
          <>
            <span className="left-content">
              <button
                className="button text-danger"
                onClick={() => {
                  handleSubmit('SUBMITTED');
                }}
                type="button"
              >
                Return to Analyst
              </button>
            </span>

            <span className="right-content">
              <Button
                buttonType="submit"
                optionalClassname="button primary"
                optionalText="Issue Assessment"
                action={() => {
                  handleSubmit('ASSESSED');
                }}
              />
            </span>
          </>
          )}
            {analystAction
            && (
            <span className="right-content">
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
            </span>
            )}
          </div>
        </div>
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
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
  modelYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
  sales: PropTypes.number,
  handleSubmit: PropTypes.func.isRequired,
};
export default AssessmentDetailsPage;
