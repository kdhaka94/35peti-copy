import api from '../utils/api'

class UserService {
  getUserList({ username, type, search, status, page }: any) {
    const getStatus = status ? status : ''
    if (username)
      return api.get(
        `/get-user-list/?username=${username}&search=${search}&type=${type}&status=${getStatus}&page=${page}`,
      )

    if (search && type)
      return api.get(
        `/get-user-list/?search=${search}&type=${type}&status=${getStatus}&page=${page}`,
      )

    return api.get(`/get-user-list?status=${getStatus}&page=${page}`)
  }

  getUserBook() {
    return api.get('/get-user-book')
  }

  getUserDetail(username: string) {
    return api.get(`/get-user-detail/?username=${username}`)
  }
cerateStaff(data:any) {
    return api.post(`/create-staff`,data)
  }


  getParentUserDetail(username: string) {
    return api.get(`/get-parent-user-detail/?username=${username}`)
  }

  getUsercompletedbets22() {
    return api.get(`/alluserbetList22`)
  }



  Auth2Factor(data:any){
    return api.post(`/auth-two`,data)
  }
  

  addUser(data: any) {
    return api.post('/register', data)
  }

  updatePassword(data: any) {
    return api.post('/update-user', data)
  }

  updateDepositBalance(data: any) {
    return api.post('/user-account-balance', data)
  }

  updateUserExposureAndCreditLimit(data: any) {
    return api.post('/update-user-wallet', data)
  }

  updateUserWhatsapp(data: any) {
    return api.post('/update-user-whatsapp', data)
  }

  updateUserStake(data: any) {
    return api.post('/save-user-stake', data)
  }

  getUserStake() {
    return api.get('/get-user-stake')
  }
  updateUserAndBetStatus(data: any) {
    return api.post('/update-user-status', data)
  }
  updateuserpassword(data: any) {
    return api.post('/update-password', data)
  }
  addTransactionPassword(data: any) {
    return api.post('/add-transaction-password', data)
  }

  getUserBalance() {
    return api.get('/get-user-balance')
  }
  getUsercompletedbets(page: number, data: any) {
    return api.post(`/alluserbetList?page=${page}`, data)
  }

  getUserListSuggestion(data: any) {
    return api.post(`get-user-list-suggestion`, data)
  }

  saveGeneralSetting(data: any) {
    return api.post(`save-general-setting`, data)
  }

  resetTxnPassword(data: any) {
    return api.post(`reset-transaction-password`, data)
  }

  getExposerEvent() {
    return api.get('/get-exposer-event')
  }

  loginReports(data:any){
    return api.post('/login-report', data)
  }
   enableButton(data:any){
    return api.post('/resend-telegram-otp-after-login', data)
  }
   VerifyOtp(data:any){
    return api.post('/disable-telegram-otp', data)
  }

  VerifyOtptwo(data:any){
    return api.post(`/verify-otp`,data)
  }
}

export default new UserService()
