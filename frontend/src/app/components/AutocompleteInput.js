import Autosuggest from 'react-autosuggest';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AutocompleteInput = (props) => {
  const {
    label,
    id,
    defaultValue,
    mandatory,
    possibleChoicesList,
    errorMessage,
    setFields,
    fields,
  } = props;
  const [rowClass, setRowClass] = useState('form-group row');
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [validationErrors, setValidationErrors] = useState('');

  const handleOnBlur = (event) => {
    const { targetValue } = event.target;
    if (targetValue === '' && mandatory === true) {
      setValidationErrors(`${label} cannot be left blank`);
      setRowClass('form-group row error');
    }
    if (targetValue !== '' || !mandatory) {
      setValidationErrors('');
      setRowClass('form-group row');
    }
  };
  // Teach Autosuggest how to calculate suggestions for any given input value.
  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : possibleChoicesList.filter((item) => item.toLowerCase().slice(0, inputLength) === inputValue);
  };

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  const getSuggestionValue = (suggestion) => suggestion;

  // Use your imagination to render suggestions.
  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion}
    </div>
  );


  const onChange = (event, { newValue }) => {
    setValue(newValue);
    setFields({ ...fields, make: newValue.toUpperCase() });
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  // Autosuggest will pass through all these props to the input.
  const inputProps = {
    placeholder: '',
    value,
    onChange,
  };

  return (
    <div id="autocomplete-container" className={rowClass}>
      <label
        className="col-sm-4 col-form-label"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="col-sm-8">
        <Autosuggest
          className="form-control"
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          onBlur={handleOnBlur}
        />
        <small className="form-text text-danger">{errorMessage || validationErrors}</small>
      </div>
    </div>
  );
};
export default AutocompleteInput;


AutocompleteInput.defaultProps = {
  details: '',
  errorMessage: '',
  mandatory: false,
};

AutocompleteInput.propTypes = {
  details: PropTypes.string,
  errorMessage: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
  ]),
  possibleChoicesList: PropTypes.arrayOf.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  mandatory: PropTypes.bool,
};
