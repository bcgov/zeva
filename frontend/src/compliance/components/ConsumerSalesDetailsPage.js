import React, { useState } from 'react'
import PropTypes from 'prop-types'
import CustomPropTypes from '../../app/utilities/props'
import Loading from '../../app/components/Loading'
import ComplianceReportAlert from './ComplianceReportAlert'
import Button from '../../app/components/Button'
import Modal from '../../app/components/Modal'
import history from '../../app/History'
import ComplianceReportSignOff from './ComplianceReportSignOff'
import ConsumerSalesLDVModalTable from './ConsumerSalesLDVModelTable'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import ComplianceReportDeleteModal from './ComplianceReportDeleteModal'
import RecordsUpload from '../../salesforecast/components/RecordsUpload'
import RecordsTable from '../../salesforecast/components/RecordsTable'
import TotalsTable from '../../salesforecast/components/TotalsTable'

const ConsumerSalesDetailsPage = (props) => {
  const {
    details,
    handleCancelConfirmation,
    user,
    loading,
    handleSave,
    vehicles,
    assertions,
    checkboxes,
    disabledCheckboxes: propsDisabledCheckboxes,
    handleCheckboxClick,
    modelYear,
    statuses,
    id,
    checked,
    handleDelete,
    forecastRecords,
    setForecastRecords,
    forecastTotals,
    setForecastTotals
  } = props

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false)
  let disabledCheckboxes = propsDisabledCheckboxes

  const handleButtonClick = (event) => {
    handleSave(event);
    setButtonClicked(true);
  };

  if (loading) {
    return <Loading />
  }

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
  let enableEditBtnForAnalyst = false
  const pendingSalesExist = () => {
    if (Object.keys(vehicles).length > 0) {
      vehicles.forEach((each) => {
        if (each.pendingSales > 0) {
          enableEditBtnForAnalyst = true
        }
      })
    }
  }

  const disableSave = () => {
    if (checkboxes.length !== assertions.length) {
      return true
    }
    return false
  }

  return (
    <div id="compliance-consumer-sales-details" className="page">
      {pendingSalesExist()}
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{modelYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {details &&
            details.consumerSales &&
            details.consumerSales.history && (
              <ComplianceReportAlert
                next="Compliance Obligation"
                report={details.consumerSales}
                status={statuses.consumerSales}
                type="Consumer ZEV Sales"
              />
          )}
        </div>
      </div>

      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 consumer-sales">
            <span className="float-right d-print-none no-print">
              {(!user.isGovernment ||
                (user.hasPermission('RECOMMEND_COMPLIANCE_REPORT') &&
                  enableEditBtnForAnalyst)) &&
                statuses.consumerSales.status === 'CONFIRMED' && (
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
                optionalClassname="ml-2 mr-2 button btn"
                optionalText="Print Page"
                action={() => {
                  window.print()
                }}
              />
            </span>
            <div className="ldv-zev-models mt-2">
              <label className="text-blue mr-4 font-weight-bold">
                {modelYear} Model Year Zero-Emission Vehicles Sales
              </label>
              <div className="text-blue mt-2">
                If you have {modelYear} model year ZEV sales or leases that
                occurred before Oct. 1, {modelYear + 1} that you haven&apos;t
                applied for credits you must{' '}
                <button
                  className="text-primary credit-request-link"
                  onClick={() => {
                    history.push('/credit-requests/new')
                  }}
                  type="button"
                >
                  {' '}
                  <u>enter an application for credits for consumer sales</u>
                </button>{' '}
                before submitting this model year report.
              </div>
              <div className="total-ldv-sales mt-2 mb-2">
                *Sales Submitted are VIN submitted in credit applications
                awaiting government review, Sales Issued are those VIN already
                verified by government and have been issued credits.
              </div>
              <div className="sales-table mt-2">
                <ConsumerSalesLDVModalTable vehicles={vehicles} />
              </div>
            </div>
          </div>
          {modelYear >= 2023 &&
            <div className="p-3 forecast-report">
              <label className="text-blue mr-4 font-weight-bold">
                Forecast Report
              </label>
              {!user.isGovernment && details.consumerSales.validationStatus === 'DRAFT' && statuses.consumerSales.status !== 'CONFIRMED' &&
              <RecordsUpload
                currentModelYear={modelYear}
                setRecords={setForecastRecords}
                setTotals={setForecastTotals}
              />
              }
              <RecordsTable
                modelYearReportId={id}
                passedRecords={forecastRecords}
              />
              <TotalsTable
                currentModelYear={modelYear}
                modelYearReportId={id}
                passedRecords={forecastRecords}
                totals={forecastTotals}
                setTotals={setForecastTotals}
                readOnly={user.isGovernment || details.consumerSales.validationStatus !== 'DRAFT' || statuses.consumerSales.status === 'CONFIRMED'}
              />
            </div>
          }
        </div>
      </div>
      {['SUBMITTED', 'ASSESSED', 'REASSESSED'].indexOf(
        statuses.consumerSales.status
      ) === -1 && (
        <>
          <div className="row">
            <div className="col-12 my-3">
            <ComplianceReportSignOff
              assertions={assertions}
              checkboxes={checkboxes}
              handleCheckboxClick={handleCheckboxClick}
              disabledCheckboxes={disabledCheckboxes}
              hoverText="Compliance Report Sign Off"
              user={user}
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
                    details.consumerSales.validationStatus === 'DRAFT' &&
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
                    optionalClassname="button"
                    optionalText="Next"
                    action={() => {
                      history.push(
                        ROUTES_COMPLIANCE.REPORT_CREDIT_ACTIVITY.replace(
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
                          statuses.consumerSales.status
                        ) < 0 || disableSave()
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
ConsumerSalesDetailsPage.defaultProps = {
  assertions: [],
  checkboxes: []
}

ConsumerSalesDetailsPage.propTypes = {
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    consumerSales: PropTypes.shape()
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
  loading: PropTypes.bool.isRequired,
  handleSave: PropTypes.func.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  handleCancelConfirmation: PropTypes.func.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  disabledCheckboxes: PropTypes.bool.isRequired,
  modelYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
  handleDelete: PropTypes.func.isRequired,
}
export default ConsumerSalesDetailsPage