import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import history from '../../app/History'
import Loading from '../../app/components/Loading'
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations'
import CustomPropTypes from '../../app/utilities/props'

import UsersTable from './UsersTable'

const OrganizationDetailsPage = (props) => {
  const { details, filtered, loading, members, setFiltered, user } = props

  if (loading) {
    return <Loading />
  }
  return (
    <div id="organization-details" className="page">
      <div className="row mb-2">
        <div className="col-sm-12">
          <h2>
            {details.isGovernment
              ? details.name
              : 'Vehicle Supplier Information'}
          </h2>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 col-lg-9 col-xl-7">
          {!details.isGovernment && details.organizationAddress && (
            <div className="organization-address">
              <div className="row">
                <div className="col-md-3">Legal name:</div>
                <div className="col-md-9 value">{details.name}</div>
              </div>
              <div className="row">
                <div className="col-md-3">Common name:</div>
                <div className="col-md-9 value">{details.shortName}</div>
              </div>
              {details.organizationAddress.map((each) => (
                <div className="row" key={each.id}>
                  <div className="col-md-3">
                    {each.addressType ? each.addressType.addressType : ''}{' '}
                    Address:
                  </div>
                  <div className="col-md-9 value">
                    {each.addressType.addressType === 'Service'
                      ? each.representativeName
                      : ''}{' '}
                    {each.addressLine1} {each.addressLine2} {each.addressLine3}{' '}
                    {each.city} {each.state} {each.postalCode}
                  </div>
                </div>
              ))}
              <div className="row">
                <div className="offset-md-3 col-md-9 col-sm-12">
                  <a href="mailto:ZEVRegulation@gov.bc.ca?subject=ZEVA supplier address change request">
                    Request change to name or address
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-sm-6 d-flex align-items-end">
          <h2>Users</h2>
        </div>
        <div className="col-sm-6 text-right">
          {user.hasPermission('EDIT_USERS') && (
            <button
              className="button primary"
              onClick={() => {
                history.push(ROUTES_ORGANIZATIONS.MINE_ADD_USER)
              }}
              type="button"
            >
              <FontAwesomeIcon icon="user-plus" /> <span>New User</span>
            </button>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <UsersTable
            filtered={filtered}
            items={members}
            setFiltered={setFiltered}
            user={user}
          />
        </div>
      </div>
    </div>
  )
}

OrganizationDetailsPage.defaultProps = {
  members: []
}

OrganizationDetailsPage.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape()),
  setFiltered: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default OrganizationDetailsPage
