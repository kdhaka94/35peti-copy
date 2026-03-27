import React, { useState } from 'react'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import depositWithdrawService from '../../services/deposit-withdraw.service'

const AddQrModalPari = ({ onSuccess }: { onSuccess: () => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const validationSchema = Yup.object().shape({
    upiId: Yup.string().required('UPI Id is required'),
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(validationSchema) })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    }
  }

  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      toast.error('Please select a QR code image')
      return
    }

    if (data) {
      const formData = new FormData()
      formData.append('upiId', data.upiId)
      formData.append('qrImage', selectedFile)

      const response = await depositWithdrawService.addQrAccount(formData)
      if (response?.data?.data?.success) {
        onSuccess()
        toast.success('QR Code successfully added.')
        reset()
        setSelectedFile(null)
        // eslint-disable-next-line
        //@ts-expect-error
        window.$('#qrModal').modal('hide')
      }
    }
  }

  return (
    <div
      className='modal fade popupcls'
      id='qrModal'
      tabIndex={-1}
      role='dialog'
      aria-labelledby='qrModalCenterTitle'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-login-new' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title' id='qrModalCenterTitle'>
              Add QR Code Detail
            </h5>
            <button type='button' className='btn-close loginpop' data-dismiss='modal' aria-label='Close'>
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='modal-body'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='form-group mb-10' style={{ position: 'relative' }}>
                <label>UPI ID:</label>
                <input type='text' className='form-control' {...register('upiId')} />
                {errors?.upiId && (
                  // eslint-disable-next-line
                  //@ts-expect-error
                  <p className='error'>{errors.upiId.message}</p>
                )}
              </div>
              <div className='form-group mb-10' style={{ position: 'relative' }}>
                <label>QR Image:</label>
                <input type='file' accept='image/*' className='form-control' onChange={handleFileChange} />
              </div>
              <button type='submit' className='btn btn-primary'>
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddQrModalPari
