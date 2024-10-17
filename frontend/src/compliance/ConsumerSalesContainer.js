import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

import CONFIG from '../app/config'
import history from '../app/History'
import CustomPropTypes from '../app/utilities/props'
import ComplianceReportTabs from './components/ComplianceReportTabs'
import ConsumerSalesDetailsPage from './components/ConsumerSalesDetailsPage'
import ROUTES_COMPLIANCE from '../app/routes/Compliance'
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions'
import deleteModelYearReport from '../app/utilities/deleteModelYearReport'
import FORECAST_ROUTES from '../salesforecast/constants/routes'

const ConsumerSalesContainer = (props) => {
  const { keycloak, user } = props
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [assertions, setAssertions] = useState([])
  const [confirmed, setConfirmed] = useState(false)
  const [checked, setChecked] = useState(false)
  const [checkboxes, setCheckboxes] = useState([])
  const [modelYear, setModelYear] = useState(
    CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR
  )
  const [disabledCheckboxes, setDisabledCheckboxes] = useState(false);
  const [details, setDetails] = useState({})
  const [statuses, setStatuses] = useState({})
  const [forecastRecords, setForecastRecords] = useState([])
  const [forecastTotals, setForecastTotals] = useState({})
  const { id } = useParams()

  const refreshDetails = (showLoading) => {
    setLoading(showLoading)

    axios
      .all([
        axios.get(ROUTES_COMPLIANCE.RETRIEVE_CONSUMER_SALES.replace(':id', id)),
        axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id))
      ])
      .then(
        axios.spread((consumerSalesResponse, statusesResponse) => {
          const {
            vehicleList,
            confirmations,
            organizationName,
            modelYearReportHistory,
            validationStatus
          } = consumerSalesResponse.data

          if (vehicleList.length > 0) {
            setVehicles(vehicleList)
          }

          setDetails({
            organization: {
              name: organizationName
            },
            consumerSales: {
              history: modelYearReportHistory,
              validationStatus
            }
          })

          if (confirmations.length > 0) {
            setConfirmed(true)
            setCheckboxes(confirmations)
          }

          const { modelYear: reportModelYear, statuses: reportStatuses } =
            statusesResponse.data

          const year = parseInt(reportModelYear.name, 10)

          setModelYear(year)
          setStatuses(reportStatuses)

          if (['SAVED', 'UNSAVED'].indexOf(
            reportStatuses.consumerSales.status
          ) < 0){
            setDisabledCheckboxes(true)
          }

          setLoading(false)
        })
      )

    axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      const filteredAssertions = response.data.filter(
        (data) => data.module === 'consumer_sales'
      )
      setAssertions(filteredAssertions)
    })
  }

  const handleCancelConfirmation = () => {
    const data = {
      delete_confirmations: true,
      module: 'consumer_sales'
    }

    axios
      .patch(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id), data)
      .then((response) => {
        history.push(ROUTES_COMPLIANCE.REPORTS)
        history.replace(
          ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES.replace(
            ':id',
            response.data.id
          )
        )
      })
  }

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter(
        (each) => Number(each) !== Number(event.target.id)
      )
      setCheckboxes(checked)
      setChecked(false)
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id)
      setCheckboxes(checked)
      setChecked(true)
    }
  }

  const handleSave = () => {
    if(checkboxes.length === assertions.length){
      const consumerSalesPromise = axios.post(ROUTES_COMPLIANCE.CONSUMER_SALES, {
        data: vehicles,
        modelYearReportId: id,
        confirmation: checkboxes
      })
      const forecastPromise = axios.post(FORECAST_ROUTES.SAVE.replace(/:id/g, id), {
        forecastRecords: forecastRecords,
        ...forecastTotals
      })
      Promise.all([consumerSalesPromise, forecastPromise]).then(() => {
        setDisabledCheckboxes(true)
        history.push(ROUTES_COMPLIANCE.REPORTS)
        history.replace(
          ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES.replace(/:id/g, id)
        )
      })
    }
  }

  const handleDelete = () => {
    deleteModelYearReport(id, setLoading)
  }

  useEffect(() => {
    refreshDetails(true)
  }, [keycloak.authenticated, modelYear])

  return (
    <>
      <ComplianceReportTabs
        active="consumer-sales"
        reportStatuses={statuses}
        user={user}
        modelYear={modelYear}
      />
      <ConsumerSalesDetailsPage
        user={user}
        loading={loading}
        handleSave={handleSave}
        vehicles={vehicles}
        confirmed={confirmed}
        assertions={assertions}
        checkboxes={checkboxes}
        disabledCheckboxes={disabledCheckboxes}
        handleCheckboxClick={handleCheckboxClick}
        details={details}
        modelYear={modelYear}
        statuses={statuses}
        id={id}
        handleCancelConfirmation={handleCancelConfirmation}
        checked={checked}
        handleDelete={handleDelete}
        forecastRecords={forecastRecords}
        setForecastRecords={setForecastRecords}
        forecastTotals={forecastTotals}
        setForecastTotals={setForecastTotals}
      />
    </>
  )
}

ConsumerSalesContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default ConsumerSalesContainer
