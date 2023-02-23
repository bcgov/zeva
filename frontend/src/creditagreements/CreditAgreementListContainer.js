/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router'
import withReferenceData from '../app/utilities/with_reference_data'
import CreditTransactionTabs from '../app/components/CreditTransactionTabs'
import ROUTES_CREDIT_AGREEMENTS from '../app/routes/CreditAgreements'
import CustomPropTypes from '../app/utilities/props'
import CreditAgreementsListPage from './components/CreditAgreementsListPage'

const qs = require('qs')

const CreditAgreementListContainer = (props) => {
  const [creditAgreements, setCreditAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const { location, keycloak, user } = props
  const [filtered, setFiltered] = useState([])
  const query = qs.parse(location.search, { ignoreQueryPrefix: true })

  const handleClear = () => {
    setFiltered([])
  }

  const refreshList = (showLoading) => {
    setLoading(showLoading)
    const queryFilter = []
    Object.entries(query).forEach(([key, value]) => {
      queryFilter.push({ id: key, value })
    })
    setFiltered([...filtered, ...queryFilter])
    if (location.state) {
      setFiltered([...filtered, ...location.state])
    }
    axios.get(ROUTES_CREDIT_AGREEMENTS.LIST).then((response) => {
      setCreditAgreements(response.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    refreshList(true)
  }, [keycloak.authenticated])

  return [
    <CreditTransactionTabs active="credit-agreements" key="tabs" user={user} />,
    <CreditAgreementsListPage
      creditAgreements={creditAgreements}
      filtered={filtered}
      handleClear={handleClear}
      loading={loading}
      key="list"
      setFiltered={setFiltered}
      user={user}
    />
  ]
}

CreditAgreementListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default withRouter(withReferenceData(CreditAgreementListContainer)())
