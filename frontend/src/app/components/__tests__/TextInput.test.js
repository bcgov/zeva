import React from 'react';
import { render } from '@testing-library/react';
import TextInput from '../TextInput';

const sampleProps = {
  label: 'Model',
  id: 'modelName',
  name: 'modelName',
  defaultValue: 'test value',
  mandatory: true,
};

const handleInputChange = (event) => {
  const { value, name } = event.target;
  const input = value.trim();
  return ({ name: input });
};
it('renders without crashing', () => {
  render(<TextInput sampleProps handleInputChange />);
});
