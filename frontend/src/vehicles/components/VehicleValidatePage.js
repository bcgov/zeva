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

const VehicleValidatePage = (props) => {
  const {
    details, loading, requestStateChange, setComments, postComment, comments,
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
  const modal = (
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
  );
  const editButton = (
    <button
      className="button primary"
      onClick={() => {
        history.push(ROUTES_VEHICLES.EDIT.replace(/:id/gi, id));
      }}
      type="button"
    >
      <FontAwesomeIcon icon="edit" /> Edit
    </button>
  );
  return (
    <div id="vehicle-validation" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Validate ZEV</h1>
        </div>
      </div>

      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="form p-4">
            <DetailField label="Model Year" value={details.modelYear.name} />
            <DetailField label="Make" value={details.make} />
            <DetailField label="Model" value={details.modelName} />
            <DetailField label="ZEV Type" value={details.vehicleZevType.description} />
            <DetailField label="Electric Range (km)" value={details.range} />
            <DetailField label="Body Type" value={details.vehicleClassCode.description} />
            <DetailField label="Weight (kg)" value={details.weightKg} />
            <DetailField label="Vehicle Class" id={details.weightKg < 3856 ? '' : 'danger-text'} value={details.weightKg < 3856 ? 'LDV (calculated)' : 'Not within LDV range (calculated)'} />
            <DetailField label="Credit Class" value={` ${details.creditClass} (calculated)`} />
            <DetailField label="Credits" value={` ${details.creditValue} (calculated)`} />

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

      {details.validationStatus === 'SUBMITTED' && (
      <div className="row">
        <div className="col-md-6 pt-4 pb-2">
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
        <div className="col-md-6">
          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  history.goBack();
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> Back
              </button>
            </span>
            <span className="right-content">
              {details.validationStatus === 'DRAFT' ? editButton : '' }
              {details.validationStatus === 'SUBMITTED' && ([
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
          {modal}
        </div>
      </div>
    </div>

  );
};

VehicleValidatePage.defaultProps = {};

VehicleValidatePage.propTypes = {
  details: PropTypes.shape({
    actions: PropTypes.arrayOf(PropTypes.string),
    attachments: PropTypes.arrayOf(PropTypes.shape()),
    creditClass: PropTypes.string,
    creditValue: PropTypes.number,
    history: PropTypes.arrayOf(PropTypes.object),
    id: PropTypes.any,
    make: PropTypes.string,
    modelName: PropTypes.string,
    weightKg: PropTypes.string,
    vehicleClassCode: PropTypes.shape({
      description: PropTypes.string,
    }),
    vehicleZevType: PropTypes.shape({
      description: PropTypes.string,
    }),
    range: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    modelYear: PropTypes.shape({
      name: PropTypes.string,
    }),
    validationStatus: PropTypes.string,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  requestStateChange: PropTypes.func.isRequired,
  setComments: PropTypes.func.isRequired,
  postComment: PropTypes.func.isRequired,
  comments: PropTypes.shape({
    vehicleComment: PropTypes.shape({
      comment: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default VehicleValidatePage;
