/*
 * Presentational component
 */
import React from 'react'
import PropTypes from 'prop-types'
import CustomPropTypes from '../../app/utilities/props'
import ReactTable from '../../app/components/ReactTable'
import history from '../../app/History'

const UsersTable = (props) => {
  const columns = [
    {
      accessor: 'displayName',
      className: 'text-left',
      Header: 'Name'
    },
    {
      accessor: (item) =>
        item.roles
          .sort((a, b) => {
            const A = a.roleCode.toUpperCase()
            const B = b.roleCode.toUpperCase()

            if (A < B) {
              return -1
            }

            if (A > B) {
              return 1
            }

            return 0
          })
          .map((role) => role.roleCode)
          .join(', '),
      id: 'roles',
      className: 'text-left',
      Header: 'Roles'
    },
    {
      accessor: (item) => (item.isActive ? 'Active' : 'Inactive'),
      className: 'text-center',
      Header: 'Status',
      id: 'status'
    }
  ]

  const { filtered, items, setFiltered, user } = props
  return (
    <ReactTable
      columns={columns}
      data={items}
      showPagination={true}
      defaultSorted={[
        {
          id: 'displayName'
        }
      ]}
      filtered={filtered}
      getTrProps={(state, row) => {
        if (
          row &&
          row.original &&
          typeof user.hasPermission === 'function' &&
          user.hasPermission('EDIT_USERS')
        ) {
          return {
            onClick: () => {
              const { id } = row.original
              history.push(`/users/${id}/edit`)
            },
            className: 'clickable'
          }
        }

        return {}
      }}
      setFiltered={setFiltered}
    />
  )
}

UsersTable.defaultProps = {}

UsersTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setFiltered: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default UsersTable
