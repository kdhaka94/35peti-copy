import { AxiosResponse } from 'axios'
import React, { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import authService from '../../../../services/auth.service'
import mobileSubheader from '../../_layout/elements/mobile-subheader'

const PayMethod = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    bankName: '',
    upiId: '',
    upiName: '',
    ifscCode: '',
    accountNumber: '',
    accountHolderName: '',
  })
  const [qrFile, setQrFile] = useState<File | null>(null)

  React.useEffect(() => {
    getAccounts()
  }, [])

  const getAccounts = () => {
    authService.getPaymentAccounts().then((res: AxiosResponse<any>) => {
      setAccounts(res.data.data.accounts || [])
    })
  }

  const resetForm = () => {
    setFormData({
      bankName: '',
      upiId: '',
      upiName: '',
      ifscCode: '',
      accountNumber: '',
      accountHolderName: '',
    })
    setQrFile(null)
    setEditId(null)
    setShowForm(false)
    if (formRef.current) formRef.current.reset()
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQrFile(e.target.files[0])
    }
  }

  const handleEdit = (account: any) => {
    setEditId(account._id)
    setFormData({
      bankName: account.bankName || '',
      upiId: account.upiId || '',
      upiName: account.upiName || '',
      ifscCode: account.ifscCode || '',
      accountNumber: account.accountNumber || '',
      accountHolderName: account.accountHolderName || '',
    })
    setQrFile(null)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return
    authService.deletePaymentAccount(id).then((res: AxiosResponse<any>) => {
      toast.success(res.data.message)
      getAccounts()
    })
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData()
    data.append('bankName', formData.bankName)
    data.append('upiId', formData.upiId)
    data.append('upiName', formData.upiName)
    data.append('ifscCode', formData.ifscCode)
    data.append('accountNumber', formData.accountNumber)
    data.append('accountHolderName', formData.accountHolderName)
    if (qrFile) data.append('upiQrCode', qrFile)

    if (editId) {
      authService.updatePaymentAccount(editId, data).then((res: AxiosResponse<any>) => {
        toast.success(res.data.message)
        resetForm()
        getAccounts()
      })
    } else {
      authService.addPaymentAccount(data).then((res: AxiosResponse<any>) => {
        toast.success(res.data.message)
        resetForm()
        getAccounts()
      })
    }
  }

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Account Settings')}
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-12 mt-1'>
            <div className='add-account'>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h4 className='mb-0'>Payment Accounts ({accounts.length}/15)</h4>
                {!showForm && accounts.length < 15 && (
                  <button
                    className='btn btn-primary'
                    onClick={() => { resetForm(); setShowForm(true) }}
                  >
                    + Add Account
                  </button>
                )}
              </div>

              {showForm && (
                <div className='card mb-3'>
                  <div className='card-header'>
                    <h5 className='mb-0'>{editId ? 'Edit Account' : 'Add New Account'}</h5>
                  </div>
                  <div className='card-body'>
                    <form onSubmit={handleSubmit} ref={formRef}>
                      <div className='row'>
                        <div className='col-lg-6'>
                          <div className='form-group'>
                            <label>Bank Name *</label>
                            <input
                              type='text'
                              name='bankName'
                              className='form-control'
                              placeholder='Bank Name'
                              value={formData.bankName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className='col-lg-6'>
                          <div className='form-group'>
                            <label>Upi Id *</label>
                            <input
                              type='text'
                              name='upiId'
                              className='form-control'
                              placeholder='UPI Id'
                              value={formData.upiId}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className='col-lg-6'>
                          <div className='form-group'>
                            <label>Upi Name *</label>
                            <input
                              type='text'
                              name='upiName'
                              className='form-control'
                              placeholder='UPI Name'
                              value={formData.upiName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className='col-lg-6'>
                          <div className='form-group'>
                            <label>UPI QR Code *</label>
                            <input
                              type='file'
                              name='upiQrCode'
                              className='form-control'
                              accept='image/*'
                              onChange={handleFileChange}
                            />
                          </div>
                        </div>
                        <div className='col-lg-6'>
                          <div className='form-group'>
                            <label>IFSC Code *</label>
                            <input
                              type='text'
                              name='ifscCode'
                              className='form-control'
                              placeholder='IFSC Code'
                              value={formData.ifscCode}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className='col-lg-6'>
                          <div className='form-group'>
                            <label>Account Holder Name *</label>
                            <input
                              type='text'
                              name='accountHolderName'
                              className='form-control'
                              placeholder='Account Holder Name'
                              value={formData.accountHolderName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className='col-lg-6'>
                          <div className='form-group'>
                            <label>Account Number *</label>
                            <input
                              type='text'
                              name='accountNumber'
                              className='form-control'
                              placeholder='Account Number'
                              value={formData.accountNumber}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className='col-lg-12'>
                          <div className='tr'>
                            <button type='submit' className='btn btn-primary mr-2'>
                              {editId ? 'Update' : 'Submit'}
                            </button>
                            <button
                              type='button'
                              className='btn btn-secondary'
                              onClick={resetForm}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {accounts.length > 0 && (
                <div className='table-responsive'>
                  <table className='table table-striped table-bordered w-100'>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Bank Name</th>
                        <th>UPI Id</th>
                        <th>UPI Name</th>
                        <th>IFSC Code</th>
                        <th>Account Number</th>
                        <th>Account Holder</th>
                        <th>QR Code</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account: any, index: number) => (
                        <tr key={account._id}>
                          <td>{index + 1}</td>
                          <td>{account.bankName}</td>
                          <td>{account.upiId}</td>
                          <td>{account.upiName}</td>
                          <td>{account.ifscCode}</td>
                          <td>{account.accountNumber}</td>
                          <td>{account.accountHolderName}</td>
                          <td>
                            {account.upiQrCode && (
                              <a
                                href={process.env.REACT_APP_SITE_URL + account.upiQrCode}
                                target='_blank'
                                rel='noreferrer'
                              >
                                <img
                                  src={process.env.REACT_APP_SITE_URL + account.upiQrCode}
                                  width={30}
                                  alt='QR'
                                />
                              </a>
                            )}
                          </td>
                          <td>
                            <button
                              className='btn btn-sm btn-info mr-1'
                              onClick={() => handleEdit(account)}
                            >
                              Edit
                            </button>
                            <button
                              className='btn btn-sm btn-danger'
                              onClick={() => handleDelete(account._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {accounts.length === 0 && !showForm && (
                <p className='text-center text-muted'>No accounts added yet. Click "Add Account" to get started.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default PayMethod
