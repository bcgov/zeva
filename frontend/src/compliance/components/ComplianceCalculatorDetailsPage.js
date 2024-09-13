import React from 'react'
import PropTypes from 'prop-types'
import CustomPropTypes from '../../app/utilities/props'
import ComplianceCalculatorDetailsTotals from './ComplianceCalculatorDetailsTotals'
import ComplianceCalculatorModelTable from './ComplianceCalculatorModelTable'
import ComplianceCalculatorDetailsInputs from './ComplianceCalculatorDetailsInputs'

const ComplianceCalculatorDetailsPage = (props) => {
  const {
    complianceNumbers,
    complianceYearInfo,
    handleInputChange,
    modelYearList,
    selectedYearOption,
    supplierSize,
    allVehicleModels,
    estimatedModelSales,
    setEstimatedModelSales,
    user
  } = props

  return (
    <div id="compliance-ldvsales-details" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Compliance Calculator</h2>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col-12">
          The compliance calculator is to assist in estimating your compliance
          obligation.
          <br />
          Enter your estimated total vehicle sales for a model year to see an
          estimated ratio reduction.
          <br />
          Enter your estimated total ZEVs supplied by model to see an estimate of
          credits generated from these sales.
        </div>
      </div>
      <div className="calculator-page">
        <div id="form" className="row px-3">
          <ComplianceCalculatorDetailsInputs
            complianceYearInfo={complianceYearInfo}
            handleInputChange={handleInputChange}
            modelYearList={modelYearList}
            selectedYearOption={selectedYearOption}
            supplierSize={supplierSize}
          />
          <ComplianceCalculatorDetailsTotals
            user={user}
            complianceNumbers={complianceNumbers}
            estimatedModelSales={estimatedModelSales}
            supplierSize={supplierSize}
          />
        </div>
        <ComplianceCalculatorModelTable
          models={allVehicleModels}
          estimatedModelSales={estimatedModelSales}
          setEstimatedModelSales={setEstimatedModelSales}
        />
      </div>
    </div>
  )
}
ComplianceCalculatorDetailsPage.defaultProps = {
  supplierSize: '',
  selectedYearOption: '--',
  complianceNumbers: { total: '', classA: '', remaining: '' }
}
ComplianceCalculatorDetailsPage.propTypes = {
  allVehicleModels: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  complianceNumbers: PropTypes.shape({
    total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    classA: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    remaining: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  complianceYearInfo: PropTypes.shape({
    complianceRatio: PropTypes.string,
    zevClassA: PropTypes.string
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  modelYearList: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  selectedYearOption: PropTypes.string,
  supplierSize: PropTypes.string,
  estimatedModelSales: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEstimatedModelSales: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default ComplianceCalculatorDetailsPage
