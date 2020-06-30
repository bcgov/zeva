import React from 'react';
import {
  render, cleanup, getByTestId, fireEvent, getByPlaceholderText,
} from '@testing-library/react';
import AutocompleteInput from '../AutocompleteInput';

require('@babel/core');
require('@babel/polyfill');

afterEach(cleanup);

describe('autocomplete input', () => {
  const handleInputChange = (event) => {
    const { value, name } = event.target;
    const input = value.trim();
    return ({ name: input });
  };

  it('renders without crashing', () => {
    render(<AutocompleteInput label="Model" id="modelName" name="modelName" defaultValue="test" mandatory possibleChoicesList={['one', 'two', 'three']} handleInputChange={handleInputChange} />);
  });
  // const setup = () => {
  //   const utils = render(
  //     <AutocompleteInput label="Model" id="modelName" name="modelName" defaultValue="TEST!!!!!!" mandatory possibleChoicesList={['one', 'two', 'three']} handleInputChange={handleInputChange} />
  //   );
  //   const input = getByPlaceholderText('Enter Model');
  //   return {
  //     input,
  //     ...utils,
  //   };
  // };
  // it('renders with default value if provided', () => {
  //   const { input } = setup();
  //   // console.log('input: ', input)
  //   console.log('....', input)
  //   // expect(input.defaultValue).toBe('test');
  // });
});
