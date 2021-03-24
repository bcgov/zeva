import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser';
import ReactQuill from 'react-quill';
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import moment from 'moment-timezone';
import 'react-quill/dist/quill.snow.css';
import _ from 'lodash';

import CreditRequestAlert from './CreditRequestAlert';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';
import history from '../../app/History';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';
import download from '../../app/utilities/download';
import CustomPropTypes from '../../app/utilities/props';
import ModelListTable from './ModelListTable';
import CreditRequestSummaryTable from './CreditRequestSummaryTable';
import getFileSize from '../../app/utilities/getFileSize';
import DisplayComment from '../../app/components/DisplayComment';
import formatNumeric from '../../app/utilities/formatNumeric';

const CreditRequestDetailsPage = (props) => {
  const {
    handleSubmit,
    locationState,
    submission,
    uploadDate,
    user,
  } = props;
  const { id } = useParams();
  const validatedOnly = submission.validationStatus === 'CHECKED';
  const [showModal, setShowModal] = useState(false);
  const [showReverifyModal, setShowReverifyModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [comment, setComment] = useState('');

  const serviceAddress = submission.organization.organizationAddress.find(
    (address) => address.addressType.addressType === 'Service',
  );
  const recordsAddress = submission.organization.organizationAddress.find(
    (address) => address.addressType.addressType === 'Records',
  );

  const downloadErrors = (e) => {
    const element = e.currentTarget;
    const original = element.innerHTML;

    element.innerText = 'Downloading...';
    element.disabled = true;

    return download(ROUTES_CREDIT_REQUESTS.DOWNLOAD_ERRORS.replace(':id', submission.id), {}).then(() => {
      element.innerHTML = original;
      element.disabled = false;
    });
  };

  let modalProps = {};

  const modules = {
    toolbar: [
      ['bold', 'italic'],
      [{ list: 'bullet' }, { list: 'ordered' }],
    ],
  };
  const formats = ['bold', 'italic', 'list', 'bullet'];

  const handleCommentChange = (content) => {
    setComment(content);
  };

  const handleAddComment = () => {
    const submissionContent = {};
    if (comment.length > 0) {
      submissionContent.salesSubmissionComment = { comment };
    }
    axios.patch(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id), submissionContent).then(() => {
      history.push(ROUTES_CREDIT_REQUESTS.EDIT.replace(':id', id));
      const refreshed = true;
      if (refreshed) {
        history.push(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id));
      }
    });
  };

  switch (modalType) {
    case 'submit':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => { handleSubmit('SUBMITTED'); },
        buttonClass: 'button primary',
        modalText: 'Submit credit request to Government of B.C.?',
        icon: <FontAwesomeIcon icon="paper-plane" />,
      };
      break;
    case 'delete':
      modalProps = {
        confirmLabel: ' Delete',
        handleSubmit: () => { handleSubmit('DELETED'); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Delete submission? WARNING: this action cannot be undone',
        icon: <FontAwesomeIcon icon="trash" />,
      };
      break;
    case 'approve':
      modalProps = {
        confirmLabel: 'Recommend Issuance',
        handleSubmit: () => { handleSubmit('RECOMMEND_APPROVAL'); },
        buttonClass: 'button primary',
        modalText: 'Recommend issuance of credits?',
      };
      break;
    case 'return':
      modalProps = {
        confirmLabel: 'Return to Analyst',
        handleSubmit: () => { handleSubmit('CHECKED'); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Return submission to analyst?',
      };
      break;
    default:
      modalProps = {
        confirmLabel: 'Issue Credits',
        buttonClass: 'button primary',
        modalText: 'Issue credits to vehicle supplier?',
        handleSubmit: () => { handleSubmit('VALIDATED', ''); },
      };
  }

  const modal = (
    <Modal
      confirmLabel={modalProps.confirmLabel}
      handleCancel={() => { setShowModal(false); }}
      handleSubmit={modalProps.handleSubmit}
      modalClass="w-75"
      showModal={showModal}
      confirmClass={modalProps.buttonClass}
    >
      <div>
        <div><br /><br /></div>
        <h3 className="d-inline">{modalProps.modalText}
        </h3>
        <div><br />{comment && (
          <p>Comment: {parse(comment)}</p>
        )}<br />
        </div>
      </div>
    </Modal>
  );

  const reverifyModal = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        const url = ROUTES_CREDIT_REQUESTS.VALIDATE.replace(/:id/g, submission.id);

        history.push(url);
      }}
      handleSubmit={() => {
        let url = ROUTES_CREDIT_REQUESTS.VALIDATE.replace(/:id/g, submission.id);
        url += '?reset=Y';
        history.push(url);
      }}
      modalClass="w-75"
      showModal={showReverifyModal}
      confirmClass={modalProps.buttonClass}
    >
      <div>
        <h3>ICBC data has been updated since the application was verified.</h3>
        <h3 className="mt-3">
          Would you like to reset the current validated VINs and re-verify with the new data?
        </h3>
      </div>
    </Modal>
  );

  const invalidSubmission = submission.content.some((row) => (!row.vehicle || !row.vehicle.id || row.vehicle.modelName === ''));
  const directorAction = user.isGovernment
    && ['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION'].indexOf(submission.validationStatus) >= 0
    && user.hasPermission('SIGN_SALES');
  const analystAction = user.isGovernment
    && ['CHECKED', 'SUBMITTED'].indexOf(submission.validationStatus) >= 0
    && user.hasPermission('RECOMMEND_SALES');
  return (
    <div id="credit-request-details" className="page">
      {modal}
      {reverifyModal}
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Application for Credits for Consumer Sales</h2>
        </div>
      </div>
      {analystAction && submission.icbcCurrentTo && (
        <div className="row my-1">
          <div className="col-sm-12">
            ICBC data current to:{' '}
            {moment(submission.icbcCurrentTo).format('MMM D, YYYY')}
          </div>
        </div>
      )}
      {submission && submission.history.length > 0 && (
        <div className="row mb-1">
          <div className="col-sm-12">
            <div className="m-0">
              <CreditRequestAlert
                isGovernment={user.isGovernment}
                submission={submission}
                date={moment(submission.updateTimestamp).format('MMM D, YYYY')}
                icbcDate={submission.icbcCurrentTo ? moment(submission.icbcCurrentTo).format('MMM D, YYYY') : ''}
                invalidSubmission={invalidSubmission}
              />
              {user.isGovernment && ((submission.salesSubmissionComment) || ((analystAction && validatedOnly) || directorAction) || submission.validationStatus === 'ISSUED') && (
                <div className="comment-box mt-2">
                  {submission.salesSubmissionComment && user.isGovernment && (
                    <DisplayComment commentArray={submission.salesSubmissionComment} />
                  )}
                  {((analystAction && validatedOnly) || directorAction) && (
                  <div className="text-editor mb-2 mt-2">
                    <label htmlFor="comment">
                      <b>{analystAction ? 'Add Comment' : 'Add Comment to analyst if returning submission'}</b>
                    </label>
                    <ReactQuill
                      theme="snow"
                      modules={modules}
                      formats={formats}
                      onChange={handleCommentChange}
                    />
                    <button
                      className="button mt-2"
                      onClick={() => { handleAddComment(); }}
                      type="button"
                    >Add Comment
                    </button>
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!user.isGovernment && (
      <div className="row mb-1">
        <div className="col-sm-12">
          <div className="my-2 px-2 pb-2 address-summary-table">
            <h3 className="mt-2">
              {submission.organization && `${submission.organization.name} `}
            </h3>
            <div>
              <h4 className="d-inline-block sales-upload-grey my-2">Service address: </h4>
              {serviceAddress && <h4 className="d-inline-block sales-upload-blue">{serviceAddress.addressLine1} {serviceAddress.city} {serviceAddress.state} {serviceAddress.postalCode}</h4>}
              <br />
              <h4 className="d-inline-block sales-upload-grey mb-3">Records address: </h4>
              {recordsAddress && <h4 className="d-inline-block sales-upload-blue">{recordsAddress.addressLine1} {recordsAddress.city} {recordsAddress.state} {recordsAddress.postalCode}</h4>}
            </div>

            <CreditRequestSummaryTable
              submission={submission}
              user={user}
              validationStatus={submission.validationStatus}
            />
            {submission.evidence.length > 0 && (
              <div className="mt-4">
                <h3 className="mt-3">Sales Evidence</h3>
                <div id="sales-edit" className="mt-2 col-8 pl-0">
                  <div className="files px-3">
                    <div className="row pb-1">
                      <div className="col-9 header">
                        <h4>Filename</h4>
                      </div>
                      <div className="col-3 size header">
                        <h4>Size</h4>
                      </div>
                      <div className="col-1 actions header" />
                    </div>
                    {submission.evidence.map((file) => (
                      <div className="row py-1" key={file.id}>
                        <div className="col-9 filename pl-1">
                          <button
                            className="link"
                            onClick={() => {
                              axios.get(file.url, {
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
                                link.setAttribute('download', file.filename);
                                document.body.appendChild(link);
                                link.click();
                              });
                            }}
                            type="button"
                          >
                            {file.filename}
                          </button>
                        </div>
                        <div className="col-3 size">
                          {getFileSize(file.size)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      <div className="row mb-2">
        <div className="col-sm-12">
          <ModelListTable
            submission={submission}
            user={user}
          />
        </div>
      </div>

      <div className="row my-4">
        <div className="col-sm-12">
          It is recommended that the Director issue a total of {formatNumeric(_.sumBy(submission.eligible, 'vinCount'), 0)} ZEV credits to{' '}
          {submission.organization.name} based on {formatNumeric(_.sumBy(submission.content, 'sales'), 0)} eligible ZEV sales.
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-1">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={(locationState && locationState.href) ? locationState.href : ROUTES_CREDIT_REQUESTS.LIST}
                locationState={locationState}
              />
              {submission.validationStatus === 'DRAFT'
                && typeof user.hasPermission === 'function'
                && user.hasPermission('EDIT_SALES')
                && (
                  <Button
                    buttonType="delete"
                    action={() => {
                      setModalType('delete');
                      setShowModal(true);
                    }}
                  />
                )}
              {directorAction && (
                <button
                  className="button text-danger"
                  onClick={() => {
                    setModalType('return');
                    setShowModal(true);
                  }}
                  type="button"
                >
                  Return to Analyst
                </button>
              )}
            </span>
            <span className="right-content">
              {analystAction && (
                <>
                  <button
                    className={validatedOnly ? 'button' : 'button primary'}
                    onClick={() => {
                      if (validatedOnly && moment(uploadDate).format('YYYYMMDD') >= moment(submission.updateTimestamp).format('YYYYMMDD')) {
                        setShowReverifyModal(true);
                      } else {
                        const url = ROUTES_CREDIT_REQUESTS.VALIDATE.replace(/:id/g, submission.id);

                        history.push(url);
                      }
                    }}
                    type="button"
                  >
                    {validatedOnly ? 'Re-verify with ICBC Data' : 'Verify with ICBC Data'}
                  </button>
                  {validatedOnly && (
                    <button
                      className={validatedOnly ? 'button primary' : 'button'}
                      key="recommend-approval"
                      onClick={() => {
                        setModalType('approve');
                        setShowModal(true);
                      }}
                      type="button"
                    >
                      Recommend Issuance
                    </button>
                  )}
                </>
              )}
              {directorAction && (
                <button
                  className="button primary"
                  disabled={comment.length > 0}
                  onClick={() => {
                    setModalType('issue');
                    setShowModal(true);
                  }}
                  type="button"
                >
                  Issue Credits
                </button>
              )}

              {!user.isGovernment && (
                <>
                  {submission.validationStatus === 'VALIDATED' && (
                    <Button
                      buttonType="download"
                      optionalText="Download Errors"
                      optionalClassname="button primary"
                      action={(e) => { downloadErrors(e); }}
                      disabled={submission.unselected === 0}
                    />
                  )}
                  {submission.validationStatus === 'DRAFT'
                    && typeof user.hasPermission === 'function'
                    && user.hasPermission('EDIT_SALES')
                    && (
                      <button
                        className="button"
                        key="edit"
                        onClick={() => {
                          const url = ROUTES_CREDIT_REQUESTS.EDIT.replace(/:id/g, submission.id);
                          history.push(url);
                        }}
                        type="button"
                      >
                        <FontAwesomeIcon icon="upload" /> Re-upload files
                      </button>
                    )}
                  {submission.validationStatus === 'DRAFT'
                  && typeof user.hasPermission === 'function'
                  && user.hasPermission('SUBMIT_SALES')
                  && (
                    <Button
                      buttonType="submit"
                      action={() => { setModalType('submit'); setShowModal(true); }}
                      disabled={invalidSubmission}
                      key="submit"
                    />
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

CreditRequestDetailsPage.defaultProps = {
  locationState: undefined,
};

CreditRequestDetailsPage.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  locationState: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape()),
    PropTypes.shape(),
  ]),
  submission: PropTypes.shape().isRequired,
  uploadDate: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditRequestDetailsPage;
