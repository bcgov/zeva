import React from 'react'
import { render } from '@testing-library/react'
import Alert from '../Alert'

describe('Alert', () => {
  it('renders with default props', () => {
    const { container } = render(<Alert />)
    expect(container).toMatchSnapshot()
  })

  it('renders with provided props', () => {
    const message = 'This is a sample message'
    const title = 'Sample title'
    const classname = 'sample-class'
    const icon = 'check-circle'
    const historyMessage = 'This is a sample history message'
    const status = 'SUCCESS'

    const { container } = render(
      <Alert
        message={message}
        title={title}
        classname={classname}
        icon={icon}
        historyMessage={historyMessage}
        status={status}
      />
    )

    expect(container.querySelector('.status-alert').classList.contains(classname)).toBe(true)
    expect(container.querySelector('svg')).toBeTruthy()
    expect(container.querySelectorAll('b')[0].textContent).toEqual(`${status}: ${title} —`)
    expect(container.querySelectorAll('b')[1].textContent).toEqual('History - ')
    expect(container.querySelectorAll('span')[1].textContent).toContain(message)
    expect(container.querySelectorAll('span')[1].textContent).toContain(historyMessage)
  })
})
