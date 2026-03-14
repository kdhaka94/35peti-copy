import { AxiosResponse } from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import authService from '../../../../services/auth.service'
import mobileSubheader from '../../_layout/elements/mobile-subheader'

const MAX_ACCOUNTS = 15

const emptyForm = {
  accountType: 'bank' as 'bank' | 'usdt',
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
  upiName: '',
  walletAddress: '',
  network: 'TRC20',
  isActive: true,
}

const PaymentAccountSettings = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = () => {
    setLoading(true)
    authService.getPaymentAccounts().then((res: AxiosResponse<any>) => {
      setAccounts(res.data?.data?.accounts || [])
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load accounts')
      setLoading(false)
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrFile(file)
      setQrPreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setQrFile(null)
    setQrPreview(null)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (account: any) => {
    setFormData({
      accountType: account.accountType || 'bank',
      bankName: account.bankName || '',
      accountHolderName: account.accountHolderName || '',
      accountNumber: account.accountNumber || '',
      ifscCode: account.ifscCode || '',
      upiId: account.upiId || '',
      upiName: account.upiName || '',
      walletAddress: account.walletAddress || '',
      network: account.network || 'TRC20',
      isActive: account.isActive,
    })
    setEditingId(account._id)
    setQrFile(null)
    setQrPreview(
      account.upiQrCode
        ? `${process.env.REACT_APP_SITE_URL}${account.upiQrCode}`
        : null,
    )
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value))
      })
      if (qrFile) {
        data.append('upiQrCode', qrFile)
      }

      if (editingId) {
        await authService.updatePaymentAccount(editingId, data)
        toast.success('Account updated successfully')
      } else {
        await authService.createPaymentAccount(data)
        toast.success('Account added successfully')
      }
      resetForm()
      fetchAccounts()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return
    try {
      await authService.deletePaymentAccount(id)
      toast.success('Account deleted')
      fetchAccounts()
    } catch {
      toast.error('Failed to delete account')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await authService.togglePaymentAccountStatus(id)
      toast.success('Status updated')
      fetchAccounts()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Account Settings')}
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-12 mt-1'>
            <div className='add-account'>
              {/* Header */}
              <div className='d-flex align-items-center justify-content-between mb-3 flex-wrap'>
                <h4 className='mb-0'>Account Settings</h4>
                <div className='d-flex align-items-center gap-2'>
                  <span className='badge bg-info text-dark' style={{ fontSize: '13px', padding: '6px 12px' }}>
                    {accounts.length} / {MAX_ACCOUNTS} Accounts
                  </span>
                  {!showForm && accounts.length < MAX_ACCOUNTS && (
                    <button
                      className='btn btn-success btn-sm'
                      onClick={() => { resetForm(); setShowForm(true) }}
                    >
                      + Add Account
                    </button>
                  )}
                </div>
              </div>

              {/* Add/Edit Form */}
              {showForm && (
                <div className='card mb-3'>
                  <div className='card-header bg-dark text-white'>
                    <h5 className='mb-0'>{editingId ? 'Edit Account' : 'Add New Account'}</h5>
                  </div>
                  <div className='card-body'>
                    <form onSubmit={handleSubmit}>
                      <div className='row'>
                        {/* Account Type Selector */}
                        <div className='col-lg-12 mb-3'>
                          <div className='form-group'>
                            <label>Account Type *</label>
                            <div className='d-flex' style={{ gap: '10px' }}>
                              <button type='button' className={`btn ${formData.accountType === 'bank' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setFormData(prev => ({ ...prev, accountType: 'bank' }))}>
                                🏦 Bank / UPI
                              </button>
                              <button type='button' className={`btn ${formData.accountType === 'usdt' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setFormData(prev => ({ ...prev, accountType: 'usdt' }))}>
                                💰 USDT
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bank Fields - shown only for bank type */}
                        {formData.accountType === 'bank' && (
                          <>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <label>Bank Name *</label>
                                <input type='text' name='bankName' className='form-control' value={formData.bankName} onChange={handleChange} required />
                              </div>
                            </div>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <label>Account Holder Name *</label>
                                <input type='text' name='accountHolderName' className='form-control' value={formData.accountHolderName} onChange={handleChange} required />
                              </div>
                            </div>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <label>Account Number *</label>
                                <input type='text' name='accountNumber' className='form-control' value={formData.accountNumber} onChange={handleChange} required />
                              </div>
                            </div>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <label>IFSC Code *</label>
                                <input type='text' name='ifscCode' className='form-control' value={formData.ifscCode} onChange={handleChange} required />
                              </div>
                            </div>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <label>UPI ID *</label>
                                <input type='text' name='upiId' className='form-control' value={formData.upiId} onChange={handleChange} required />
                              </div>
                            </div>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <label>UPI Name</label>
                                <input type='text' name='upiName' className='form-control' value={formData.upiName} onChange={handleChange} />
                              </div>
                            </div>
                          </>
                        )}

                        {/* USDT Fields - shown only for usdt type */}
                        {formData.accountType === 'usdt' && (
                          <>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <label>Wallet Address *</label>
                                <input type='text' name='walletAddress' className='form-control' value={formData.walletAddress} onChange={handleChange} required placeholder='e.g. TXyz123...' />
                              </div>
                            </div>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <label>Network *</label>
                                <select name='network' className='form-control' value={formData.network} onChange={handleChange as any} required>
                                  <option value='TRC20'>TRC20 (Tron)</option>
                                  <option value='ERC20'>ERC20 (Ethereum)</option>
                                  <option value='BEP20'>BEP20 (BSC)</option>
                                </select>
                              </div>
                            </div>
                          </>
                        )}

                        {/* QR Code - shown for both types */}
                        <div className='col-lg-6'>
                          <div className='form-group'>
                            <label>QR Code Image</label>
                            <input type='file' className='form-control' accept='image/jpeg,image/jpg,image/png,image/webp' onChange={handleFileChange} />
                            {qrPreview && (
                              <img src={qrPreview} alt='QR Preview' style={{ width: 80, height: 80, objectFit: 'contain', marginTop: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                            )}
                          </div>
                        </div>
                        <div className='col-lg-6 d-flex align-items-center'>
                          <div className='form-check mt-3'>
                            <input type='checkbox' className='form-check-input' name='isActive' checked={formData.isActive} onChange={handleChange} id='isActiveCheck' />
                            <label className='form-check-label' htmlFor='isActiveCheck'>Active (visible to users)</label>
                          </div>
                        </div>
                        <div className='col-lg-12 mt-2'>
                          <button type='submit' className='btn btn-primary mr-2' disabled={submitting}>
                            {submitting ? 'Saving...' : editingId ? 'Update Account' : 'Add Account'}
                          </button>
                          <button type='button' className='btn btn-secondary' onClick={resetForm}>Cancel</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Accounts Table */}
              {loading ? (
                <p>Loading...</p>
              ) : accounts.length === 0 ? (
                <p className='text-center text-muted p-4'>No accounts added yet.</p>
              ) : (
                <div className='table-responsive'>
                  <table className='table table-bordered table-striped'>
                    <thead className='thead-dark'>
                      <tr>
                        <th>#</th>
                        <th>Type</th>
                        <th>Bank / Wallet</th>
                        <th>Holder / Network</th>
                        <th>Account No. / Address</th>
                        <th>UPI ID</th>
                        <th>QR</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc: any, index: number) => (
                        <tr key={acc._id} style={{ opacity: acc.isActive ? 1 : 0.5 }}>
                          <td>{index + 1}</td>
                          <td>
                            <span className={`badge ${acc.accountType === 'usdt' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                              {acc.accountType === 'usdt' ? '💰 USDT' : '🏦 Bank'}
                            </span>
                          </td>
                          <td>{acc.accountType === 'usdt' ? '—' : acc.bankName}</td>
                          <td>{acc.accountType === 'usdt' ? acc.network : acc.accountHolderName}</td>
                          <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {acc.accountType === 'usdt' ? acc.walletAddress : acc.accountNumber}
                          </td>
                          <td>{acc.accountType === 'usdt' ? '—' : acc.upiId}</td>
                          <td>
                            {acc.upiQrCode ? (
                              <img
                                src={`${process.env.REACT_APP_SITE_URL}${acc.upiQrCode}`}
                                alt='QR'
                                style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4 }}
                              />
                            ) : '—'}
                          </td>
                          <td>
                            <span
                              className={`badge ${acc.isActive ? 'bg-success' : 'bg-danger'}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleToggle(acc._id)}
                              title='Click to toggle'
                            >
                              {acc.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button className='btn btn-warning btn-sm mr-1' onClick={() => handleEdit(acc)}>Edit</button>
                            <button className='btn btn-danger btn-sm' onClick={() => handleDelete(acc._id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentAccountSettings
