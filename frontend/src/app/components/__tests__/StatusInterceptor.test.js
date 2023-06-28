import React from 'react'
import TestRenderer from 'react-test-renderer'
import { render, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StatusInterceptor from '../StatusInterceptor'

require('@babel/core')
require('@babel/polyfill')

afterEach(cleanup)

describe('status interceptor', () => {
  it('renders without crashing', () => {
    render(<StatusInterceptor />)
  })
  it('gives a 401 message', () => {
    const testRender = TestRenderer.create(
      <StatusInterceptor statusCode={401} />
    ).toJSON()
    expect(testRender.children[1].children[0].children).toEqual([
      "It looks like you don't have an account setup yet, or that you are trying to access a page that you do not have permissions to see."
    ])
  })
  it('gives a 403 message', () => {
    const testRender = TestRenderer.create(
      <StatusInterceptor statusCode={403} />
    ).toJSON()
    expect(testRender.children[1].children).toEqual([
      "It looks like you don't have the permission to access this page. If you're supposed to have access to the page. Please contact your administrator."
    ])
  })
  it('gives a 404 message', () => {
    const testRender = TestRenderer.create(
      <MemoryRouter>
        <StatusInterceptor statusCode={404} />
      </MemoryRouter>
    ).toJSON()
    expect(testRender.children[1].children[0].children).toEqual([
      'The requested page could not be found.'
    ])
  })
  it('gives a 500 message', () => {
    const testRender = TestRenderer.create(
      <StatusInterceptor statusCode={500} />
    ).toJSON()
    expect(testRender.children[1].children).toEqual([
      'It looks like our system is experiencing some technical difficulties. Please try again later.'
    ])
  })
  it('gives a 502 message', () => {
    const testRender = TestRenderer.create(
      <StatusInterceptor statusCode={502} />
    ).toJSON()
    expect(testRender.children[1].children).toEqual([
      'It looks like our system is currently down for maintenance. Please check back in a few minutes.'
    ])
  })
  it('gives a default message', () => {
    const testRender = TestRenderer.create(<StatusInterceptor />).toJSON()
    expect(testRender.children[1].children).toEqual([
      'It looks like our system is experiencing some technical difficulties. Please try again later.'
    ])
  })
})
