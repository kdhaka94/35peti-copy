import React from 'react'
import { useNavigateCustom } from '../_layout/elements/custom-link'
import SubmitButton from '../../components/SubmitButton'
import authService from '../../services/auth.service'
import axios from 'axios'
import { whiteLabelService } from '../../services/white-label.service'
import { useAppSelector } from '../../redux/hooks'
import { selectUserData } from '../../redux/actions/login/loginSlice'
import { useWhiteLabel } from '../../context/WhiteLabelContext'


const RegisterAuto = () => {
  const navigate = useNavigateCustom()
    const userState = useAppSelector(selectUserData)
  

  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
    confirm_password:'',
  })

  const [loading, setLoading] = React.useState(false)
    const [whiteLabel, setWhiteLabel] = React.useState<any | null>(null);
     const [loadingno, setLoadingno] = React.useState(true);
  
    const loadWhiteLabel = async () => {
       try {
         setLoading(true);
         // Get white-label by current domain
         const hostname = window.location.hostname;
         const response = await whiteLabelService.getWhiteLabelByDomain(hostname);
         const data = response.data.data;
         
         if (data && data.isActive) {
           setWhiteLabel(data);
         } else {
           // Load default theme
           await loadDefaultTheme();
         }
       } catch (error) {
         console.log('No custom white-label found for this domain, using default theme');
         await loadDefaultTheme();
       } finally {
         setLoading(false);
       }
     };
   
     const loadDefaultTheme = async () => {
       try {
         const response = await whiteLabelService.getMyWhiteLabel();
         const data = response?.data?.data?.whiteLabel;
         console.log(response.data,"resshd")
         if (data) {
           setWhiteLabel(data);
  
         }
       } catch (error) {
         console.log('Using default application theme');
       }
     };
  
     React.useEffect(()=>{
      loadWhiteLabel();
     },[userState])
  
  const [error, setError] = React.useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      setLoading(true)
    
      await axios.post(
        `${process.env.REACT_APP_API_BASEURL}register-auto`,
        {
          username: formData.username,
          password: formData.password,
          parent: whiteLabel?.userId?.username,
          // parent:"Rahulauto",
          confirm_password: formData.confirm_password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    
      alert('User Registered Successfully')
      navigate.go('/login')
    
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

    
          const API_URL = process.env.REACT_APP_API_BASEURL || "";
          
          const logoSrc = whiteLabel?.logoImage
            ? `${API_URL.replace("/api","")}/${whiteLabel.logoImage}`
            : "/imgs/logo.png";

  return (
    <div className='login'>
      <div className='loginInner1'>
        <div className='log-logo m-b-20 text-center'>
          <img src={logoSrc} className='logo-login' />
        </div>

        <div className='featured-box-login featured-box-secundary default'>
          <h4 className='text-center'>
            REGISTER <i className='fas fa-user-plus'></i>
          </h4>

          <form onSubmit={handleSubmit} autoComplete='off'>
            <div className='form-group m-b-20'>
              <input
                name='username'
                placeholder='User Name'
                type='text'
                className='form-control'
                onChange={handleChange}
                required
              />
              <i className='fas fa-user'></i>
            </div>

            <div className='form-group m-b-20'>
              <input
                name='password'
                placeholder='Password'
                type='password'
                className='form-control'
                onChange={handleChange}
                required
              />
              <i className='fas fa-key'></i>
              {error && <small className='text-danger'>{error}</small>}
            </div>

            <div className='form-group m-b-20'>
              <input
                name='confirm_password'
                placeholder='Confirm Password'
                type='password'
                className='form-control'
                onChange={handleChange}
                required
              />
              <i className='fas fa-key'></i>
              {error && <small className='text-danger'>{error}</small>}
            </div>

            <div className='form-group text-center mb-0'>
              <SubmitButton type='submit' className='btn btn-submit btn-login mb-10'>
                Register
                {loading ? (
                  <i className='ml-2 fas fa-spinner fa-spin'></i>
                ) : (
                  <i className='ml-2 fas fa-user-plus'></i>
                )}
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterAuto