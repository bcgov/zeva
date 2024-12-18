import axios from "axios";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { withRouter } from "react-router";
import CONFIG from "../app/config";
import history from "../app/History";
import ROUTES_COMPLIANCE, { insertIdAndYear } from "../app/routes/Compliance";
import ROUTES_VEHICLES from "../app/routes/Vehicles";
import CustomPropTypes from "../app/utilities/props";
import ComplianceReportTabs from "./components/ComplianceReportTabs";
import SupplierInformationDetailsPage from "./components/SupplierInformationDetailsPage";
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from "../app/routes/SigningAuthorityAssertions";
import deleteModelYearReport from "../app/utilities/deleteModelYearReport";
import qs from "qs";

const SupplierInformationContainer = (props) => {
  const { location, keycloak, user } = props
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });
  const { id } = useParams()
  const [assertions, setAssertions] = useState([])
  const [checkboxes, setCheckboxes] = useState([])
  const [details, setDetails] = useState({})
  const [modelYear, setModelYear] = useState(
    isNaN(query.year) ? CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR : parseInt(query.year)
  )
  const [statuses, setStatuses] = useState({
    supplierInformation: {
      status: 'UNSAVED',
      confirmedBy: null
    }
  })

  const [loading, setLoading] = useState(true)
  const [makes, setMakes] = useState([])
  const [make, setMake] = useState('')

  const handleChangeMake = (event) => {
    const { value } = event.target
    setMake(value.toUpperCase())
  }

  const handleDeleteMake = (index) => {
    makes.splice(index, 1)
    setMakes([...makes])
  }

  const handleSubmitMake = (event) => {
    event.preventDefault()

    setMake('')
    setMakes([...makes, make])
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const data = {
      class: user.organization.supplierClass,
      averageLdvSales: details.organization.avgLdvSales,
      ldvSales: details.organization.ldvSales,
      makes,
      modelYear,
      confirmations: checkboxes
    }

    if (id && id !== 'new') {
      axios
        .patch(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id), data)
        .then((response) => {
          history.push(ROUTES_COMPLIANCE.REPORTS)
          history.replace(insertIdAndYear(
            ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION,
            response.data.id,
            modelYear
          ))
        })
    } else {
      axios.post(ROUTES_COMPLIANCE.REPORTS, data).then((response) => {
        history.push(ROUTES_COMPLIANCE.REPORTS)
        history.replace(insertIdAndYear(
          ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION,
          response.data.id,
          modelYear
        ))
      })
    }
  }

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter(
        (each) => Number(each) !== Number(event.target.id)
      )
      setCheckboxes(checked)
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id)
      setCheckboxes(checked)
    }
  }

  const getClassDescriptions = (supplierClass, reportYear) => {
    let supplierClassString = {}
    if (supplierClass === 'L') {
      supplierClassString = {
        class: 'Large',
        secondaryText: '(5,000 or more total ' + (reportYear < 2024 ? 'LDV sales' : 'vehicles supplied') + ')'
      }
    } else if (supplierClass === 'M') {
      supplierClassString = {
        class: 'Medium',
        secondaryText: '(1,000 to 4,999 total ' + (reportYear < 2024 ? 'LDV sales' : 'vehicles supplied') + ')'
      }
    } else if (supplierClass === 'S') {
      supplierClassString = {
        class: 'Small',
        secondaryText: '(less than  1,000 total ' + (reportYear < 2024 ? 'LDV sales' : 'vehicles supplied') + ')'
      }
    }
    return supplierClassString
  }

  const handleCancelConfirmation = () => {
    const data = {
      delete_confirmations: true,
      module: 'supplier_information'
    }

    axios
      .patch(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id), data)
      .then((response) => {
        history.push(ROUTES_COMPLIANCE.REPORTS)
        history.replace(insertIdAndYear(
          ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION,
          response.data.id,
          modelYear
        ))
      })
  }

  const handleDelete = () => {
    deleteModelYearReport(id, setLoading)
  }

  const refreshDetails = () => {
    if (id && id !== 'new') {
      axios
        .get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id))
        .then((response) => {
          const {
            avgSales,
            ldvSalesPrevious,
            supplierClass,
            makes: modelYearReportMakes,
            modelYearReportAddresses,
            modelYearReportHistory,
            organizationName,
            validationStatus,
            modelYear: reportModelYear,
            confirmations,
            statuses: reportStatuses
          } = response.data
          const reportYear = parseInt(reportModelYear.name, 10)
          setModelYear(reportYear)

          if (modelYearReportMakes) {
            const currentMakes = modelYearReportMakes.map((each) => each.make)

            setMakes(currentMakes)
          }
          const ldvSales = ldvSalesPrevious.sort((a, b) =>
            a.modelYear > b.modelYear ? 1 : -1
          )
          const supplierClassString = getClassDescriptions(supplierClass, reportYear)
          setDetails({
            supplierClassString,
            organization: {
              avgLdvSales: avgSales,
              ldvSales,
              name: organizationName,
              organizationAddress: modelYearReportAddresses
            },
            supplierInformation: {
              history: modelYearReportHistory,
              validationStatus
            }
          })

          setCheckboxes(confirmations)
          setStatuses(reportStatuses)

          setLoading(false)
        })
    } else {
      axios.get(ROUTES_VEHICLES.LIST).then((response) => {
        const { data } = response
        // const previousSales = user.organization.ldvSales;
        let reportYear = modelYear
        if (!isNaN(query.year) && id === 'new') {
          reportYear = parseInt(query.year, 10)
          setModelYear(reportYear)
        }
        const supplierClassString = getClassDescriptions(
          user.organization.supplierClass,
          reportYear
        )
        setMakes([
          ...new Set(data.map((vehicle) => vehicle.make.toUpperCase()))
        ])
        const yearTemp = parseInt(query.year, 10)
        const yearsArray = [
          (yearTemp - 1).toString(),
          (yearTemp - 2).toString(),
          (yearTemp - 3).toString()
        ]
        const previousSales = user.organization.ldvSales.filter(
          sales => yearsArray.includes(sales.modelYear.toString())
        )
        previousSales.sort((a, b) => (a.modelYear > b.modelYear ? 1 : -1))
        const newOrg = {
          ldvSales: previousSales.length >= 3 ? previousSales : [],
          avgLdvSales: user.organization.avgLdvSales,
          organizationAddress: user.organization.organizationAddress,
          name: user.organization.name
        }

        setDetails({
          organization: newOrg,
          supplierClassString,
          supplierInformation: {
            history: [],
            validationStatus: 'DRAFT'
          }
        })

        setLoading(false)
      })
    }

    axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      const filteredAssertions = response.data.filter(
        (data) => data.module === 'supplier_information'
      )
      setAssertions(filteredAssertions)
    })
  }

  useEffect(() => {
    refreshDetails()
  }, [keycloak.authenticated])

  return (
    <>
      <ComplianceReportTabs
        active="supplier-information"
        reportStatuses={statuses}
        id={id}
        user={user}
        modelYear={modelYear}
      />
      <SupplierInformationDetailsPage
        assertions={assertions}
        checkboxes={checkboxes}
        details={details}
        disabledCheckboxes={''}
        handleCancelConfirmation={handleCancelConfirmation}
        handleChangeMake={handleChangeMake}
        handleCheckboxClick={handleCheckboxClick}
        handleDelete={handleDelete}
        handleDeleteMake={handleDeleteMake}
        handleSubmit={handleSubmit}
        handleSubmitMake={handleSubmitMake}
        id={id}
        loading={loading}
        make={make}
        makes={makes}
        modelYear={modelYear}
        statuses={statuses}
        user={user}
      />
    </>
  )
}

SupplierInformationContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default withRouter(SupplierInformationContainer)
