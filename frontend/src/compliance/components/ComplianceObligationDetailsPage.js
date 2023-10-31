/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../../app/components/Button'
import Loading from '../../app/components/Loading'
import CustomPropTypes from '../../app/utilities/props'
import ComplianceReportAlert from './ComplianceReportAlert'
import ComplianceObligationAmountsTable from './ComplianceObligationAmountsTable'
import ComplianceObligationReductionOffsetTable from './ComplianceObligationReductionOffsetTable'
import ComplianceObligationTableCreditsIssued from './ComplianceObligationTableCreditsIssued'
import ComplianceReportSignoff from './ComplianceReportSignOff'
import ComplianceReportDeleteModal from './ComplianceReportDeleteModal'

import Modal from '../../app/components/Modal'
import history from '../../app/History'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'

const ComplianceObligationDetailsPage = (props) => {
  const {
    assertions,
    checkboxes,
    classAReductions,
    creditReductionSelection,
    deductions,
    details,
    handleCancelConfirmation,
    handleChangeSales,
    handleCheckboxClick,
    handleDelete,
    handleSave,
    handleUnspecifiedCreditReduction,
    id,
    loading,
    pendingBalanceExist,
    ratios,
    reportDetails,
    reportYear,
    sales,
    statuses,
    supplierClass,
    totalReduction,
    unspecifiedReductions,
    updatedBalances,
    user
  } = props

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false)

  const handleButtonClick = () => {
    handleSave();
    setButtonClicked(true);
  };

  let disabledCheckboxes = ''
  let hoverText = ''

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

  if (!creditReductionSelection || sales === '') {
    disabledCheckboxes = 'disabled'
    hoverText =
      'You must enter an LDV Sales Total and select a ZEV class credit preference for your Unspecified ZEV Class Credit Reduction'
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{reportYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {details &&
            details.complianceObligation &&
            details.complianceObligation.history && (
              <ComplianceReportAlert
                next="Summary"
                report={details.complianceObligation}
                status={statuses.complianceObligation}
                type="Compliance Obligation"
              />
          )}
        </div>
      </div>
      <div id="compliance-obligation-page">
        <div>
          <span className="float-right d-print-none">
            {!user.isGovernment &&
              statuses.complianceObligation.status === 'CONFIRMED' && (
                <button
                  className="btn button primary mb-2"
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
              optionalClassname="ml-2 mr-2 mb-2 button btn no-print"
              optionalText="Print Page"
              action={() => {
                window.print()
              }}
            />
          </span>
          <h3 className="mb-2">Compliance Obligation</h3>
        </div>
        <div className="clear">
          <ComplianceObligationAmountsTable
            classAReductions={classAReductions}
            handleChangeSales={handleChangeSales}
            page="obligation"
            ratios={ratios}
            reportYear={reportYear}
            sales={sales}
            statuses={statuses}
            supplierClass={supplierClass}
            totalReduction={totalReduction}
            unspecifiedReductions={unspecifiedReductions}
          />
        </div>
        <div className="mt-4">
          <ComplianceObligationTableCreditsIssued
            pendingBalanceExist={pendingBalanceExist}
            reportYear={reportYear}
            reportDetails={reportDetails}
          />
        </div>
        <h3 className="mt-4 mb-2">Credit Reduction</h3>
        {supplierClass !== 'S' ? (
          <>
          You must select your ZEV class credit preference below.
          </>
        ) : (
          <>
          Small volume suppliers have no compliance obligation or credit reduction.
          </>
        )}
        <ComplianceObligationReductionOffsetTable
          creditReductionSelection={creditReductionSelection}
          deductions={deductions}
          handleUnspecifiedCreditReduction={handleUnspecifiedCreditReduction}
          pendingBalanceExist={pendingBalanceExist}
          statuses={statuses}
          supplierClass={supplierClass}
          updatedBalances={updatedBalances}
          user={user}
        />
      </div>
      {['SUBMITTED', 'ASSESSED', 'REASSESSED'].indexOf(
        statuses.complianceObligation.status
      ) === -1 && (
        <>
          <ComplianceReportSignoff
            assertions={assertions}
            checkboxes={checkboxes}
            disabledCheckboxes={disabledCheckboxes}
            handleCheckboxClick={handleCheckboxClick}
            hoverText={hoverText}
            user={user}
          />
          <div className="row  d-print-none">
            <div className="col-sm-12">
              <div className="action-bar mt-0">
                <span className="left-content">
                  <Button
                    buttonType="back"
                    locationRoute="/compliance/reports"
                  />
                  {!user.isGovernment && 
                    details.complianceObligation.validationStatus === 'DRAFT' &&
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
                        ROUTES_COMPLIANCE.REPORT_SUMMARY.replace(':id', id)
                      )
                    }}
                  />
                  {!user.isGovernment && (
                    <Button
                      buttonType="save"
                      disabled={ buttonClicked ||
                        ['SAVED', 'UNSAVED'].indexOf(
                          statuses.complianceObligation.status
                        ) < 0
                      }
                      optionalClassname="button primary"
                      action={() => {
                        handleButtonClick()
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

ComplianceObligationDetailsPage.defaultProps = {
  creditReductionSelection: null,
  pendingBalanceExist: false,
  ratios: {
    complianceRatio: 0,
    zevClassA: 0
  },
  sales: 0
}

ComplianceObligationDetailsPage.propTypes = {
  assertions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  classAReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  creditReductionSelection: PropTypes.string,
  deductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    complianceObligation: PropTypes.shape()
  }).isRequired,
  handleCancelConfirmation: PropTypes.func.isRequired,
  handleChangeSales: PropTypes.func.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleUnspecifiedCreditReduction: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  loading: PropTypes.bool.isRequired,
  pendingBalanceExist: PropTypes.bool,
  ratios: PropTypes.shape(),
  reportDetails: PropTypes.shape().isRequired,
  reportYear: PropTypes.number.isRequired,
  sales: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  statuses: PropTypes.shape().isRequired,
  supplierClass: PropTypes.string.isRequired,
  totalReduction: PropTypes.number.isRequired,
  unspecifiedReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  updatedBalances: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}
export default ComplianceObligationDetailsPage
