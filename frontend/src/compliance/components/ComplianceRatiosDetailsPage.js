import React from 'react'
import PropTypes from 'prop-types'
import CustomPropTypes from '../../app/utilities/props'
import Loading from '../../app/components/Loading'
import ComplianceRatiosTable from './ComplianceRatiosTable'

const ComplianceRatiosDetailsPage = (props) => {
  const { user, complianceRatios, loading } = props

  if (loading) {
    return <Loading />
  }

  return (
    <div id="compliance-ldvsales-details" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Compliance Ratios</h2>
        </div>
        <div className="col-sm-5 mt-4">
          <ComplianceRatiosTable
            data={complianceRatios}
            user={user}
          ></ComplianceRatiosTable>
        </div>
      </div>
    </div>
  )
}
ComplianceRatiosDetailsPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
  complianceRatios: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired
}
export default ComplianceRatiosDetailsPage
