import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import CONFIG from "../app/config";
import history from "../app/History";
import CustomPropTypes from "../app/utilities/props";
import ComplianceReportTabs from "./components/ComplianceReportTabs";
import ConsumerSalesDetailsPage from "./components/ConsumerSalesDetailsPage";
import ROUTES_COMPLIANCE from "../app/routes/Compliance";
import urlInsertIdAndYear from "../app/utilities/urlInsertIdAndYear";
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from "../app/routes/SigningAuthorityAssertions";
import deleteModelYearReport from "../app/utilities/deleteModelYearReport";
import FORECAST_ROUTES from "../salesforecast/constants/routes";
import qs from "qs";

const ConsumerSalesContainer = (props) => {
  const location = useLocation();
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });
  const { keycloak, user } = props
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [assertions, setAssertions] = useState([])
  const [confirmed, setConfirmed] = useState(false)
  const [checked, setChecked] = useState(false)
  const [checkboxes, setCheckboxes] = useState([])
  const [modelYear, setModelYear] = useState(
    isNaN(query.year) ? CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR : parseInt(query.year)
  )
  const [disabledCheckboxes, setDisabledCheckboxes] = useState(false);
  const [details, setDetails] = useState({})
  const [statuses, setStatuses] = useState({})
  const [forecastRecords, setForecastRecords] = useState([])
  const [forecastTotals, setForecastTotals] = useState({})
  const [saveTooltip, setSaveTooltip] = useState("");
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
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
          urlInsertIdAndYear(ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES, id, modelYear)
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
          urlInsertIdAndYear(ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES, id, modelYear)
        )
      })
    }
  }

  const handleDelete = () => {
    deleteModelYearReport(id, setLoading)
  }


  useEffect(() => {
    const checkDisableSave = () => {
      if (checkboxes.length !== assertions.length) {
        setSaveTooltip("Please ensure all confirmations checkboxes are checked");
        return true;
      }
      if (
        (!forecastTotals ||
        !Object.values(forecastTotals).every(
          (value) =>
            (typeof value === "number" || (!isNaN(value))) && value !== null
        )
      ) && modelYear >= 2023) {
        setSaveTooltip(
          "Please ensure forecast spreadsheet is uploaded and totals are filled out"
        );
        return true;
      }
      setSaveTooltip(""); // Clear tooltip if no issues
      return false;
    };
    setIsSaveDisabled(checkDisableSave());
  }, [checkboxes, forecastTotals]);


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
        saveTooltip={saveTooltip}
        isSaveDisabled={isSaveDisabled}
      />
    </>
  )
}

ConsumerSalesContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default ConsumerSalesContainer
