import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Button from '../Button'
import history from '../../History'

jest.mock('../../History', () => ({
  push: jest.fn(),
  goBack: jest.fn()
}))

afterEach(cleanup)

describe('Button component', () => {
  it('should render a button with the text "Back" and an arrow-left icon', () => {
    const { getByText, getByTestId } = render(<Button buttonType="back" testid="back-button" />)
    const button = getByTestId('back-button')
    const text = getByText('Back')

    expect(button).toContainElement(text)
    expect(button).toHaveClass('button')
    expect(button).toHaveAttribute('type', 'button')
    expect(button).not.toBeDisabled()
  })

  it('should call history.goBack when the back button is clicked', () => {
    const { getByTestId } = render(<Button buttonType="back" testid="back-button" />)
    const button = getByTestId('back-button')

    fireEvent.click(button)
    expect(history.goBack).toHaveBeenCalled()
  })

  it('should render a disabled button with the text "Delete" and a trash icon', () => {
    const { getByText, getByTestId } = render(
      <Button buttonType="delete" disabled testid="delete-button" />
    )
    const button = getByTestId('delete-button')
    const text = getByText('Delete')

    expect(button).toContainElement(text)
    expect(button).toHaveClass('button text-danger')
    expect(button).toBeDisabled()
  })

  it('should call the action prop when the submit button is clicked', () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(
      <Button buttonType="submit" action={handleClick} testid="submit-button" />
    )
    const button = getByTestId('submit-button')

    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render a button with the custom text and icon provided', () => {
    const { getByText, getByTestId } = render(
      <Button
        buttonType="submit"
        optionalText="Custom text"
        optionalIcon="plus"
        testid="custom-button"
      />
    )
    const button = getByTestId('custom-button')
    const text = getByText('Custom text')

    expect(button).toContainElement(text)
    expect(button).toHaveAttribute('type', 'button')
    expect(button).not.toBeDisabled()
  })
})
