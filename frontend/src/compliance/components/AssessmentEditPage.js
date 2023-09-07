import React from 'react'
import PropTypes from 'prop-types'

import CustomPropTypes from '../../app/utilities/props'
import ComplianceReportAlert from './ComplianceReportAlert'
import Button from '../../app/components/Button'
import Loading from '../../app/components/Loading'
import AssessmentSupplierInformationMakes from './AssessmentSupplierInformationMakes'
import ConsumerLDVSales from './ConsumerLDVSales'
import getTotalReduction from '../../app/utilities/getTotalReduction'
import getClassACredits from '../../app/utilities/getClassAReduction'
import getUnspecifiedClassReduction from '../../app/utilities/getUnspecifiedClassReduction'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'

const AssessmentEditPage = (props) => {
  const {
    details,
    id,
    loading,
    makes,
    make,
    modelYear,
    statuses,
    user,
    handleChangeMake,
    handleChangeSale,
    handleDeleteMake,
    handleSubmitMake,
    handleSubmit,
    ratios,
    sales,
    supplierMakes,
    enableSave,
    supplierClass
  } = props

  if (loading) {
    return <Loading />
  }

  const totalReduction = getTotalReduction(
    details.ldvSales,
    ratios.complianceRatio,
    supplierClass
  )
  const classAReduction = getClassACredits(
    details.ldvSales,
    ratios.zevClassA,
    supplierClass
  )
  const leftoverReduction = getUnspecifiedClassReduction(
    totalReduction,
    classAReduction,
    supplierClass
  )

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
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
          <span className="right-content mr-3">
            <Button
              disabled={!enableSave}
              optionalClassname="button primary"
              buttonType="save"
              action={(event) => {
                handleSubmit(event)
              }}
            />
          </span>
        </div>
      </div>
    </div>
  )
  return (
    <div id="assessment-edit" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{modelYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div className="m-0">
            {details &&
              details.supplierInformation &&
              details.supplierInformation.history && (
                <ComplianceReportAlert
                  next=""
                  report={details.assessment}
                  status={statuses.assessment}
                  type="Assessment"
                />
            )}
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div className="grey-border-area">
            <h3>Notice of Assessment</h3>
            <div className="mt-3">
              <h3> {details.organization.name} </h3>
            </div>
            <div className="supplier-info-ldv-makes mt-2">
              <h3>Supplier Information LDV Makes</h3>
              <div className="mt-2 p-3 grey-border-area p-4">
                <AssessmentSupplierInformationMakes
                  modelYear={modelYear}
                  loading={loading}
                  user={user}
                  makes={makes}
                  details={details}
                  handleChangeMake={handleChangeMake}
                  handleDeleteMake={handleDeleteMake}
                  handleSubmitMake={handleSubmitMake}
                  make={make}
                  supplierMakes={supplierMakes}
                />
              </div>
            </div>
            <div className="consumer-ldv-sales mt-2">
              <h3>Consumer LDV Sales</h3>
              <div className="mt-2 grey-border-area">
                <ConsumerLDVSales
                  classAReduction={classAReduction}
                  currentSales={details.ldvSales}
                  handleChangeSale={handleChangeSale}
                  leftoverReduction={leftoverReduction}
                  modelYear={modelYear}
                  ratios={ratios}
                  supplierClass={details.supplierClass}
                  totalReduction={totalReduction}
                  updatedSales={sales[modelYear]}
                />
              </div>
            </div>
          </div>
          {actionbar}
        </div>
      </div>
    </div>
  )
}
AssessmentEditPage.defaultProps = {}

AssessmentEditPage.propTypes = {
  details: PropTypes.shape().isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  loading: PropTypes.bool.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  supplierMakes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
  modelYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
  handleChangeMake: PropTypes.func.isRequired,
  handleChangeSale: PropTypes.func.isRequired,
  handleDeleteMake: PropTypes.func.isRequired,
  handleSubmitMake: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  make: PropTypes.string.isRequired,
  sales: PropTypes.shape().isRequired,
  ratios: PropTypes.shape().isRequired
}
export default AssessmentEditPage
