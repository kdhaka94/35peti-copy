import api from '../utils/api'

class DepositWithdrawService {
  addBankAccount(payload: any) {
    return api.post(`add-bank-account`, payload)
  }
  addUpiAccount(payload: any) {
    return api.post(`add-upi`, payload)
  }
  deleteUpiBank(payload: any) {
    return api.post(`delete-upi-bank`, payload)
  }
  addDepositWithdraw(obj: any) {
    return api.post(`add-deposit-withdraw`, obj, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    })
  }
  getDepositWithdrawLists(obj: {
    type: string
    username?: string
    startDate?: string
    endDate?: string
    reportType?: string
  }) {
    return api.post(`get-deposit-withdraw-list`, obj)
  }

  getDepositWithdrawListstwo(obj: {
    type: string
    username?: string
    startDate?: string
    endDate?: string
    reportType?: string
    parentId?: String
  }) {
    return api.post(`get-deposit-withdraw-list-two`, obj)
  }


  staffList() {
    return api.get('staff-list')
  }

  deleteStaff(data: any) {
    return api.post('delete-staff', data)
  }



  getBankAndUpiLists() {
    return api.get('get-bank-and-upi-list')
  }
  getSettingList() {
    return api.get('get-setting-list')
  }
  getPaymentSetting() {
    return api.get('active-payment-accounts')
  }
  updateDepositWithdrawStatus(obj: {
    id?: string
    narration?: string
    balanceUpdateType?: string
    status?: string
  }) {
    return api.post(`update-deposit-withdraw-status`, obj)
  }
}
export default new DepositWithdrawService()
