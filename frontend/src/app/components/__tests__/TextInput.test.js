import React from 'react';
import {
  render, cleanup, getByTestId, fireEvent, waitForElement,
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
    const { container, getByTestId } = render(
      <TextInput label="Model" id="modelName1" name="modelName1" defaultValue="a" mandatory handleInputChange={handleInputChange} />,
    );
    return {
      container,
      input: container.querySelector('input'),
    };
  };

  it('gives an error message when nothing is entered into a mandatory field and removes it when something is added', async () => {
    const { container, input } = setup2();
    input.value = '';
    input.blur();
    fireEvent.focus(container.querySelector('label'));
    expect(input.value).toBe('');
    fireEvent.blur(input);
    expect(container.querySelector('.row').className).toBe('form-group row error');
    input.focus();
    input.value = 'test';
    expect(input.value).toBe('test');
    fireEvent.blur(input);
    expect(container.querySelector('.row').className).toBe('form-group row');
  });

  const notMandatorySetup = () => {
    const utils = render(
      <TextInput label="Model" id="modelName" name="modelName" defaultValue="1" num handleInputChange={handleInputChange} />,
    );
    const input = utils.getByTestId('input-test');
    return {
      input,
      ...utils,
    };
  };

  it('it does not give an error if nothing is entered on an optional field', () => {
    const { input } = notMandatorySetup();
    // console.log('before: ', input.value)
    input.focus();
    input.value = '';
    // console.log('after: ', input.value)
    expect(input.value).toBe('');
    fireEvent.blur(input);
    expect(input.parentElement.parentElement.parentElement.className).toBe('form-group row');
  });
  it('has an integer type if a number is required', () => {
    const { input } = notMandatorySetup();
    expect(input.type).toBe('number');
  });
});
