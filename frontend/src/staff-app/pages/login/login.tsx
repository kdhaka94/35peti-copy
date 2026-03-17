import React, { useState } from 'react'
import api from '../../../utils/api'
import { useNavigateCustom } from '../../../pages/_layout/elements/custom-link'
import SubmitButton from '../../../components/SubmitButton'
import authService from '../../../services/auth.service'
import { useWhiteLabel } from '../../../context/WhiteLabelContext'

const StaffLogin = () => {
  const navigate = useNavigateCustom()
const [loginForm, setLoginForm] = useState({
  clientId: '',
  password: '',
})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      console.log(loginForm,"hahahhhahah")
      const res = await authService.staffLogin(loginForm)
     console.log(res.data)
      // token save
      localStorage.setItem('staff-clientId', res.data.data.clientId)
      localStorage.setItem('staff-parentId', res.data.data.ParentId)
      localStorage.setItem('staff-role', res.data.data.role)
      localStorage.setItem('staff-paymode', res.data.data.paymethod)

    let paymode = res.data.data.paymethod
      // redirect
      if (paymode == "manual"){
        navigate.go('/staff/dashboard')
        return
      }

      navigate.go('/staff/dashborad/manual')

    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Invalid username or password'
      )
    }

    setLoading(false)
  }

    const { whiteLabel } = useWhiteLabel();
          const API_URL = process.env.REACT_APP_API_BASEURL || "";
          
          const logoSrc = whiteLabel?.logoImage
            ? `${API_URL}${whiteLabel.logoImage}`
            : "/imgs/logo.png";

  return (
    <div className='login'>
      <div className='wrapper d-flex justify-content-center align-items-center'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12'>
              <div className='loginInner1'>
                
                <div className='log-logo m-b-20 text-center'>
                  <img
                    src={logoSrc}
                    className='logo-login'
                    style={{ maxWidth: "250px", maxHeight: "100px" }}
                  />
                </div>

                <div className='featured-box-login featured-box-secundary default log-fld'>
                  <h2 className="text-center">Staff Login</h2>

                  <form
                    onSubmit={handleSubmit}
                    autoComplete='off'
                  >
                    <div className='form-group m-b-20'>
                      <input
                        name='clientId'
                        placeholder='clientId'
                        type='text'
                        className='form-control'
                        onChange={handleForm}
                        required
                      />
                    </div>

                    <div className='form-group m-b-20'>
                      <input
                        name='password'
                        placeholder='Password'
                        type='password'
                        className='form-control'
                        onChange={handleForm}
                        required
                      />
                      {error && (
                        <small className='text-danger'>{error}</small>
                      )}
                    </div>

                    <div className='form-group text-center mb-0'>
                      <SubmitButton
                        type='submit'
                        className='btn btn-submit btn-login'
                        disabled={loading}
                      >
                        Login
                        {loading ? (
                          <i className='fas fa-spinner fa-spin'></i>
                        ) : (
                          <i className='fas fa-sign-in-alt'></i>
                        )}
                      </SubmitButton>
                    </div>
                  </form>

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffLogin