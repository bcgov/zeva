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
    handleInputChange,
    name,
  } = props;
  const [rowClass, setRowClass] = useState('form-group row');
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  const [validationErrors, setValidationErrors] = useState('');

  const handleOnBlur = (event) => {
    const { value: targetValue } = event.target;
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
  const getSuggestionValue = (suggestion) => {
    handleInputChange({
      target: {
        name,
        value: suggestion,
      },
    });

    return suggestion;
  };

  // Use your imagination to render suggestions.
  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion}
    </div>
  );


  const onChange = (event, { newValue }) => {
    if (event.target.name) {
      handleInputChange(event);
    }

    setValue(newValue);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  // Autosuggest will pass through all these props to the input.
  const inputProps = {
    // placeholder: defaultValue,
    value,
    onChange,
    name,
    onBlur: (event) => {
      handleOnBlur(event);
    },
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
        />
        <small className="form-text text-danger">{errorMessage || validationErrors}</small>
      </div>
    </div>
  );
};
export default AutocompleteInput;


AutocompleteInput.defaultProps = {
  defaultValue: '',
  errorMessage: '',
  mandatory: false,
  possibleChoicesList: [],
};

AutocompleteInput.propTypes = {
  errorMessage: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
  ]),
  defaultValue: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  handleInputChange: PropTypes.func.isRequired,
  possibleChoicesList: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  mandatory: PropTypes.bool,
  name: PropTypes.string.isRequired,
};
