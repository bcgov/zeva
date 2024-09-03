import PropTypes from 'prop-types'
import React from 'react'
import ReactTooltip from 'react-tooltip'
import CustomPropTypes from '../../app/utilities/props'

const ComplianceReportSignOff = (props) => {
  const {
    assertions,
    checkboxes,
    handleCheckboxClick,
    disabledCheckboxes,
    hoverText,
    user
  } = props

  return (
    <div id="compliance-sign-off" className="my-3">
      <ReactTooltip />
      <div data-tip={hoverText}>
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
                id={assertion.id}
                name="confirmations"
                onChange={(event) => {
                  handleCheckboxClick(event)
                }}
                type="checkbox"
                disabled={disabledCheckboxes}
              />
            </div>
            <label
              className={`d-inline ml-2 text-blue ${
                disabledCheckboxes ? '' : 'clickable'
              }`}
              htmlFor={assertion.id}
              id="confirmation-text"
            >
              {assertion.description.replace(
                /{user.organization.name}/g,
                user.organization.name
              )}
            </label>
          </div>
          ))}
      </div>
    </div>
  )
}

ComplianceReportSignOff.defaultProps = {
  assertions: [],
  checkboxes: [],
  disabledCheckboxes: '',
  hoverText: ''
}
ComplianceReportSignOff.propTypes = {
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  user: CustomPropTypes.user.isRequired,
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  handleCheckboxClick: PropTypes.func.isRequired,
  hoverText: PropTypes.string,
  disabledCheckboxes: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
}

export default ComplianceReportSignOff
