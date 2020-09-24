import axios from 'axios';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

import Modal from '../../app/components/Modal';
import Loading from '../../app/components/Loading';
import DetailField from '../../app/components/DetailField';
import history from '../../app/History';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';
import getFileSize from '../../app/utilities/getFileSize';
import CustomPropTypes from '../../app/utilities/props';

const VehicleDetailsPage = (props) => {
  const {
    comments,
    details,
    loading,
    postComment,
    requestStateChange,
    setComments,
    title,
    user,
    locationState,
  } = props;
  const [requestChangeCheck, setRequestChangeCheck] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  if (loading) {
    return <Loading />;
  }

  const { id } = details;
  const handleChange = (event) => {
    setComments({ ...comments, vehicleComment: { comment: event.target.value } });
  };

  const handleCheckboxClick = (event) => {
    const { checked } = event.target;
    if (checked) {
      setRequestChangeCheck(true);
    } else {
      setRequestChangeCheck(false);
    }
  };

  let confirmLabel;
  let handleSubmit = () => {};
  let buttonClass;
  let modalText;

  if (modalType === 'accept') {
    confirmLabel = 'Validate';
    handleSubmit = () => { requestStateChange('VALIDATED'); };
    buttonClass = 'button primary';
    modalText = 'Validate ZEV model';
  } else if (modalType === 'reject') {
    confirmLabel = 'Reject';
    handleSubmit = () => { postComment('REJECTED'); };
    buttonClass = 'btn-outline-danger';
    modalText = 'Reject ZEV model';
  } else {
    confirmLabel = 'Request';
    handleSubmit = () => { postComment('CHANGES_REQUESTED'); };
    buttonClass = 'button primary';
    modalText = 'Request range change/test results';
  }

  return (
    <div id="vehicle-validation" className="page">
      <div className="row mb-2">
        <div className="col-sm-12">
          <h2>{title}</h2>
        </div>
      </div>

      <div className="row align-items-center">
        <div className="col-md-12 col-lg-9 col-xl-7">
          <div className="form p-4">
            {user.isGovernment && (
              <DetailField label="Supplier" value={details.organization.shortName || details.organization.name} />
            )}
            <DetailField label="Model Year" value={details.modelYear.name} />
            <DetailField label="Make" value={details.make} />
            <DetailField label="Model" value={details.modelName} />
            <DetailField label="ZEV Type" value={details.vehicleZevType.description} />
            {['EREV', 'PHEV'].indexOf(details.vehicleZevType.vehicleZevCode) >= 0 && (
              <DetailField label="Passed US06 Test" value={details.hasPassedUs06Test ? 'Yes' : 'No'} />
            )}
            <DetailField label="Electric Range (km)" value={details.range} />
            <DetailField label="Body Type" value={details.vehicleClassCode.description} />
            <DetailField label="Weight (kg)" value={details.weightKg} />
            <DetailField label="Vehicle Class" id={details.weightKg < 3856 ? '' : 'danger-text'} value={details.weightKg < 3856 ? 'LDV (calculated)' : 'Not within LDV range (calculated)'} />
            {details.creditClass && (
              <DetailField label="Credit Class" value={` ${details.creditClass} (calculated)`} />
            )}
            {details.creditValue && (
              <DetailField label="Credits" value={` ${details.creditValue} (calculated)`} />
            )}

            {details.attachments.length > 0 && (
              <div className="attachments mt-4">
                <div className="font-weight-bold label">Range Test Results</div>
                <div className="row">
                  <div className="col-9 filename header pl-4">Filename</div>
                  <div className="col-3 size header">Size</div>
                </div>

                {details.attachments.map((attachment) => (
                  <div className="row" key={attachment.id}>
                    <div className="col-9 filename pl-4">
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
                    <div className="col-3 size">{getFileSize(attachment.size)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {details.validationStatus === 'SUBMITTED' && user.isGovernment && (
      <div className="row">
        <div className="col-md-12 col-lg-9 col-xl-7 pt-4 pb-2">
          <div className="form">
            <div className="request-changes-check">
              <input type="checkbox" onChange={handleCheckboxClick} />
              Request range results and/or a change to the range value from the vehicle supplier, specify below.
            </div>
            <div>Add a comment to the vehicle supplier for request or rejection.</div>
            <textarea className="form-control" rows="3" onChange={handleChange} />
            <div className="text-right">
              <button className="button primary" disabled={!requestChangeCheck || !comments.vehicleComment} type="button" key="REQUEST" onClick={() => { setModalType('request'); setShowModal(true); }}>Request Range Change/Test Results</button>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  history.push(ROUTES_VEHICLES.LIST, locationState);
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> Back
              </button>
            </span>
            <span className="right-content">
              {['DRAFT', 'CHANGES_REQUESTED'].indexOf(details.validationStatus) >= 0
              && !user.isGovernment && (
                <button
                  className="button primary"
                  onClick={() => {
                    history.push(ROUTES_VEHICLES.EDIT.replace(/:id/gi, id));
                  }}
                  type="button"
                >
                  <FontAwesomeIcon icon="edit" /> Edit
                </button>
              )}
              {details.validationStatus === 'SUBMITTED'
              && user.isGovernment
              && ([
                <button
                  className="btn btn-outline-danger"
                  disabled={!comments.vehicleComment.comment || requestChangeCheck}
                  type="button"
                  key="REJECTED"
                  onClick={() => {
                    setModalType('reject');
                    setShowModal(true);
                  }}
                >Reject
                </button>,
                <button
                  className="button primary"
                  disabled={comments.vehicleComment.comment || requestChangeCheck}
                  type="button"
                  key="VALIDATED"
                  onClick={() => {
                    setModalType('accept');
                    setShowModal(true);
                  }}
                >Validate
                </button>,
              ])}
            </span>
          </div>

          <Modal
            confirmLabel={confirmLabel}
            handleCancel={() => { setShowModal(false); }}
            handleSubmit={handleSubmit}
            modalClass="w-75"
            showModal={showModal}
            confirmClass={buttonClass}
          >
            <div>
              <div><br /><br /></div>
              <h4 className="d-inline">{modalText}
              </h4>
              <div><br /><br /></div>
            </div>
          </Modal>
        </div>
      </div>
    </div>

  );
};

VehicleDetailsPage.defaultProps = {
  comments: undefined,
  postComment: undefined,
  setComments: undefined,
  title: 'Vehicle Details',
  locationState: undefined,
};

VehicleDetailsPage.propTypes = {
  comments: PropTypes.shape({
    vehicleComment: PropTypes.shape({
      comment: PropTypes.string.isRequired,
    }),
  }),
  details: PropTypes.shape({
    actions: PropTypes.arrayOf(PropTypes.string),
    attachments: PropTypes.arrayOf(PropTypes.shape()),
    creditClass: PropTypes.string,
    creditValue: PropTypes.number,
    hasPassedUs06Test: PropTypes.bool,
    history: PropTypes.arrayOf(PropTypes.object),
    id: PropTypes.any,
    make: PropTypes.string,
    modelName: PropTypes.string,
    modelYear: PropTypes.shape({
      name: PropTypes.string,
    }),
    organization: PropTypes.shape(),
    range: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    validationStatus: PropTypes.string,
    vehicleClassCode: PropTypes.shape({
      description: PropTypes.string,
    }),
    vehicleZevType: PropTypes.shape({
      description: PropTypes.string,
      vehicleZevCode: PropTypes.string,
    }),
    weightKg: PropTypes.string,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  postComment: PropTypes.func,
  requestStateChange: PropTypes.func.isRequired,
  setComments: PropTypes.func,
  title: PropTypes.string,
  user: CustomPropTypes.user.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
};

export default VehicleDetailsPage;
