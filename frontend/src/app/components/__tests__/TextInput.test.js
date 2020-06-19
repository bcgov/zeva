import React from 'react';
import {
  render, cleanup, getByTestId, fireEvent,
} from '@testing-library/react';
import TextInput from '../TextInput';

afterEach(cleanup);

describe('text input', () => {
  const handleInputChange = (event) => {
    const { value, name } = event.target;
    const input = value.trim();
    return ({ name: input });
  };

  it('renders without crashing', () => {
    render(<TextInput label="Model" id="modelName" name="modelName" defaultValue="test" mandatory handleInputChange={handleInputChange} />);
  });

  const setup = () => {
    const utils = render(
      <TextInput label="Model" id="modelName" name="modelName" defaultValue="test" mandatory handleInputChange={handleInputChange} />,
    );
    const input = utils.getByTestId('input-test');
    return {
      input,
      ...utils,
    };
  };
  it('renders with default value if provided', () => {
    const { input } = setup();
    expect(input.defaultValue).toBe('test');
  });

  const setup2 = () => {
    const utils = render(
      <TextInput label="Model" id="modelName" name="modelName" defaultValue="" mandatory handleInputChange={handleInputChange} />,
    );
    const input = utils.getByTestId('input-test');
    return {
      input,
      ...utils,
    };
  };

  it('gives an error message when nothing is entered into a mandatory field', () => {
    const { input } = setup2();
    input.simulate('focus');
    fireEvent.keyPress(input, {
      key: 'Backspace',
      code: 'Backspace',
      keyCode: 8,
      charCode: 8,
    });
    input.simulate('blur');
    expect(input.value).toBe('');
    expect(input.className).toBe('form-group row error');
  });
});
