import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';
import Alert from '../../app/components/Alert';
import formatNumeric from '../../app/utilities/formatNumeric';
import DisplayComment from '../../app/components/DisplayComment';
import CommentInput from '../../app/components/CommentInput';
import FileDropArea from '../../app/components/FileDropArea';

const CreditAgreementsForm = (props) => {
  const {
    user,
    id,
    agreementDetails,
    bceidComment,
    setBciedComment,
    idirComment,
    setIdirComment,
    analystAction,
    handleCommentChangeIdir,
    handleAddIdirComment,
    files,
    setUploadFiles,
    errorMessage,
    setErrorMessage,
    upload,
    handleCommentChangeBceid,
    handleSubmit,
  } = props;
  return (
    <div id="credit-agreements-form" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Credit Agreements &amp; Adjustments</h2>
        </div>
      </div>
      {user.isGovernment
          && (
          <div>
            <div className="grey-border-area p-3 comment-box mt-2" id="comment-input">
              {agreementDetails.idirComment && agreementDetails.idirComment.length > 0 && (
              <DisplayComment
                commentArray={agreementDetails.idirComment}
              />
              )}
              <div>
                <CommentInput
                  handleAddComment={handleAddIdirComment}
                  handleCommentChange={handleCommentChangeIdir}
                  title={analystAction ? 'Add comment to director: ' : 'Add comment to the analyst'}
                  buttonText="Add Comment"
                />
              </div>
            </div>
            <div className="col-12">
              <FileDropArea
                wholePageWidth
                type="pdf"
                errorMessage={errorMessage}
                files={files}
                setErrorMessage={setErrorMessage}
                setUploadFiles={setUploadFiles}
              />
            </div>
            <div className="action-bar">
              <span className="left-content" />
              <span className="right-content">
                <button
                  disabled={files.length === 0}
                  className="button primary"
                  onClick={() => upload()}
                  type="button"
                >
                  <FontAwesomeIcon icon="upload" /> Upload
                </button>
              </span>
            </div>
            <div id="comment-input">
              <CommentInput
                defaultComment={agreementDetails.bceidComment}
                handleCommentChange={handleCommentChangeBceid}
                title="Message to the Supplier: "
              />
            </div>
          </div>

          )}
      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            {/* {directorAction && (
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
            )} */}
            {analystAction && (
            <>
              <span className="left-content" />
              <span className="right-content">
                <Button
                  buttonType="submit"
                  optionalClassname="button primary"
                  optionalText="Submit to Director"
                  action={() => {
                    handleSubmit('');
                  }}
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

export default CreditAgreementsForm;
