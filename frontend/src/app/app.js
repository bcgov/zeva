import axios from 'axios'
import React, { Component } from 'react'
import Keycloak from 'keycloak-js'

import Loading from './components/Loading'
import CONFIG from './config'
import Login from './Login'
import Router from './router'
import moment from 'moment-timezone'

import 'toastr/build/toastr.min.css'
import 'react-table/react-table.css'

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      authenticated: false,
      keycloak: null
    }
    
    moment.tz.setDefault("America/Vancouver")
    this.logout = this.logout.bind(this)
  }

  componentDidMount () {
    const keycloak = Keycloak({
      clientId: CONFIG.KEYCLOAK.CLIENT_ID,
      realm: CONFIG.KEYCLOAK.REALM,
      url: CONFIG.KEYCLOAK.AUTH_URL
    })

    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(5)
        .then((refreshed) => {
          if (refreshed) {
            const { token: newToken } = keycloak
            axios.defaults.headers.common.Authorization = `Bearer ${newToken}`
            if (keycloak.idToken) {
              window.sessionStorage.setItem('idToken', keycloak.idToken)
            }
            if (keycloak.refreshToken) {
              window.sessionStorage.setItem('refreshToken', keycloak.refreshToken)
            }
            if (keycloak.idTokenParsed?.exp) {
              window.sessionStorage.setItem('expiry', keycloak.idTokenParsed.exp)
            }
          }
        })
        .catch((err) => {
          console.log(err)
          this.logout()
        })
    }

    const authParams = {
      pkceMethod: 'S256',
      promiseType: 'native',
      onLoad: 'check-sso'
    }

    const idToken = window.sessionStorage.getItem('idToken')
    const refreshToken = window.sessionStorage.getItem('refreshToken')
    const expiry = window.sessionStorage.getItem('expiry')

    const now = Math.round(Date.now() / 1000)
    const expired = now > expiry

    if (idToken && refreshToken && !expired) {
      authParams.idToken = idToken
      authParams.refreshToken = refreshToken
    }

    keycloak
      .init(authParams)
      .then((authenticated) => {
        if (keycloak.idToken) {
          window.sessionStorage.setItem('idToken', keycloak.idToken)
        }
        if (keycloak.refreshToken) {
          window.sessionStorage.setItem('refreshToken', keycloak.refreshToken)
        }
        if (keycloak.idTokenParsed?.exp) {
          window.sessionStorage.setItem('expiry', keycloak.idTokenParsed.exp)
        }
        this.setState({
          keycloak,
          authenticated
        })
      })
  }

  logout () {
    this.setState({
      authenticated: false
    })

    const { keycloak } = this.state

    const idToken = sessionStorage.getItem('idToken')

    const kcLogoutUrl = keycloak.endpoints.logout() +
      '?post_logout_redirect_uri=' + CONFIG.KEYCLOAK.POST_LOGOUT_URL +
      '&client_id=' + keycloak.clientId +
      '&id_token_hint=' + idToken

    const url = CONFIG.KEYCLOAK.SM_LOGOUT_URL + encodeURIComponent(kcLogoutUrl)

    window.location = url
  }

  render () {
    const { authenticated, keycloak } = this.state

    if (!keycloak) {
      return <Loading />
    }

    if (keycloak && !authenticated) {
      const redirectUri = window.location.href
      return <Login keycloak={keycloak} redirectUri={redirectUri}/>
    }

    return <Router keycloak={keycloak} logout={this.logout} />
  }
}

export default App
