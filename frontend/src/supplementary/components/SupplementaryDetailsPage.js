import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Loading from '../../app/components/Loading';
import SupplementaryAlert from './SupplementaryAlert';
import Button from '../../app/components/Button';
import ZevSales from './ZevSales';
import SupplierInformation from './SupplierInformation';
import CreditActivity from './CreditActivity';
import UploadEvidence from './UploadEvidence';
import CommentInput from '../../app/components/CommentInput';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import DisplayComment from '../../app/components/DisplayComment';
import parse from 'html-react-parser';
import Comment from '../../app/components/Comment';

const SupplementaryDetailsPage = (props) => {
  const {
    addSalesRow,
    checkboxConfirmed,
    commentArray,
    deleteFiles,
    analystAction,
    directorAction,
    details,
    files,
    handleCheckboxClick,
    handleCommentChange,
    handleAddIdirComment,
    handleCommentChangeIdir,
    handleCommentChangeBceid,
    handleInputChange,
    handleSubmit,
    handleSupplementalChange,
    id,
    ldvSales,
    loading,
    newBalances,
    newData,
    obligationDetails,
    ratios,
    salesRows,
    setDeleteFiles,
    setUploadFiles,
    user,
    radioDescriptions,
    isReassessment,
    supplementaryAssessmentData,
    setSupplementaryAssessmentData
  } = props;
  if (loading) {
    return <Loading />;
  }
  const reportYear = details.assessmentData && details.assessmentData.modelYear;
  const supplierClass = details.assessmentData && details.assessmentData.supplierClass[0];
  const creditReductionSelection = details.assessmentData && details.assessmentData.creditReductionSelection;
  const newLdvSales = newData && newData.supplierInfo && newData.supplierInfo.ldvSales;

  const assessmentDecision = supplementaryAssessmentData.supplementaryAssessment.decision && supplementaryAssessmentData.supplementaryAssessment.decision.description ? supplementaryAssessmentData.supplementaryAssessment.decision.description.replace(/{user.organization.name}/g, details.assessmentData.legalName).replace(/{modelYear}/g, details.assessmentData.modelYear) : '';
  const showDescription = (each) => (
    <div className="mb-3" key={each.id}>
      <input
        // defaultChecked={details.assessment.decision.description === each.description}
        className="mr-3"
        type="radio"
        name="assessment"
        disabled={!analystAction || ['RECOMMENDED', 'ASSESSED'].indexOf(details.status) >= 0}
        onChange={() => {
          setSupplementaryAssessmentData({
            ...supplementaryAssessmentData,
            supplementaryAssessment: {
              ...supplementaryAssessmentData.supplementaryAssessment,
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
          .replace(/{user.organization.name}/g, details.assessmentData.legalName)
          .replace(/{modelYear}/g, details.assessmentData.modelYear)}
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

  return (
    <div id="supplementary" className="page">
      <div className="row mt-3">
        <div className="col">
          <h2 className="mb-2">{isReassessment ? `${reportYear} Model Year Report Reassessment` : `${reportYear} Model Year Supplementary Report`}</h2>
        </div>
      </div>
      <div className="supplementary-form">
        <div className="supplementary-alert mt-2">
          <SupplementaryAlert
            id={id}
            date={moment(details.updateTimestamp).format('MMM D, YYYY')}
            status={details.status}
            user={user.username}
          />
        </div>
        <div className="report-assessment-history">
          <h3 className="mb-2">Model Year Report Assessment History</h3>
          <div className="grey-border-area">
            <ul>
              <li><u>Notice of Assessment Oct. 11, 2021</u></li>
            </ul>
          </div>
        </div>
        {(isReassessment || (analystAction || directorAction))
        && (
        <div className="supplementary-form my-3">
          {commentArray && commentArray.idirComment && commentArray.idirComment.length > 0
         && (
         <DisplayComment
           commentArray={commentArray.idirComment}
         />
         )}
          <div id="comment-input">
            <CommentInput
              handleCommentChange={handleCommentChangeIdir}
              title={analystAction ? 'Add comment to director: ' : 'Add comment to the analyst'}
              buttonText="Add Comment"
              handleAddComment={handleAddIdirComment}
              buttonDisable={!details.id}
            />
          </div>
        </div>
        )}
      </div>
      <div className="supplementary-form mt-2">
        <div className="mb-3">
          <SupplierInformation
            user={user}
            details={details}
            handleInputChange={handleInputChange}
            loading={loading}
            newData={newData}
          />
          <ZevSales
            addSalesRow={addSalesRow}
            details={details}
            handleInputChange={handleInputChange}
            salesRows={salesRows}
          />
          <CreditActivity
            creditReductionSelection={creditReductionSelection}
            details={details}
            handleInputChange={handleInputChange}
            handleSupplementalChange={handleSupplementalChange}
            ldvSales={ldvSales}
            newBalances={newBalances}
            newData={newData}
            newLdvSales={newLdvSales}
            obligationDetails={obligationDetails}
            ratios={ratios}
            supplierClass={supplierClass}
          />
        </div>
        <div id="comment-input">
          {!user.isGovernment && details.status === 'DRAFT' && (
          <CommentInput
            defaultComment={details && details.comments && details.comments.length > 0 ? details.comments[0] : ''}
            handleCommentChange={handleCommentChange}
            title="Provide details in the comment box below for any changes above."
          />
          )}
        </div>
        {!user.isGovernment && details.status === 'DRAFT' && (
        <UploadEvidence
          details={details}
          deleteFiles={deleteFiles}
          files={files}
          setDeleteFiles={setDeleteFiles}
          setUploadFiles={setUploadFiles}
        />)}
        {user.isGovernment && details.status === 'SUBMITTED' 
        && 
        <div className="display-supplier-info grey-border-area mt-3">
         {details && details.fromSupplierComments && details.fromSupplierComments.length > 0 
         && <div className="supplier-comment">
              <h4>Supplier Comments</h4>
              <span className="text-blue">{parse(details.fromSupplierComments[0].comment)}</span>
            </div>
         }
         {details && details.attachments && <div className="supplier-attachment mt-2">
           <h4>Supplementary Report Attachemnts</h4>
           {details.attachments.filter((attachment) => (
             deleteFiles.indexOf(attachment.id) < 0
             )).map((attachment) => (
             <div className="row" key={attachment.id}>
              <div className="col-8 filename">
                <button
                  className="link"
                  onClick={() => {
                    axios.get(attachment.url, {
                      responseType: 'blob',
                      headers: {
                        Authorization: null,
                      },
                    }).then((response) => {
                      const objectURL = window.URL.createObjectURL(
                        new Blob([response.data]),
                      );
                      const link = document.createElement('a');
                      link.href = objectURL;
                      link.setAttribute('download', attachment.filename);
                      document.body.appendChild(link);
                      link.click();
                    });
                  }}
                  type="button"
                >
                  {attachment.filename}
                </button>
              </div>
              </div>
              ))
           } 
         </div>
        }
        </div>
        }
      </div>
      {(supplementaryAssessmentData.supplementaryAssessment && supplementaryAssessmentData.supplementaryAssessment.decision
        && supplementaryAssessmentData.supplementaryAssessment.decision.description)
        && (!user.isGovernment || (user.isGovernment && ['ASSESSED', 'RECOMMENDED'].indexOf(details.status) >= 0)) && (
          <>
            <h3 className="mt-4 mb-1">Director Reassessment</h3>
            <div className="row mb-3">
              <div className="col-12">
                <div className="grey-border-area comment-box p-3 mt-2">
                  <div className="text-blue">
                    <div>The Director has assessed that {assessmentDecision} {supplementaryAssessmentData.supplementaryAssessment.assessmentPenalty
                    && `$${supplementaryAssessmentData.supplementaryAssessment.assessmentPenalty} CAD`}
                    </div>
                    {commentArray.bceidComment && commentArray.bceidComment.comment
                    && <div className="mt-2">{parse(commentArray.bceidComment.comment)}</div>}
                  </div>
                </div>
              </div>
            </div>
          </>
      )}
      {(analystAction || directorAction) && ['ASSESSED'].indexOf(details.status) < 0
      && (
        <>
          {['RECOMMENDED'].indexOf(details.status) < 0 && (
          <h3 className="mt-4 mb-1">Analyst Recommended Director Assessment</h3>
          )}
          <div className="row mb-3">
            <div className="col-12">
              <div className="grey-border-area  p-3 mt-2">
                <div>
                  {['RECOMMENDED'].indexOf(details.status) < 0 && (
                  <>
                    {radioDescriptions.map((each) => (
                      (each.displayOrder === 0) && showDescription(each)
                    ))}
                    <div className="text-blue mt-3 ml-3 mb-1">
                      &nbsp;&nbsp; {details.assessmentData.legalName} has not complied with section 10 (2) of the
                      Zero-Emission Vehicles Act for the {details.assessmentData.modelYear} adjustment period.
                    </div>
                    {radioDescriptions.map((each) => (
                      (each.displayOrder > 0) && showDescription(each)
                    ))}
                    <label className="d-inline" htmlFor="penalty-radio">
                      <div>
                        <input
                          disabled={directorAction
                          || assessmentDecision.indexOf('Section 10 (3) applies') < 0
                          }
                          type="text"
                          className="ml-4 mr-1"
                          defaultValue={supplementaryAssessmentData.supplementaryAssessment.assessmentPenalty}
                          name="penalty-amount"
                          onChange={(e) => {
                            setSupplementaryAssessmentData({
                              ...supplementaryAssessmentData,
                              supplementaryAssessment: {
                                ...supplementaryAssessmentData.supplementaryAssessment,
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
                   {(analystAction || directorAction) && <div id="comment-input">
                    <CommentInput
                      //disable={details.assessment.validationStatus === 'ASSESSED'}
                      defaultComment={commentArray && commentArray.bceidComment ? commentArray.bceidComment: ''}
                      //handleAddComment={handleAddBceidComment}
                      handleCommentChange={handleCommentChangeBceid}
                      title="Assessment Message to the Supplier: "
                    />
                    </div>
                   } 
                </div>
            </div>
          </div>
          </div>
          </>
      )}
      {!user.isGovernment && user.hasPermission('SUBMIT_COMPLIANCE_REPORT') && details.status === 'DRAFT'
              && (
              <div className="mt-3">
                <input
                  defaultChecked={checkboxConfirmed}
                  className="mr-2"
                  id="supplier-confirm-checkbox"
                  name="confirmations"
                  onChange={(event) => { handleCheckboxClick(event); }}
                  type="checkbox"
                />
                <label htmlFor="supplier-confirm-checkbox">
                  On behalf of {details.assessmentData.legalName} I confirm the information included in the this Model Year Report is complete and correct.
                </label>
              </div>
              )}
      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(/:id/g, id)}
              />
              {details.status === 'DRAFT'
              && (
              <Button
                buttonType="delete"
                action={() => handleSubmit('DELETED')}
              />
              )}
              {user.isGovernment && (details.status === 'SUBMITTED' || details.status === 'RECOMMENDED')
                && (
                <button
                  className="button text-danger"
                  onClick={() => {
                    handleSubmit('RETURNED');
                  }}
                  type="button"
                >
                  {details.status === 'SUBMITTED' ? 'Return to Vehicle Supplier' : 'Return to Analyst'}
                </button>
                )}
            </span>
            <span className="right-content">
              {/* {((details.status === 'SUBMITTED' && user.isGovernment) || (details.status === 'DRAFT')) && ( */}
                <Button
                  buttonType="save"
                  action={() => handleSubmit('')}
                />
              {/* )} */}
              {analystAction && (details.status !== 'RECOMMENDED' || details.status === 'RETURNED') && (
                  <Button
                    buttonTooltip={recommendTooltip}
                    buttonType="submit"
                    optionalClassname="button primary"
                    optionalText="Recommend Reassessment"
                    disabled={disabledRecommendBtn}
                    action={() => {
                      handleSubmit('RECOMMENDED');
                    }}
                  />
              )}
               {directorAction && details.status === 'RECOMMENDED' && (
                <Button
                  buttonType="submit"
                  optionalClassname="button primary"
                  optionalText="Issue Assessment"
                  action={() => {
                    console.log("ASSESSED")
                  }}
                />
              )}
              {!user.isGovernment && details.status === 'DRAFT' && user.hasPermission('SUBMIT_COMPLIANCE_REPORT')
              && (
              <Button
                disabled={!checkboxConfirmed}
                buttonType="submit"
                action={() => handleSubmit('SUBMITTED')}
              />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

SupplementaryDetailsPage.propTypes = {};

export default SupplementaryDetailsPage;
