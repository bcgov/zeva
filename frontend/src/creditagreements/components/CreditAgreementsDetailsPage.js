import React from 'react';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
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
    details
  } = props;

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
      {user.isGovernment && (<div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <div className="grey-border-area p-3 comment-box mt-2" id="comment-input">
            {details.comments && details.comments.length > 0 && (
              <DisplayComment commentArray={[details.comments]} />
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
      </div>)}
      <div className="credit-agreements-details grey-border-area">
        {user.isGovernment && (<div className="row">
          <span className="col-3">
            <h4 className="d-inline">Supplier: </h4>
          </span>
          <span className="col-5">{details.organization.name}</span>
        </div>)}
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Agreement ID: </h4>
          </span>
          <span className="col-5">{details.optionalAgreementId}</span>
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
          <span className="col-5">20200630-IA-KIA.pdf</span>
        </div>
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Message from the Director: </h4>
          </span>
          <span className="col-5">no comment</span>
        </div>
        <div className="row mt-2">
          <span className="col-3"></span>
          <span className="col-5">
            <CreditAgreementsDetailsTable items={items} />
          </span>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            {analystAction && (
              <>
                <span className="left-content">
                  <Button
                    buttonType="delete"
                    optionalText="Delete"
                    action={() => {}}
                  />
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
};

export default CreditAgreementsDetailsPage;
