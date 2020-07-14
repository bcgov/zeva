import React from 'react';
import { cleanup } from '@testing-library/react';
import parseErrorResponse from '../parseErrorResponse';

afterEach(cleanup);

describe('parse error response', () => {
  it('should return the error message as a single line instead of an array', () => {
    const err = {};
    const errorData = { name: ['this field is required'] };
    parseErrorResponse(err, errorData);
    expect(err).toStrictEqual({ name: 'this field is required' });
  });
  it('should return a flat error message for objects that contain other objects', () => {
    const err = {};
    const errorData = { organization: { name: ['this field is required'] } };
    parseErrorResponse(err, errorData);
    expect(err).toStrictEqual({ name: 'this field is required' });
  });
});
