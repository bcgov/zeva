import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useParams } from 'react-router-dom'
import CustomPropTypes from '../../app/utilities/props'
import Button from '../../app/components/Button'
import History from '../../app/History'
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations'
import Loading from '../../app/components/Loading'
import UsersTable from './UsersTable'

const VehicleSupplierUserListPage = (props) => {
  const { id } = useParams()
  const { loading, locationState, members, filtered, user, setFiltered } =
    props
  if (loading) {
    return <Loading />
  }
  return (
    <div className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Users</h2>
        </div>
        {typeof user.hasPermission === 'function' &&
          user.hasPermission('EDIT_USERS') &&
          user.isGovernment && (
            <div className="col-md-4 text-right">
              <button
                className="button primary"
                onClick={() => {
                  History.push(
                    ROUTES_ORGANIZATIONS.ADD_USER.replace(/:id/gi, id)
                  )
                }}
                type="button"
              >
                <FontAwesomeIcon icon="user-plus" /> <span>New User</span>
              </button>
            </div>
        )}
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

      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_ORGANIZATIONS.LIST}
                locationState={locationState}
              />
            </span>
            <span className="right-content" />
          </div>
        </div>
      </div>
    </div>
  )
}

VehicleSupplierUserListPage.defaultProps = {
  locationState: undefined,
  members: []
}

VehicleSupplierUserListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  members: PropTypes.arrayOf(PropTypes.shape({})),
  setFiltered: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default VehicleSupplierUserListPage
