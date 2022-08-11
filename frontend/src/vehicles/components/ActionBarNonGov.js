import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import history from '../../app/History';

const ActionBarNonGov = (props) => {
  const { handleClear, filtered, setFiltered } = props;
  const [showInactive, setShowInactive] = useState(false);
  const handleChangeShowActive = (event) => {
    const { id, value } = event.target;
    let newFiltered = [...filtered];
    newFiltered = newFiltered.filter((each) => each.id !== id);
    setFiltered([
      ...newFiltered,
      { id, value: value === 'true' ? 'Yes' : 'No' }
    ]);
  };
  return (
    <div className="action-bar no-bg p-0 m-0 justify-content-end">
      <span className="right-content d-block d-md-flex d-lg-flex d-xl-flex">
        <button
          className="button"
          onClick={handleClear}
          type="button"
          disabled={filtered.length === 0}
        >
          Clear Filters
        </button>
        <button
          className="button"
          onClick={(event) => {
            setShowInactive((prevState) => !prevState);
            handleChangeShowActive(event);
          }}
          type="button"
          value={!!showInactive}
          id="is-active"
        >
          {showInactive ? 'Show Active ZEV' : 'Show Inactive ZEV'}
        </button>
        <button
          className="button primary"
          onClick={() => {
            history.push('/vehicles/add');
          }}
          type="button"
        >
          <FontAwesomeIcon icon="plus" /> New Vehicle
        </button>
      </span>
    </div>
  );
};

ActionBarNonGov.defaultProps = {};

ActionBarNonGov.propTypes = {
  handleClear: PropTypes.func.isRequired,
  filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiltered: PropTypes.func.isRequired
};

export default ActionBarNonGov;
