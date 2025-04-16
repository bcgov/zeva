import PropTypes from 'prop-types'
import React from 'react'
import ReactTooltip from 'react-tooltip'
import CustomPropTypes from '../../app/utilities/props'

const CreditTransferSignOff = (props) => {
  const {
    assertions,
    checkboxes,
    disableCheckboxes,
    handleCheckboxClick,
    hoverText,
    user
  } = props
  return (
    <>
      {hoverText && <ReactTooltip />}
      <div id="transfer-sign-off" data-tip={hoverText}>
        {assertions.map((assertion) => (
          <div key={assertion.id}>
            <div className="d-inline-block align-middle my-2 ml-2 mr-1">
              <input
                checked={
                  checkboxes.findIndex(
                    (checkbox) =>
                      parseInt(checkbox, 10) === parseInt(assertion.id, 10)
                  ) >= 0
                }
                disabled={disableCheckboxes}
                id={assertion.id}
                name="terms"
                onChange={(event) => {
                  handleCheckboxClick(event)
                }}
                type="checkbox"
              />
            </div>
            <label
              className={disableCheckboxes ? 'text-grey' : 'd-inline'}
              htmlFor={assertion.id}
              id="transfer-text"
            >
              {assertion.description.replace(
                /{user.organization.name}/g,
                user.organization.name
              )}
            </label>
          </div>
        ))}
      </div>
    </>
  )
}

CreditTransferSignOff.defaultProps = {
  assertions: [],
  checkboxes: [],
  disableCheckboxes: false,
  hoverText: ''
}
CreditTransferSignOff.propTypes = {
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  disableCheckboxes: PropTypes.bool,
  handleCheckboxClick: PropTypes.func.isRequired,
  hoverText: PropTypes.string,
  user: CustomPropTypes.user.isRequired
}

export default CreditTransferSignOff
