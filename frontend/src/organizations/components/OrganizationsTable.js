/*
 * Presentational component
 */
import PropTypes from "prop-types";
import React from "react";

import ReactTable from "../../app/components/ReactTable";
import history from "../../app/History";
import formatNumeric from "../../app/utilities/formatNumeric";
import getSupplierClassDescription from "../../app/utilities/getSupplierClassDescription";

const OrganizationsTable = (props) => {
  const columns = [
    {
      accessor: 'name',
      className: 'col-name',
      Header: 'Company Name',
      id: 'displayName'
    },
    {
      accessor: (item) =>
        getSupplierClassDescription(item.supplierClass),
      className: 'col-class',
      Header: 'Class',
      id: 'class'
    },
    {
      accessor: (item) =>
        item.balance && item.balance.A
          ? formatNumeric(item.balance.A, 2, true)
          : '-',
      className: 'col-credit-balance text-right',
      Header: 'A-Credits',
      id: 'a-credits'
    },
    {
      accessor: (item) =>
        item.balance && item.balance.B
          ? formatNumeric(item.balance.B, 2, true)
          : '-',
      className: 'col-credit-balance text-right',
      Header: 'B-Credits',
      id: 'b-credits'
    }
  ]

  const { filtered, items, setFiltered } = props
  return (
    <ReactTable
      columns={columns}
      data={items}
      defaultSorted={[
        {
          id: 'displayName'
        }
      ]}
      filtered={filtered}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original

              history.push(`/organizations/${id}`, filtered)
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

OrganizationsTable.defaultProps = {}

OrganizationsTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      organizationAddress: PropTypes.arrayOf(
        PropTypes.shape({
          addressLine1: PropTypes.string,
          addressLine2: PropTypes.string,
          addressLine3: PropTypes.string,
          city: PropTypes.string,
          country: PropTypes.string,
          postalCode: PropTypes.string,
          state: PropTypes.string,
          addressType: PropTypes.shape({
            addressType: PropTypes.string
          })
        })
      )
    })
  ).isRequired,
  setFiltered: PropTypes.func.isRequired
}

export default OrganizationsTable
