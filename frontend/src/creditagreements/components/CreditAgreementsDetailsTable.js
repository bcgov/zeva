import React from 'react'
import PropTypes from 'prop-types'
import ReactTable from '../../app/components/ReactTable'
import formatNumeric from '../../app/utilities/formatNumeric'

const CreditAgreementsDetailsTable = (props) => {
  const { items } = props

  const creditColumns = [
    {
      Header: 'Quantity',
      headerClassName: 'header-group font-weight-bold',
      accessor: (item) => formatNumeric(item.numberOfCredits),
      id: 'credit-quantity',
      className: 'text-center'
    },
    {
      Header: 'Model Year',
      headerClassName: 'header-group font-weight-bold',
      accessor: (item) => item.modelYear,
      id: 'model-year',
      className: 'text-center'
    },
    {
      Header: 'ZEV Class',
      headerClassName: 'header-group font-weight-bold',
      accessor: (item) => item.creditClass,
      id: 'zev-class',
      className: 'text-center'
    }
  ]
  return (
    <div className="row mb-3">
      <div className="col-sm-11">
        <ReactTable
          className="credit-agreements-details-table"
          columns={creditColumns}
          data={items}
          filterable={false}
        />
      </div>
    </div>
  )
}

CreditAgreementsDetailsTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired
}

export default CreditAgreementsDetailsTable
