/* eslint-disable */
import User from '../models/User'
import api from '../utils/api'

class AuthService {
  async login(user: User) {
    const res = await api.post('login', user)
    this.ipAddress()
    localStorage.setItem('token', res.data.data.token)
    localStorage.setItem('userType', res.data.data.role)
    localStorage.setItem('refreshToken', res.data.data.refreshToken)
    return res
  }

  async loginAdmin(user: User) {
    const res = await api.post('login-admin', user)
    this.ipAddress()
    if (res.data.data.authkey != 1) {
      localStorage.setItem('token-admin', res.data.data.token)
      localStorage.setItem('userType-admin', res.data.data.role)
      localStorage.setItem('refreshToken-admin', res.data.data.refreshToken)

    }
    else {
      localStorage.setItem('token-admin-two', res.data.data.token)
      localStorage.setItem('userType-admin', res.data.data.role)
    }
    return res
  }

  getUser() {
    return api.get('user-info')
  }

  staffLogin(data: any) {
    return api.post('login-staff', data)
  }


  refreshToken(token: string) {
    return api.post('refresh-token', { token })
  }

  getToken() {
    if (window.location.pathname.includes('admin')) {
      return localStorage.getItem('token-admin')
    }
    return localStorage.getItem('token')
  }

  ipAddress() {
    api
      .get(`${process.env.REACT_APP_IP_API_URL}`)
      .then((res) => {
        localStorage.setItem('ip_address', res.data.ip)
      })
      .catch((e) => {
        console.log(e.stack)
      })
  }

  gett10Streams() {
    return api
      .get(`${process.env.REACT_APP_T10_STREAM}`)
  }

  getIpAddress() {
    return localStorage.getItem('ip_address') || ''
  }

  getRefreshToken() {
    if (window.location.pathname.includes('admin')) {
      const token = localStorage.getItem('refreshToken-admin')
      if (token) return token
    }
    const token = localStorage.getItem('refreshToken')
    if (token) return token

    return ''
  }

  isLoggedIn() {
    return this.getToken() ? true : false
  }



  getSettingsList() {
    return api.get('setting-list')
  }

  saveSettingList(settingList: any) {
    return api.post('save-setting-list', { settingList })
  }

  // Payment Account CRUD (multi-account)
  getPaymentAccounts() {
    return api.get('payment-accounts')
  }
  createPaymentAccount(formData: any) {
    const token = this.getToken()
    return api.post('payment-account', formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    })
  }
  updatePaymentAccount(id: string, formData: any) {
    const token = this.getToken()
    return api.put(`payment-account/${id}`, formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    })
  }
  deletePaymentAccount(id: string) {
    return api.delete(`payment-account/${id}`)
  }
  togglePaymentAccountStatus(id: string) {
    return api.patch(`payment-account/${id}/toggle`)
  }
}
export default new AuthService()
