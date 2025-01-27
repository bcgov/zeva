/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { withRouter } from 'react-router'

import ROUTES_COMPLIANCE from '../app/routes/Compliance'
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations'
import CustomPropTypes from '../app/utilities/props'
import VehicleSupplierDetailsPage from './components/VehicleSupplierDetailsPage'
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs'
import History from '../app/History'

const VehicleSupplierDetailsContainer = (props) => {
  const { id } = useParams()
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [display, setDisplay] = useState({})
  const { keycloak, location, user } = props
  const { state: locationState } = location
  const [modelYears, setModelYears] = useState([])
  const [fields, setFields] = useState({})
  const [ldvSales, setLDVSales] = useState([])
  const [isEditable, setIsEditable] = useState(false)

  const refreshDetails = () => {
    setLoading(true)

    Promise.all([
      axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)),
      axios.get(ROUTES_COMPLIANCE.YEARS)
    ]).then(([response, yearsResponse]) => {
      setDetails(response.data)
      setDisplay(response.data)
      setModelYears(yearsResponse.data)

      const { ldvSales: responseLDVSales } = response.data
      setLDVSales(responseLDVSales)

      setLoading(false)
    })
  }

  useEffect(() => {
    refreshDetails()
  }, [keycloak.authenticated])

  const editButton = () => {
    if (
      typeof user.hasPermission === 'function' &&
      user.hasPermission('EDIT_ORGANIZATIONS') &&
      user.isGovernment
    ) {
      return (
        <button
          className="button primary"
          onClick={() => {
            History.push(ROUTES_ORGANIZATIONS.EDIT.replace(/:id/gi, id))
          }}
          type="button"
        >
          <FontAwesomeIcon icon="edit" /> Edit
        </button>
      )
    }

    return false
  }

  const handleInputChange = (event) => {
    const { value, name } = event.target

    setFields({
      ...fields,
      [name]: value
    })
  }

  const handleDeleteSale = (sale) => {
    axios
      .put(ROUTES_ORGANIZATIONS.LDV_SALES.replace(/:id/gi, id), {
        id: sale.id
      })
      .then(() => {
        History.push(ROUTES_ORGANIZATIONS.LIST)
        History.replace(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id))
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    axios
      .put(ROUTES_ORGANIZATIONS.LDV_SALES.replace(/:id/gi, id), {
        ...fields, isSupplied: true
      })
      .then(() => {
        History.push(ROUTES_ORGANIZATIONS.LIST)
        History.replace(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id))
      })
  }

  return (
    <div className="page">
      <h1 className="mb-2">{display.name}</h1>
      <VehicleSupplierTabs
        locationState={locationState}
        supplierId={id}
        active="supplier-info"
        user={user}
      />
      <VehicleSupplierDetailsPage
        details={details}
        ldvSales={ldvSales}
        loading={loading}
        locationState={locationState}
        editButton={editButton()}
        user={user}
        modelYears={modelYears}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        selectedModelYear={fields.modelYear}
        inputLDVSales={fields.ldvSales}
        handleDeleteSale={handleDeleteSale}
        isEditable={isEditable}
        setIsEditable={setIsEditable}
      />
    </div>
  )
}
VehicleSupplierDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default withRouter(VehicleSupplierDetailsContainer)
