import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CreditAgreementsFilter = (props) => {
    const {
        items,
        handleClear,
        filtered,
        setFiltered
    } = props;

    const getOptions = (inputObj, displayField) => {
        const uniqueArr = [...new Set(inputObj.map((eachAgreement) => {
          if (typeof eachAgreement[displayField] === 'string') {
            return eachAgreement[displayField];
          }
    
          return eachAgreement[displayField].shortName || eachAgreement[displayField].name;
        }))];
        return uniqueArr.sort().map((each) => (
          <option key={each}>{each}</option>
        ));
      };
    
    const handleChange = (event) => {
        const { id, value } = event.target;
        let newFiltered = [...filtered];
        newFiltered = newFiltered.filter((each) => (each.id !== id));
        setFiltered([...newFiltered, { id, value }]);
    };      
          
    return (
        <div className="action-bar p-2 justify-content-end action-bar-background">
            <span className="right-content d-block d-md-flex d-lg-flex d-xl-flex">
                <label className="my-0">Filter by supplier/status</label>
                <select
                    className="form-control"
                    id="col-supplier"
                    onChange={handleChange}
                    value={filtered.length > 0 && filtered.findIndex((arr) => (arr.id === 'col-supplier')) >= 0 ? filtered[filtered.findIndex((arr) => (arr.id === 'col-supplier'))].value : ''}>
                    <option value=""> </option>
                    {getOptions(items, 'supplier')}
                </select>
                <select
                    className="form-control"
                    id="col-status"
                    onChange={handleChange}
                    value={filtered.length > 0 && filtered.findIndex((arr) => (arr.id === 'col-status')) >= 0 ? filtered[filtered.findIndex((arr) => (arr.id === 'col-status'))].value : ''}>
                    <option value=""> </option>
                    {getOptions(items, 'status')}
                </select>
                <button
                    className="button"
                    onClick={handleClear}
                    type="button">
                    Clear Filters
                </button>
                <button
                  className="button primary"
                  type="button">
                  <FontAwesomeIcon icon="plus" /> New Transaction
                </button>
            </span>
      </div>         
    )
} 

CreditAgreementsFilter.propTypes = {
    handleClear: PropTypes.func.isRequired,
    filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
    setFiltered: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape).isRequired,
  };

export default CreditAgreementsFilter;

