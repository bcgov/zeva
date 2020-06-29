import React from 'react';
import {
  render, cleanup, getByTestId, fireEvent,
} from '@testing-library/react';
import TextInput from '../TextInput';

require('@babel/core');
require('@babel/polyfill');

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
      <TextInput label="Model" id="modelName" name="modelName" defaultValue="a" mandatory handleInputChange={handleInputChange} />,
    );
    const input = utils.getByTestId('input-test');
    return {
      input,
      ...utils,
    };
  };

  it('gives an error message when nothing is entered into a mandatory field and removes it when something is added', () => {
    const { input } = setup2();
    input.focus();
    fireEvent.change((input), {
      target: { value: '' },
    });
    input.blur();
    expect(input.value).toBe('');
    expect(input.parentElement.parentElement.className).toBe('form-group row error');
    input.focus();
    fireEvent.change((input), {
      target: { value: 'test' },
    });
    input.blur();
    expect(input.value).toBe('test');
    expect(input.parentElement.parentElement.className).toBe('form-group row');
  });

  const notMandatorySetup = () => {
    const utils = render(
      <TextInput label="Model" id="modelName" name="modelName" defaultValue="a" num handleInputChange={handleInputChange} />,
    );
    const input = utils.getByTestId('input-test');
    return {
      input,
      ...utils,
    };
  };

  it('it does not give an error if nothing is entered on an optional field', () => {
    const { input } = notMandatorySetup();
    input.focus();
    fireEvent.change((input), {
      target: { value: '' },
    });
    input.blur();
    expect(input.value).toBe('');
    expect(input.parentElement.parentElement.className).toBe('form-group row');
  });
  it('has an integer type if a number is required', () => {
    const { input } = notMandatorySetup();
    expect(input.type).toBe('number');
  });
});
