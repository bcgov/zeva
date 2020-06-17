import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TextInput from '../TextInput';
import '@testing-library/jest-dom/extend-expect';

const handleInputChange = (event) => {
  const { value, name } = event.target;
  console.log(value);
};

describe('Text Input', () => {
  it('renders without crashing', () => {
    render(<TextInput
      defaultValue="hello"
      errorMessage="name"
      handleInputChange={handleInputChange}
      id="LegalOrganizationName"
      label="Legal Organization Name"
      mandatory
      name="name"
    />);
  });
});
