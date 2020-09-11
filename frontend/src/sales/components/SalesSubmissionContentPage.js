import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import history from '../../app/History';
import ROUTES_SALES from '../../app/routes/Sales';
import download from '../../app/utilities/download';
import ModelListTable from '../../credits/components/ModelListTable';
import CustomPropTypes from '../../app/utilities/props';
import ButtonDelete from '../../app/components/ButtonDelete';
import ButtonSubmit from '../../app/components/ButtonSubmit';
import Modal from '../../app/components/Modal';

const SalesSubmissionContentPage = (props) => {
  const {
    content,
    setShowModal,
    showModal,
    sign,
    submission,
    user,
  } = props;
  const [modalType, setModalType] = useState('');
  const serviceAddress = user.organization.organizationAddress.find((address) => address.addressType.addressType === 'Service');
  const recordsAddress = user.organization.organizationAddress.find((address) => address.addressType.addressType === 'Records');
  const tableContent = content.map((item) => {
    const year = Math.trunc(item.xlsModelYear);
    const vehicleItem = {
      id: item.id,
      salesDate: item.salesDate,
      vehicle: {
        id: item.vehicle.id || `${year}-${item.xlsModel}-${item.xlxMake}`,
        creditClass: item.vehicle.creditClass || '',
        creditValue: item.vehicle.creditValue || 0,
        modelName: item.vehicle.modelName || item.xlsModel,
        make: item.vehicle.make || item.xlsMake,
        modelYear: item.vehicle.modelYear || year,
        range: item.vehicle.range || 0,
        vehicleClassCode: item.vehicle.vehicleClassCode || '',
        vehicleZevType: item.vehicle.vehicleZevType || '',
        weightKg: item.vehicle.weightKg || 0,
      },
      xlsMake: item.xlsMake,
      xlsModel: item.xlsModel,
      xlsModelYear: item.xlsModelYear,
      xlsVin: item.xlsVin,
    };
    return vehicleItem;
  });
  let confirmLabel;
  let handleSubmit = () => {};
  let buttonClass;
  let modalText;
  let icon;

  if (modalType === 'submit') {
    confirmLabel = ' Submit';
    handleSubmit = () => {sign(submission.id, 'SUBMITTED'); };
    buttonClass = 'button primary';
    modalText = 'Submit credit request to government?';
    icon = <FontAwesomeIcon icon="paper-plane" />;
  } else if (modalType === 'delete') {
    confirmLabel = ' Delete';
    handleSubmit = () => {sign(submission.id, 'DELETED'); };
    buttonClass = 'btn-outline-danger';
    modalText = 'Delete submission? WARNING: this action cannot be undone';
    icon = <FontAwesomeIcon icon="trash" />;
  }
  const modal = (
    <Modal
      confirmLabel={confirmLabel}
      handleCancel={() => { setShowModal(false); }}
      handleSubmit={handleSubmit}
      modalClass="w-75"
      showModal={showModal}
      confirmClass={buttonClass}
      icon={icon}
    >
      <div>
        <div><br /><br /></div>
        <h4 className="d-inline">{modalText}
        </h4>
        <div><br /><br /></div>
      </div>
    </Modal>
  );

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <button
              className="button"
              onClick={() => {
                history.push(ROUTES_SALES.LIST);
              }}
              type="button"
            >
              <FontAwesomeIcon icon="arrow-left" /> Back
            </button>
            {submission.validationStatus === 'DRAFT' && (
            <ButtonDelete action={() => { setModalType('delete'); setShowModal(true); }} />
            )}
          </span>
          <span className="right-content">
            {submission.validationStatus === 'VALIDATED'
            && submission.errors > 0 && (
              <button
                className="button primary"
                onClick={(e) => {
                  const element = e.target;
                  const original = element.innerHTML;

                  element.firstChild.textContent = ' Downloading...';

                  return download(ROUTES_SALES.DOWNLOAD_ERRORS.replace(':id', submission.id), {}).then(() => {
                    element.innerHTML = original;
                  });
                }}
                type="button"
              >
                <FontAwesomeIcon icon="download" /> Download Errors
              </button>
            )}
            {submission.validationStatus === 'DRAFT' && (
              <ButtonSubmit action={() => { setModalType('submit'); setShowModal(true); }} />
            )}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sales-validate" className="page sales-upload-details">
      <div className="row">
        <div className="col-sm-12">
          <h2>Application for Credits for Consumer Sales</h2>
          <h3>{user.organization.name}</h3>
          <h5 className="d-inline sales-upload-grey mr-5">Service address: </h5>
          {serviceAddress && <h5 className="d-inline sales-upload-blue">{serviceAddress.addressLine1} {serviceAddress.city} {serviceAddress.state} {serviceAddress.postalCode}</h5>}
          <br />
          <h5 className="d-inline sales-upload-grey mr-5">Records address: </h5>
          {recordsAddress && <h5 className="d-inline sales-upload-blue">{recordsAddress.addressLine1} {recordsAddress.city} {recordsAddress.state} {recordsAddress.postalCode}</h5>}
          <p className="font-weight-bold my-3">
            Consumer Sales: {content.length}
          </p>

        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <ModelListTable
            items={tableContent}
            user={user}
          />
        </div>
      </div>
      {actionbar}
      {modal}
    </div>
  );
};

SalesSubmissionContentPage.defaultProps = {};

SalesSubmissionContentPage.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setShowModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  sign: PropTypes.func.isRequired,
  submission: PropTypes.shape({
    errors: PropTypes.number,
    id: PropTypes.number,
    validationStatus: PropTypes.string,
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionContentPage;
