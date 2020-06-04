import Autosuggest from 'react-autosuggest';
import React, { useState } from 'react';

// Imagine you have a list of languages that you'd like to autosuggest.
const languages = [
  {
    name: 'C',
    year: 1972,
  },
  {
    name: 'Elm',
    year: 2012,
  },
];

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (value) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : languages.filter((lang) => lang.name.toLowerCase().slice(0, inputLength) === inputValue);
};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = (suggestion) => suggestion.name;

// Use your imagination to render suggestions.
const renderSuggestion = (suggestion) => (
  <div>
    {suggestion.name}
  </div>
);

const AutocompleteInput = (props) => {
  const {
    makes,
    errorMessage,
    handleInputChange,
    label,
    id,
    details,
    mandatory,
  } = props;
  const [rowClass, setRowClass] = useState('form-group row');
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [validationErrors, setValidationErrors] = useState('');

  const onChange = (event, { newValue }) => {
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
    placeholder: '',
    value,
    onChange,
  };

  return (
    <div className={rowClass}>
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


// import PropTypes from 'prop-types';



//   const { suggestions } = useState('');

//   const handleOnBlur = (event) => {
//     const { value } = event.target;
//     if (value === '' && mandatory === true) {
//       setValidationErrors(`${label} cannot be left blank`);
//       setRowClass('form-group row error');
//     }
//     if (value !== '' || !mandatory) {
//       setValidationErrors('');
//       setRowClass('form-group row');
//     }
//   };


//   const inputProps = {
//     placeholder: 'Type a programming language',
//     value,
//     onChange: this.onChange,
//   };
//   return (
//     <div className={rowClass}>
//       <label
//         className="col-sm-4 col-form-label"
//         htmlFor={id}
//       >
//         {label}
//       </label>
//       <div className="col-sm-8">
//         {details && (<small className="form-text text-muted">{details}</small>) }
//         <Autosuggest
//           suggestions={suggestions}
//           onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
//           onSuggestionsClearRequested={this.onSuggestionsClearRequested}
//           getSuggestionValue={getSuggestionValue}
//           renderSuggestion={renderSuggestion}
//           inputProps={inputProps}
//         />
//         <small className="form-text text-danger">{errorMessage || validationErrors}</small>
//       </div>
//     </div>


//   );
// };

// AutocompleteInput.defaultProps = {
//   details: '',
//   errorMessage: '',
//   mandatory: false,
// };

// AutocompleteInput.propTypes = {
//   details: PropTypes.string,
//   errorMessage: PropTypes.oneOfType([
//     PropTypes.bool,
//     PropTypes.string,
//   ]),
//   handleInputChange: PropTypes.func.isRequired,
//   id: PropTypes.string.isRequired,
//   label: PropTypes.string.isRequired,
//   mandatory: PropTypes.bool,
// };
// export default AutocompleteInput;
