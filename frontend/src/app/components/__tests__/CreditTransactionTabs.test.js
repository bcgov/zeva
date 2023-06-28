import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'
import ROUTES_CREDIT_REQUESTS from '../../routes/CreditRequests'
import ROUTES_CREDIT_TRANSFERS from '../../routes/CreditTransfers'
import ROUTES_CREDIT_AGREEMENTS from '../../routes/CreditAgreements'
import ROUTES_CREDITS from '../../routes/Credits'
import CreditTransactionTabs from '../CreditTransactionTabs'

jest.mock('../../config', () => ({
  FEATURES: {
    CREDIT_TRANSFERS: {
      ENABLED: true
    },
    CREDIT_AGREEMENTS: {
      ENABLED: true
    },
    INITIATIVE_AGREEMENTS: {
      ENABLED: false
    },
    PURCHASE_REQUESTS: {
      ENABLED: false
    }
  }
}))

let container = null
beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  unmountComponentAtNode(container)
  container.remove()
  container = null
})

describe('CreditTransactionTabs component', () => {
  it('should render the correct number of tabs for a government user', () => {
    const user = {
      isGovernment: true,
      hasPermission: () => true
    }

    act(() => {
      render(
        <MemoryRouter>
          <CreditTransactionTabs active="credit-transactions" user={user} />
        </MemoryRouter>,
        container
      )
    })
    expect(container.querySelectorAll('li').length).toBe(4)
  })

  it('should render the correct number of tabs for a non-government user', () => {
    const user = {
      isGovernment: false,
      hasPermission: () => true
    }

    act(() => {
      render(
        <MemoryRouter>
          <CreditTransactionTabs active="credit-transactions" user={user} />
        </MemoryRouter>,
        container
      )
    })

    expect(container.querySelectorAll('li').length).toBe(3)
  })

  it('should have the correct active tab set', () => {
    const user = {
      isGovernment: true,
      hasPermission: () => true
    }

    act(() => {
      render(
        <MemoryRouter>
          <CreditTransactionTabs active="credit-requests" user={user} />
        </MemoryRouter>,
        container
      )
    })

    const activeTab = container.querySelector('.nav-item.active')
    expect(activeTab.textContent).toBe('Credit Applications')
  })

  it('should render the correct links for each tab', () => {
    const user = {
      isGovernment: true,
      hasPermission: () => true
    }

    act(() => {
      render(
        <MemoryRouter>
          <CreditTransactionTabs active="credit-transactions" user={user} />
        </MemoryRouter>,
        container
      )
    })

    const links = container.querySelectorAll('li')
    const expectedLinks = [
      ROUTES_CREDIT_REQUESTS.LIST,
      ROUTES_CREDIT_TRANSFERS.LIST,
      ROUTES_CREDIT_AGREEMENTS.LIST,
      ROUTES_CREDITS.UPLOAD_VERIFICATION
    ]
    for (let i = 0; i < links.length; i++) {
      expect(links[i].firstChild.getAttribute('href')).toBe(expectedLinks[i])
    }
  })

  it('should show/hide the Credit Transactions tab based on user permission', () => {
    const userWithoutPermission = {
      isGovernment: true,
      hasPermission: () => false
    }

    act(() => {
      render(
            <MemoryRouter>
                <CreditTransactionTabs active="credit-transactions" user={userWithoutPermission} />
            </MemoryRouter>,
            container
      )
    })

    expect(container.querySelectorAll('li').length).toBe(2)

    const userWithPermission = {
      isGovernment: true,
      hasPermission: () => true
    }

    act(() => {
      render(
            <MemoryRouter>
                <CreditTransactionTabs active="credit-transactions" user={userWithPermission} />
            </MemoryRouter>,
            container
      )
    })

    expect(container.querySelectorAll('li').length).toBe(4)
  })
})
