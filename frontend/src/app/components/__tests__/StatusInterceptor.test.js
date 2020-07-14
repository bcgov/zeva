import React from 'react';
import TestRenderer from 'react-test-renderer';
import {
  render, cleanup, getByTestId, fireEvent,
} from '@testing-library/react';
import StatusInterceptor from '../StatusInterceptor';

require('@babel/core');
require('@babel/polyfill');

afterEach(cleanup);

describe('status interceptor', () => {
  it('renders without crashing', () => {
    render(<StatusInterceptor />);
  });
  it('gives a 401 message', () => {
    const testRender = TestRenderer.create(<StatusInterceptor statusCode={401} />);
    const output = testRender.toJSON();
    expect(output.children[1].children[0].children).toEqual(["It looks like you don't have an account setup yet, or that you are trying to access a page that you do not have permissions to see."]);
  });
  it('gives a 403 message', () => {
    const testRender = TestRenderer.create(<StatusInterceptor statusCode={403} />);
    const output = testRender.toJSON();
    expect(output.children[1].children).toEqual(["It looks like you don't have the permission to access this page. If you\"re supposed to have access to the page. Please contact your administrator."]);
  });
  it('gives a 404 message', () => {
    const testRender = TestRenderer.create(<StatusInterceptor statusCode={404} />);
    const output = testRender.toJSON();
    expect(output.children[1].children[0].children).toEqual(['The requested page could not be found.']);
  });
  it('gives a 500 message', () => {
    const testRender = TestRenderer.create(<StatusInterceptor statusCode={500} />);
    const output = testRender.toJSON();
    expect(output.children[1].children).toEqual(['It looks like our system is experiencing some technical difficulties. We have been notified and will look into it. Please try again later.']);
  });
  it('gives a 502 message', () => {
    const testRender = TestRenderer.create(<StatusInterceptor statusCode={502} />);
    const output = testRender.toJSON();
    expect(output.children[1].children).toEqual(['It looks like our system is currently down for maintenance. Please check back in a few minutes.']);
  });
  it('gives a default message', () => {
    const testRender = TestRenderer.create(<StatusInterceptor />);
    const output = testRender.toJSON();
    expect(output.children[1].children).toEqual(['It looks like our system is experiencing some technical difficulties. We have been notified and will look into it. Please try again later.']);
  });
});
