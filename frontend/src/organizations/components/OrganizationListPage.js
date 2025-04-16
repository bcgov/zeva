import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import history from '../../app/History'
import Loading from '../../app/components/Loading'
import OrganizationsTable from './OrganizationsTable'
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations'
import ROUTES_USERS from '../../app/routes/Users'
import CustomPropTypes from '../../app/utilities/props'

const OrganizationListPage = (props) => {
  const { filtered, loading, organizations, setFiltered, user } = props

  if (loading) {
    return <Loading />
  }

  return (
    <div id="organization-list" className="page">
      <div className="row mb-2">
        <div className="col-md-8">
          <h2>Vehicle Suppliers</h2>
        </div>

        <div className="col-md-4">
          <div className="text-right">
            {typeof user.hasPermission === 'function' &&
              user.hasPermission('EDIT_ORGANIZATIONS') &&
              user.isGovernment && (
                <button
                  className="button primary"
                  type="button"
                  onClick={() => {
                    history.push(ROUTES_ORGANIZATIONS.NEW)
                  }}
                >
                  <FontAwesomeIcon icon="plus" /> New Supplier
                </button>
            )}
            {user.isGovernment && (
              <button
                className="button primary ml-2"
                type="button"
                onClick={() => {
                  history.push(ROUTES_USERS.ACTIVE)
                }}
              >
                Email Addresses
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <OrganizationsTable
            filtered={filtered}
            items={organizations}
            setFiltered={setFiltered}
          />
        </div>
      </div>
    </div>
  )
}

OrganizationListPage.defaultProps = {
  organizations: []
}

OrganizationListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.shape()),
  setFiltered: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default OrganizationListPage
