/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Button from '../../app/components/Button'
import Loading from '../../app/components/Loading'
import Modal from '../../app/components/Modal'
import history from '../../app/History'
import CustomPropTypes from '../../app/utilities/props'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import FormatNumeric from '../../app/utilities/formatNumeric'
import ComplianceReportAlert from './ComplianceReportAlert'
import ComplianceReportSignOff from './ComplianceReportSignOff'
import ComplianceReportDeleteModal from './ComplianceReportDeleteModal'

const SupplierInformationDetailsPage = (props) => {
  const {
    details,
    handleCancelConfirmation,
    handleChangeMake,
    handleDelete,
    handleDeleteMake,
    handleSubmit,
    handleSubmitMake,
    loading,
    make,
    makes,
    user,
    assertions,
    checkboxes,
    disabledCheckboxes: propsDisabledCheckboxes,
    handleCheckboxClick,
    modelYear,
    statuses,
    id
  } = props
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false)
  let disabledCheckboxes = propsDisabledCheckboxes
  let disabledInputs = false
  if (loading) {
    return <Loading />
  }

  const handleButtonClick = (event) => {
    handleSubmit(event);
    setButtonClicked(true);
  };

  const modal = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        setShowModal(false)
      }}
      handleSubmit={() => {
        setShowModal(false)
        handleCancelConfirmation()
      }}
      modalClass="w-75"
      showModal={showModal}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>
          Do you want to edit this page? This action will allow you to make
          further changes to this information, it will also query the database
          to retrieve any recent updates. Your previous confirmation will be
          cleared.
        </h3>
      </div>
    </Modal>
  )

  assertions.forEach((assertion) => {
    if (checkboxes.indexOf(assertion.id) >= 0) {
      disabledCheckboxes = 'disabled'
    }
  })

  if (['SAVED', 'UNSAVED'].indexOf(statuses.supplierInformation.status) < 0) {
    disabledCheckboxes = 'disabled'
    disabledInputs = true
  }

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{modelYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {details &&
            details.supplierInformation &&
            details.supplierInformation.history && (
              <ComplianceReportAlert
                next="Consumer Sales"
                report={details.supplierInformation}
                status={statuses.supplierInformation}
                type="Supplier Information"
              />
          )}
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 supplier-information">
            <span className="float-right d-print-none">
              {!user.isGovernment &&
                statuses.supplierInformation.status === 'CONFIRMED' && (
                  <button
                    className="btn button primary"
                    onClick={() => {
                      setShowModal(true)
                    }}
                    type="button"
                  >
                    Edit
                  </button>
              )}
              <Button
                buttonType="button"
                optionalClassname="ml-2 mr-2 button btn no-print"
                optionalText="Print Page"
                action={() => {
                  window.print()
                }}
              />
            </span>
            <h3>Supplier Information</h3>
            <div className="clear">
              <div className="mt-3 row">
                <div className="col-sm-12 col-md-6">
                  <div className="mt-2 row">
                    <span className="col-4">
                      <h4 className="d-inline">Legal Name: </h4>
                    </span>
                    <span className="col-6">{details.organization.name}</span>
                  </div>
                </div>
              </div>
              {details.organization.organizationAddress &&
                details.organization.organizationAddress.length > 0 && (
                  <>
                    <div className="mt-3 row">
                      <div className="col-sm-12 col-md-6">
                        <div className="row">
                          <div className="col-4">
                            <h4 className="d-inline">Service Address:</h4>
                          </div>
                          {details.organization.organizationAddress.map(
                            (address) =>
                              address.addressType.addressType === 'Service' && (
                                <div className="col-7" key={address.id}>
                                  {address.representativeName && (
                                    <div> {address.representativeName} </div>
                                  )}
                                  {address.addressLine1} {address.addressLine2}{' '}
                                  {address.city} {address.state}{' '}
                                  {address.country} {address.postalCode}
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 row">
                      <div className="col-sm-12 col-md-6">
                        <div className="row">
                          <div className="col-4">
                            <h4 className="d-inline">Records Address</h4>
                          </div>
                          {details.organization.organizationAddress.map(
                            (address) =>
                              address.addressType.addressType === 'Records' && (
                                <div className="col-7" key={address.id}>
                                  {address.representativeName && (
                                    <div> {address.representativeName} </div>
                                  )}
                                  {address.addressLine1} {address.addressLine2}{' '}
                                  {address.city} {address.state}{' '}
                                  {address.country} {address.postalCode}
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    </div>
                  </>
              )}
              <div className="mt-1 row">
                <div className="col-sm-12 col-md-6">
                  <div className="mt-2 row">
                    <span className="col-4">
                      <h4 className="d-inline">Vehicle Supplier Class: </h4>
                    </span>
                    <span className="col-6">
                      <b>{details.supplierClassString.class} Volume Supplier</b>
                      <br />
                      {details.supplierClassString.secondaryText}
                    </span>
                  </div>
                  <div className="mt-2 row">
                    <span className="col-4">
                      <h4 className="d-inline">3 Year Average LDV Sales: </h4>
                    </span>
                    <span className="col-6">
                      {FormatNumeric(details.organization.avgLdvSales, 0)}
                    </span>
                  </div>
                </div>
                {details.organization.ldvSales &&
                  details.organization.ldvSales.length > 0 && (
                    <div className="col-sm-12 col-md-5">
                      <div className="supplier-information d-inline-block">
                        <div className="previous-ldv-sales d-flex flex-column mt-2 px-3 py-1">
                          {details.organization.ldvSales.map((yearSale) => (
                            <div className="model-year-ldv" key={yearSale.id}>
                              <label className="text-blue mr-4 font-weight-bold">
                                {yearSale.modelYear} Model Year LDV
                                Sales\Leases:
                              </label>
                              <label className="sales-numbers">
                                {FormatNumeric(yearSale.ldvSales, 0)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                )}
              </div>
              <div className="d-block mt-3">
                If there is an error in any of the information above, please
                contact:{' '}
                <a href="mailto:ZEVRegulation@gov.bc.ca">
                  ZEVRegulation@gov.bc.ca
                </a>
              </div>
            </div>
            <div className="mt-4">
              <h4>Light Duty Vehicle Makes</h4>
              <div className="mt-1 mb-2">
                Enter all the LDV makes {details.organization.name} supplied in
                British Columbia in the {modelYear} compliance period ending
                September 30, {modelYear + 1}.
              </div>
              <div className="ldv-makes p-3">
                <form disabled={disabledInputs} onSubmit={handleSubmitMake}>
                  {statuses &&
                    ((statuses.assessment &&
                      statuses.assessment.status !== 'ASSESSED') ||
                      !statuses.assessment) && (
                      <div className="form-row">
                        <div className="col-sm-8 col-xs-12">
                          <input
                            className="form-control mr-3"
                            disabled={disabledInputs}
                            onChange={handleChangeMake}
                            type="text"
                            value={make}
                          />
                        </div>
                        <div className="col">
                          <button
                            className="btn btn-primary mb-3"
                            disabled={disabledInputs}
                            type="submit"
                          >
                            Add Make
                          </button>
                        </div>
                      </div>
                  )}
                </form>

                {makes.length > 0 && (
                  <div
                    className={`list p-2 ${disabledInputs ? 'disabled' : ''}`}
                  >
                    {makes.map((item, index) => (
                      <div className="form-row my-2" key={index}>
                        <div className="col-11">{item}</div>
                        {!disabledInputs && (
                          <div className="col-1 delete">
                            <button
                              onClick={() => {
                                handleDeleteMake(index)
                              }}
                              type="button"
                            >
                              x
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {['SUBMITTED', 'ASSESSED', 'REASSESSED'].indexOf(
        statuses.supplierInformation.status
      ) === -1 && (
        <>
          <div className="row">
            <div className="col-12 my-3">
              <ComplianceReportSignOff
                assertions={assertions}
                checkboxes={checkboxes}
                handleCheckboxClick={handleCheckboxClick}
                user={user}
                disabledCheckboxes={disabledCheckboxes}
              />
            </div>
          </div>

          <div className="row d-print-none">
            <div className="col-sm-12">
              <div className="action-bar mt-0">
                <span className="left-content">
                  <Button
                    buttonType="back"
                    locationRoute="/compliance/reports"
                  />
                  {!user.isGovernment &&
                    details.supplierInformation.validationStatus === 'DRAFT' &&
                    <Button
                      buttonType="delete"
                      action={() => {
                        setShowDeleteModal(true)
                      }}
                    />
                  }
                </span>
                <span className="right-content">
                  <Button
                    buttonType="next"
                    disabled={
                      ['UNSAVED'].indexOf(
                        statuses.supplierInformation.status
                      ) >= 0
                    }
                    optionalClassname="button"
                    optionalText="Next"
                    action={() => {
                      history.push(
                        ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES.replace(
                          ':id',
                          id
                        )
                      )
                    }}
                  />
                  {!user.isGovernment && (
                    <Button
                      buttonType="save"
                      disabled={ buttonClicked ||
                        ['SAVED', 'UNSAVED'].indexOf(
                          statuses.supplierInformation.status
                        ) < 0
                      }
                      optionalClassname="button primary"
                      action={(event) => {
                        handleButtonClick(event)
                      }}
                    />
                  )}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {modal}
      {<ComplianceReportDeleteModal
        show={showDeleteModal}
        setShow={setShowDeleteModal}
        handleDelete={handleDelete}
      />}
    </div>
  )
}

SupplierInformationDetailsPage.defaultProps = {}

SupplierInformationDetailsPage.propTypes = {
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    supplierInformation: PropTypes.shape(),
    supplierClassString: PropTypes.shape()
  }).isRequired,
  handleCancelConfirmation: PropTypes.func.isRequired,
  handleChangeMake: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleDeleteMake: PropTypes.func.isRequired,
  handleSubmitMake: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  loading: PropTypes.bool.isRequired,
  make: PropTypes.string.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  disabledCheckboxes: PropTypes.string.isRequired,
  modelYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired
}
export default SupplierInformationDetailsPage