/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { withRouter } from 'react-router'
import ROUTES_VEHICLES from '../app/routes/Vehicles'
import CustomPropTypes from '../app/utilities/props'
import VehicleList from './components/VehicleList'

const qs = require('qs')

const VehicleListContainer = (props) => {
  const [filtered, setFiltered] = useState([{id: 'is-active', value: 'Yes'}])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(null)

  const { keycloak, user, location } = props

  const query = qs.parse(location.search, { ignoreQueryPrefix: true })
  const handleClear = () => {
    setFiltered([{id: 'is-active', value: 'Yes'}])
  
    refreshList(true);
  }
  const refreshList = (showLoading) => {
    setLoading(showLoading);
    
    const queryFilter = [];
    Object.entries(query).forEach(([key, value]) => {
      queryFilter.push({ id: key, value });
    });
    
    let newFilters = [{id: 'is-active', value: 'Yes'}];
    
    newFilters = [...newFilters, ...queryFilter];
    
    if (location.state && Array.isArray(location.state)) {
      newFilters = [...newFilters, ...location.state];
    }
  
    setFiltered(newFilters);
    
    axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      if (!isMountedRef.current) {
        return false;
      }
  
      setVehicles(response.data);
      setLoading(false);
    });
  }
  
  

  useEffect(() => {
    isMountedRef.current = true
    refreshList(true)

    return () => {
      isMountedRef.current = false
    }
  }, [keycloak.authenticated])

  return (
    <VehicleList
      filtered={filtered}
      setFiltered={setFiltered}
      handleClear={handleClear}
      loading={loading}
      vehicles={vehicles}
      user={user}
    />
  )
}

VehicleListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default withRouter(VehicleListContainer)
