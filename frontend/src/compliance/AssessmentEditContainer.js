import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { withRouter } from 'react-router'
import history from '../app/History'

import CustomPropTypes from '../app/utilities/props'
import AssessmentEditPage from './components/AssessmentEditPage'
import ComplianceReportTabs from './components/ComplianceReportTabs'
import ROUTES_COMPLIANCE from '../app/routes/Compliance'
import ROUTES_VEHICLES from '../app/routes/Vehicles'
import Loading from '../app/components/Loading'
import CONFIG from '../app/config'

const AssessmentEditContainer = (props) => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState({})
  const [makes, setMakes] = useState([])
  const [supplierMakesList, setSupplierMakesList] = useState([])
  const [make, setMake] = useState('')
  const [modelYear, setModelYear] = useState(
    CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR
  )
  const [reportMakes, setReportMakes] = useState('')
  const [reportSales, setReportSales] = useState('')
  const { user, keycloak } = props
  const [statuses, setStatuses] = useState({
    assessment: {
      status: 'UNSAVED',
      confirmedBy: null
    }
  })
  const [sales, setSales] = useState({})
  const [ratios, setRatios] = useState({})
  const [years, setYears] = useState([])
  const [enableSave, setEnableSave] = useState(false)
  const [supplierClass, setSupplierClass] = useState('S')
  const handleChangeMake = (event) => {
    const { value } = event.target
    setMake(value.toUpperCase())
  }

  const handleChangeSale = (year, value) => {
    setSales({
      ...sales,
      [year]: value
    })
  }

  const handleDeleteMake = (makeToDelete) => {
    setMakes((prev) => prev.filter((each) => each !== makeToDelete))
  }

  const handleSubmitMake = (event) => {
    event.preventDefault()
    if (make.length > 0) {
      setMake('')
      setMakes([...makes, make])
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    let data = {}
    if (makes.length > 0) {
      data = { makes }
    }
    for (const i in reportSales) {
      if (sales[i] !== reportSales[i]) {
        data = { ...data, sales }
      }
    }
    axios
      .patch(ROUTES_COMPLIANCE.REPORT_ASSESSMENT_SAVE.replace(/:id/g, id), data)
      .then(() => {
        history.push(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(/:id/g, id))
      })
  }

  const equalsIgnoreOrder = (a, b) => {
    if (a.length !== b.length) return false
    const uniqueValues = new Set([...a, ...b])
    for (const v of uniqueValues) {
      const aCount = a.filter((e) => e === v).length
      const bCount = b.filter((e) => e === v).length
      if (aCount !== bCount) return false
    }
    return true
  }

  useEffect(() => {
    if (
      sales[modelYear] !== reportSales[modelYear] ||
      !equalsIgnoreOrder(makes, reportMakes)
    ) {
      setEnableSave(true)
    } else if (
      sales[modelYear] === reportSales[modelYear] &&
      equalsIgnoreOrder(makes, reportMakes)
    ) {
      setEnableSave(false)
    }
  }, [makes, sales])

  const refreshDetails = () => {
    const detailsPromise = axios.get(
      ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)
    )

    const ratiosPromise = axios.get(ROUTES_COMPLIANCE.RATIOS)
    const makesPromise = axios.get(ROUTES_COMPLIANCE.MAKES.replace(/:id/g, id))
    const yearsPromise = axios.get(ROUTES_VEHICLES.YEARS)

    Promise.all([
      detailsPromise,
      ratiosPromise,
      makesPromise,
      yearsPromise
    ]).then(([response, ratiosResponse, makesResponse, yearsResponse]) => {
      const {
        makes: modelYearReportMakes,
        modelYear: reportModelYear,
        statuses: reportStatuses,
        modelYearReportHistory,
        modelYearReportAddresses,
        organizationName,
        validationStatus,
        ldvSales: reportLdvSales,
        supplierClass,
        changelog
      } = response.data
      const year = parseInt(reportModelYear.name, 10)

      const { supplierMakes, govMakes } = makesResponse.data

      setModelYear(year)
      setStatuses(reportStatuses)

      const analystMakes = govMakes.map((each) => each.make)
      setReportMakes(analystMakes)
      setMakes(analystMakes)
      if (modelYearReportMakes) {
        const supplierCurrentMakes = supplierMakes.map((each) => each.make)

        setSupplierMakesList(supplierCurrentMakes)
      }
      let ldvSales = reportLdvSales

      if (
        changelog &&
        changelog.ldvChanges &&
        changelog.ldvChanges.notFromGov
      ) {
        ldvSales = changelog.ldvChanges.notFromGov
      }

      setDetails({
        assessment: {
          history: modelYearReportHistory,
          validationStatus
        },
        ldvSales,

        organization: {
          name: organizationName,
          organizationAddress: modelYearReportAddresses
        },
        supplierInformation: {
          history: modelYearReportHistory,
          validationStatus
        },
        supplierClass
      })

      setReportSales({
        [year]: reportLdvSales
      })

      setSales({
        [year]: reportLdvSales
      })

      const filteredRatio = ratiosResponse.data.find(
        (data) => data.modelYear === year.toString()
      )

      setRatios(filteredRatio)

      setYears(yearsResponse.data)

      setLoading(false)

      setSupplierClass(supplierClass)
    })
  }

  useEffect(() => {
    refreshDetails()
  }, [keycloak.authenticated])

  if (loading) {
    return <Loading />
  }
  return (
    <>
      <ComplianceReportTabs
        active="assessment"
        reportStatuses={statuses}
        id={id}
        user={user}
        modelYear={modelYear}
      />
      <AssessmentEditPage
        modelYear={modelYear}
        statuses={statuses}
        id={id}
        loading={loading}
        user={user}
        makes={makes}
        details={details}
        handleChangeMake={handleChangeMake}
        handleChangeSale={handleChangeSale}
        handleDeleteMake={handleDeleteMake}
        handleSubmitMake={handleSubmitMake}
        make={make}
        handleSubmit={handleSubmit}
        ratios={ratios}
        sales={sales}
        supplierMakes={supplierMakesList}
        years={years}
        enableSave={enableSave}
        supplierClass={supplierClass}
      />
    </>
  )
}
AssessmentEditContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  keycloak: CustomPropTypes.keycloak.isRequired
}
export default withRouter(AssessmentEditContainer)