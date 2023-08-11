import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import AnalystRecommendationHeader from '../AnalystRecommendationHeader'

const baseSubmission = {}
const baseUser = {
  hasPermission: () => []
}
const baseHandleCheckboxClick = () => {}
const baseIssueAsMY = true

const baseProps = {
  submission: baseSubmission,
  user: baseUser,
  handleCheckboxClick: baseHandleCheckboxClick,
  issueAsMY: baseIssueAsMY
}

const getHasPermission = (permission) => {
  return (passedPermission) => {
    if (passedPermission === permission) {
      return true
    }
    return false
  }
}

describe('AnalystRecommendationHeader', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <AnalystRecommendationHeader
          {...baseProps}
        />
      </Router>
    )
  })

  describe('renders certain elements based on validation status and user permissions', () => {
    const runTests = (statuses, permissions, element, numberOfOccurences) => {
      for (const status of statuses) {
        for (const permission of permissions) {
          test(`renders "${element}" element when validation status is ${status} and user has permission ${permission}`, () => {
            const submission = {
              validationStatus: status
            }
            const user = {
              hasPermission: getHasPermission(permission)
            }
            const props = { ...baseProps, submission, user }
            const { queryAllByText } = render(
              <Router>
                <AnalystRecommendationHeader
                  {...props}
                />
              </Router>
            )
            expect(queryAllByText('Analyst Recommendation')).toHaveLength(numberOfOccurences)
          })
        }
      }
    }
    runTests(['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'CHECKED', 'REJECTED', 'VALIDATED'], ['RECOMMEND_SALES', 'SIGN_SALES'], 'Analyst Recommendation', 1)
    runTests(['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'REJECTED', 'VALIDATED'], ['RECOMMEND_SALES', 'SIGN_SALES'], 'View the credit application detail as processed by the analyst.', 1)
  })

  describe('disables checkbox based on validation status and user permissions', () => {
    const statuses = ['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'REJECTED', 'VALIDATED']
    const permissions = ['SIGN_SALES']
    for (const status of statuses) {
      for (const permission of permissions) {
        test(`analyst checkbox is disabled when validation status is ${status} and user has permission ${permission}`, () => {
          const submission = {
            validationStatus: status
          }
          const user = {
            hasPermission: getHasPermission(permission)
          }
          const props = { ...baseProps, submission, user }
          const { getByTestId } = render(
            <Router>
              <AnalystRecommendationHeader
                {...props}
              />
            </Router>
          )
          expect(getByTestId('analyst-checkbox')).toHaveProperty('disabled', true)
        })
      }
    }
  })
})
