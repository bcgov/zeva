import axios from 'axios'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { withRouter } from 'react-router'

import CONFIG from '../app/config'
import CustomPropTypes from '../app/utilities/props'
import ROUTES_COMPLIANCE from '../app/routes/Compliance'
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations'
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs'
import ComplianceReportListPage from '../compliance/components/ComplianceReportListPage'

const VehicleSupplierReportListContainer = (props) => {
  const { id } = useParams()
  const { location, user } = props
  const { state: locationState } = location

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [availableYears, setAvailableYears] = useState(
    CONFIG.FEATURES.MODEL_YEAR_REPORT.YEARS
  )
  const [details, setDetails] = useState({})
  const [filtered, setFiltered] = useState([])
  const [ratios, setRatios] = useState({})

  const refreshList = () => {
    setLoading(true)

    const detailsPromise = axios
      .get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id))
      .then((response) => {
        setDetails(response.data)
      })

    const ratiosPromise = axios
      .get(ROUTES_COMPLIANCE.RATIOS)
      .then((response) => {
        setRatios(response.data)
      })

    const reportsPromise = axios
      .get(ROUTES_COMPLIANCE.REPORTS, {
        params: {
          organization_id: id
        }
      })
      .then((response) => {
        setData(response.data)

        const filteredYears = availableYears.filter(
          (year) =>
            response.data.findIndex(
              (item) => parseInt(item.modelYear.name, 10) === parseInt(year, 10)
            ) < 0
        )

        setAvailableYears(filteredYears)
      })

    Promise.all([detailsPromise, reportsPromise, ratiosPromise]).then(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    refreshList()
  }, [])

  return (
    <div className="page">
      <h1>{details.name}</h1>
      <VehicleSupplierTabs
        locationState={locationState}
        supplierId={details.id}
        active="model-year-reports"
        user={user}
      />
      <ComplianceReportListPage
        availableYears={availableYears}
        data={data}
        loading={loading}
        filtered={filtered}
        ratios={ratios}
        setFiltered={setFiltered}
        user={user}
      />
    </div>
  )
}
VehicleSupplierReportListContainer.propTypes = {
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default withRouter(VehicleSupplierReportListContainer)
