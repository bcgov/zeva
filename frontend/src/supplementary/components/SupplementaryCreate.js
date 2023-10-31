import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Loading from '../../app/components/Loading'
import Modal from '../../app/components/Modal'
import Button from '../../app/components/Button'
import ZevSales from './ZevSales'
import SupplierInformation from './SupplierInformation'
import CreditActivity from './CreditActivity'
import UploadEvidence from './UploadEvidence'
import CommentInput from '../../app/components/CommentInput'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import CustomPropTypes from '../../app/utilities/props'
import CONFIG from '../../app/config'

const SupplementaryCreate = (props) => {
  const {
    addSalesRow,
    checkboxConfirmed,
    deleteFiles,
    details,
    files,
    handleCheckboxClick,
    handleCommentChange,
    handleInputChange,
    handleSubmit,
    handleSupplementalChange,
    id,
    ldvSales,
    loading,
    newBalances,
    obligationDetails,
    ratios,
    salesRows,
    setDeleteFiles,
    setUploadFiles,
    user,
    query
  } = props

  let { newData } = props
  let { reassessment } = details

  if (loading) {
    return <Loading />
  }
  // if user is bceid then only draft is editable
  // if user is idir then draft or submitted is editable
  const [showModalDraft, setShowModalDraft] = useState(false)

  const reportYear = details.assessmentData && details.assessmentData.modelYear

  const supplierClass =
    details.assessmentData && details.assessmentData.supplierClass[0]

  const creditReductionSelection =
    details.assessmentData && details.assessmentData.creditReductionSelection

  const isGovernment = user.isGovernment

  if (query && query.reassessment === 'Y') {
    reassessment = {
      isReassessment: true,
      supplementaryReportId: details.id
    }
  }

  if (!isGovernment) {
    reassessment = {
      isReassessment: false
    }

    details.actualStatus = 'DRAFT'
    newData = { zevSales: [], creditActivity: [], supplierInfo: {} }
  }

  const isReassessment = reassessment?.isReassessment

  const modalDraft = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        setShowModalDraft(false)
      }}
      handleSubmit={() => {
        setShowModalDraft(false)
        handleSubmit('DRAFT', true)
      }}
      modalClass="w-75"
      showModal={showModalDraft}
      confirmClass="button primary"
    >
      <div className="my-3">
        {isGovernment && (
          <h3>
            {isReassessment
              ? 'This will create a reassessment report'
              : 'This will create a reassessment report from the supplementary report'}
          </h3>
        )}
      </div>
    </Modal>
  )

  return (
    <div id="supplementary" className="page">
      <div className="row">
        <div className="col">
          <h2 className="mb-2 mt-3">
            {`${reportYear} Model Year Reassessment Report`}
          </h2>
        </div>
      </div>

      <div className="supplementary-form mt-2">
        <Button
          buttonType="button"
          optionalClassname="ml-2 mr-2 button btn float-right d-print-none no-print"
          optionalText="Print Page"
          action={() => {
            window.print()
          }}
        />
        <div>
          <SupplierInformation
            user={user}
            details={details}
            handleInputChange={handleInputChange}
            loading={loading}
            newData={newData}
            isEditable={true}
          />
          <ZevSales
            addSalesRow={addSalesRow}
            details={details}
            handleInputChange={handleInputChange}
            salesRows={salesRows}
            isEditable={true}
          />
          <CreditActivity
            creditReductionSelection={creditReductionSelection}
            details={details}
            handleInputChange={handleInputChange}
            handleSupplementalChange={handleSupplementalChange}
            ldvSales={ldvSales}
            newBalances={newBalances}
            newData={newData}
            obligationDetails={obligationDetails}
            ratios={ratios}
            supplierClass={supplierClass}
            isEditable={true}
          />
        </div>
        {!user.isGovernment && (
          <>
            <div id="comment-input">
              <CommentInput
                defaultComment={
                  details &&
                  details.fromSupplierComments &&
                  details.fromSupplierComments.length > 0
                    ? details.fromSupplierComments[0]
                    : {}
                }
                handleCommentChange={handleCommentChange}
                title="Provide details in the comment box below for any changes above."
              />
            </div>
          </>
        )}
        <UploadEvidence
          details={details}
          deleteFiles={deleteFiles}
          files={files}
          setDeleteFiles={setDeleteFiles}
          setUploadFiles={setUploadFiles}
        />
      </div>

      {/* TODO CHECK IS GOV HAS THIS PERMISSION */}
      {user.hasPermission('SUBMIT_COMPLIANCE_REPORT') && (
        <div className="mt-3">
          <input
            defaultChecked={checkboxConfirmed}
            className="mr-2"
            id="supplier-confirm-checkbox"
            data-testid="supplier-confirm-checkbox"
            name="confirmations"
            onChange={(event) => {
              handleCheckboxClick(event)
            }}
            type="checkbox"
          />
          <label htmlFor="supplier-confirm-checkbox">
            On behalf of {details.assessmentData && details.assessmentData.legalName} I confirm the
            information included in the this Supplementary Report is complete
            and correct.
          </label>
        </div>
      )}

      <div className="row d-print-none">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(
                  /:id/g,
                  id
                )}
              />
            </span>
            <span className="right-content">
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED && (
                <Button
                  buttonType="save"
                  action={() => {
                    handleSubmit('DRAFT', true)
                  }}
                  testid="supplementary-create-button"
                />
              )}
            </span>
          </div>
        </div>
      </div>
      {modalDraft}
    </div>
  )
}

SupplementaryCreate.defaultProps = {
  isReassessment: undefined,
  ldvSales: undefined,
  obligationDetails: [],
  query: {},
  ratios: {}
}

SupplementaryCreate.propTypes = {
  addSalesRow: PropTypes.func.isRequired,
  checkboxConfirmed: PropTypes.bool.isRequired,
  deleteFiles: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  details: PropTypes.shape().isRequired,
  files: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleCommentChange: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleSupplementalChange: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isReassessment: PropTypes.bool,
  ldvSales: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loading: PropTypes.bool.isRequired,
  newBalances: PropTypes.shape().isRequired,
  newData: PropTypes.shape().isRequired,
  obligationDetails: PropTypes.arrayOf(PropTypes.shape()),
  query: PropTypes.shape(),
  ratios: PropTypes.shape(),
  salesRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setDeleteFiles: PropTypes.func.isRequired,
  setUploadFiles: PropTypes.func.isRequired,
  supplementaryAssessmentData: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default SupplementaryCreate
