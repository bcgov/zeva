import PropTypes from 'prop-types'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import FormDropdown from './FormDropdown'
import TextInput from '../../app/components/TextInput'

const TransferFormRow = (props) => {
  const { years, rowId, handleRowInputChange, removeRow, rows } = props

  const radioName = `creditType-${rowId}`
  return (
    <div className="mb-2">
      <div className="form-group">
        <div className="d-inline-block align-middle mr-5">
          <input
            type="radio"
            name={radioName}
            value="A"
            checked={rows[rowId].creditType === 'A'}
            onChange={(event) => {
              handleRowInputChange(
                { target: { name: 'creditType', value: event.target.value } },
                rowId
              )
            }}
          />
          <label htmlFor={radioName}>A credits</label>
          <br />
          <input
            type="radio"
            name={radioName}
            value="B"
            checked={rows[rowId].creditType === 'B'}
            onChange={(event) => {
              handleRowInputChange(
                { target: { name: 'creditType', value: event.target.value } },
                rowId
              )
            }}
          />
          <label htmlFor={radioName}>B credits</label>
        </div>
        <FormDropdown
          dropdownData={years}
          dropdownName="model year"
          handleInputChange={(event) => {
            handleRowInputChange(event, rowId)
          }}
          fieldName="modelYear"
          accessor={(year) => year.name}
          selectedOption={rows[rowId].modelYear || '--'}
          labelClassname="mr-2 d-inline-block"
          inputClassname="d-inline-block"
          rowClassname="mr-5 d-inline-block align-middle"
        />
        <TextInput
          label="quantity of credits"
          id="quantityOfCredits"
          name="quantity"
          defaultValue={rows[rowId].quantity}
          handleInputChange={(event) => {
            handleRowInputChange(event, rowId)
          }}
          labelSize="mr-2 col-form-label d-inline-block align-middle"
          inputSize="d-inline-block align-middle transfer-input-width"
          mandatory
          rowSize="mr-5 d-inline-block align-middle"
          num
        />
        <TextInput
          label="value per credit"
          id="valuePerCredit"
          name="value"
          defaultValue={rows[rowId].value}
          handleInputChange={(event) => {
            handleRowInputChange(event, rowId)
          }}
          labelSize="mr-2 col-form-label d-inline-block align-middle"
          inputSize="d-inline-block align-middle transfer-input-width"
          mandatory
          rowSize="d-inline-block align-middle"
          num
          showCurrency
        />
        <button
          type="button"
          className="transfer-row-x"
          onClick={() => {
            removeRow(rowId)
          }}
        >
          <FontAwesomeIcon icon="times" />
        </button>
      </div>
    </div>
  )
}

TransferFormRow.defaultProps = {}

TransferFormRow.propTypes = {
  years: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  rowId: PropTypes.number.isRequired,
  handleRowInputChange: PropTypes.func.isRequired,
  removeRow: PropTypes.func.isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default TransferFormRow
