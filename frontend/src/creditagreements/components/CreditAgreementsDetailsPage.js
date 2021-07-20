import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import Button from '../../app/components/Button';
import CreditAgreementsAlert from './CreditAgreementsAlert';
import CreditAgreementsDetailsTable from './CreditAgreementsDetailsTable';
import DisplayComment from '../../app/components/DisplayComment';
import CommentInput from '../../app/components/CommentInput';

const CreditAgreementsDetailsPage = (props) => {
  const {
    user,
    items,
    handleAddIdirComment,
    handleCommentChangeIdir,
    analystAction,
    details,
    handleDelete,
  } = props;
console.log(details)
  return (
    <div id="credit-agreements-detail-page" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Initiative Agreement</h2>
        </div>
        <div className="credit-agreements-alert col-sm-12 mt-2">
          <CreditAgreementsAlert
            isGovernment={user.isGovernment}
            date={moment(details.updateTimestamp).format('MMM D, YYYY')}
            status={details.status}
            user={user.username}
          />
        </div>
      </div>
      {user && user.isGovernment && (
        <div className="row mt-3 mb-2">
          <div className="col-sm-12">
            <div
              className="grey-border-area p-3 comment-box mt-2"
              id="comment-input"
            >
              {details
                && details.filteredIdirComments
                && details.filteredIdirComments.length > 0 && (
                  <DisplayComment commentArray={details.filteredIdirComments} />
              )}
              <div>
                <CommentInput
                  handleAddComment={handleAddIdirComment}
                  handleCommentChange={handleCommentChangeIdir}
                  title={
                    analystAction
                      ? 'Add comment to director: '
                      : 'Add comment to the analyst'
                  }
                  buttonText="Add Comment"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="credit-agreements-details grey-border-area">
        {user && user.isGovernment && (
          <div className="row">
            <span className="col-3">
              <h4 className="d-inline">Supplier: </h4>
            </span>
            <span className="col-5">{details.organization.name}</span>
          </div>
        )}
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Agreement ID: </h4>
          </span>
          <span className="col-5">
            {details.optionalAgreementId ? details.optionalAgreementId : 'N/A'}
          </span>
        </div>
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Transaction Date: </h4>
          </span>
          <span className="col-5">{details.effectiveDate}</span>
        </div>
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Agreement Attachment: </h4>
          </span>
          <div className="col-5 filename">
            {details.attachments && details.attachments.length > 0
              ? details.attachments.map((attachment) => (
                <div className="row" key={attachment.id}>
                  <div className="col-9 file">
                    <button
                      className="link"
                      onClick={() => {
                        axios
                          .get(attachment.url, {
                            responseType: 'blob',
                            headers: {
                              Authorization: null,
                            },
                          })
                          .then((response) => {
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
              : ' - '}
          </div>
        </div>

        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Message from the Director: </h4>
          </span>
          <span className="col-5">
            {details
            && details.filteredBceidComments
            && details.filteredBceidComments.length > 0
              ? parse(details.filteredBceidComments[0].comment)
              : 'no comment'}
          </span>
        </div>
        <div className="row mt-2">
          <span className="col-3" />
          <span className="col-5">
            {details && details.creditAgreementContent
              && details.creditAgreementContent.length > 0 && (
                <CreditAgreementsDetailsTable items={details.creditAgreementContent} />
            )}
          </span>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            {analystAction && (
              <>
                <span className="left-content">
                  {details.status === 'DRAFT'
                  && (
                  <Button
                    buttonType="delete"
                    optionalText="Delete"
                    action={() => { handleDelete(); }}
                  />
                  )}
                </span>
                <span className="right-content">
                  <Button
                    buttonType="edit"
                    optionalText="Edit"
                    action={() => {}}
                  />
                  <Button
                    buttonType="submit"
                    optionalClassname="button primary"
                    optionalText="Submit to Director"
                    action={() => {}}
                  />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CreditAgreementsDetailsPage.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  details: PropTypes.shape({}).isRequired,
  analystAction: PropTypes.bool.isRequired,
  handleAddIdirComment: PropTypes.func.isRequired,
  handleCommentChangeIdir: PropTypes.func.isRequired,
};

export default CreditAgreementsDetailsPage;
