import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import depositWithdrawService from '../services/deposit-withdraw.service'

type DepositInput = {
  amount: number
  imageUrl: string
  utrno: number
}

const validationSchema = Yup.object().shape({
  amount: Yup.number().required('Amount is required'),
  imageUrl: Yup.string().required('Fill this field.'),
  utrno: Yup.number().required('Fill this field.'),
})

const useDeposit = () => {
  const [amount, setAmount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [preview, setPreview] = useState({ type: '', imagePath: '', utrno: '' })
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<DepositInput>({ resolver: yupResolver(validationSchema) })

  useEffect(() => {
    depositWithdrawService.getPaymentSetting().then((res) => {
      const accs = res?.data?.data?.accounts || []
      setAccounts(accs)
      if (accs.length > 0) setSelectedAccount(accs[0])
    })
  }, [])

  const handleChange = (e: any) => {
    e.preventDefault()
    setAmount(e.target.value)
  }

  const handleUploadedFile = (event: any, type: string) => {
    const file = event.target.files[0]
    setPreview({ type, imagePath: file, utrno: preview.utrno })
  }

  const handleUploadedUTR = (event: any, type: string) => {
    const file = event.target.value
    setPreview({
      type,
      imagePath: preview.imagePath,
      utrno: type === preview.type ? file : '',
    })
  }


  const onSubmit = async (data: any) => {
    if (!preview.imagePath) return toast.error('Image is required field')
    if (!selectedAccount) return toast.error('Please select a payment account')

    const formData = new FormData()
    const amount = getValues('amount')
    formData.append('remark', 'ok')
    formData.append('type', 'deposit')
    formData.append('imageUrl', preview.imagePath)
    formData.append('accountType', preview.type)
    formData.append('amount', amount.toString())
    formData.append('utrno', preview.utrno)
    formData.append('accountId', selectedAccount._id)
  try
    { 
        setLoading(true)
      const response = await depositWithdrawService.addDepositWithdraw(formData)
    if (response?.data?.message) {
      toast.success(response?.data?.message)
      reset()
      setAmount(null)
      setPreview({ type: '', imagePath: '', utrno: '' })
    }
  } catch(error: any) {
  console.log(error)

  // Backend se error message nikaalna
  const errorMessage =
    error?.response?.data?.message ||
    error?.response?.data ||
    error.message ||
    "Something went wrong"

  toast.error(errorMessage)
} finally {
  setLoading(false)
}
}

  const generateTransactionId = () => {
    return Math.floor(100000 + Math.random() * 900000)
  }

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setValue,
    amount,
    handleChange,
    accounts,
    selectedAccount,
    setSelectedAccount,
    handleUploadedFile,
    preview,
    generateTransactionId,
    handleUploadedUTR,
    loading,
  }
}

export default useDeposit
