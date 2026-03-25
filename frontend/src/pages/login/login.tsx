import React, { useContext, useState } from 'react'
import User from '../../models/User'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { loginAction } from '../../redux/actions/login/login.action'
import { selectUserData } from '../../redux/actions/login/loginSlice'
import { useWebsocketUser } from '../../context/webSocketUser'
import { CustomLink, useNavigateCustom } from '../_layout/elements/custom-link'
import { isMobile } from 'react-device-detect'
import api from '../../utils/api'
import SubmitButton from '../../components/SubmitButton'
import WhatsAppButton from '../../components/WhatsAppButton'
import { whiteLabelService } from '../../services/white-label.service'
import { useWhiteLabel } from '../../context/WhiteLabelContext'

const Login = () => {
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const { socketUser } = useWebsocketUser()
  //  const context = useContext(WhiteLabelContext);

  const navigate = useNavigateCustom()

  const [loginForm, setLoginForm] = React.useState<User>({
    username: '',
    password: '',
    logs: '',
    isDemo: false
  })

  const [isDemoLogin, setIsDemoLogin] = React.useState(false) // Track Demo Login


  React.useEffect(() => {
    api.get(`${process.env.REACT_APP_IP_API_URL}`).then((res) => {
      setLoginForm({ ...loginForm, logs: res.data })
    })
  }, [])

  const [whiteLabel, setWhiteLabel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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
      console.log(response.data, "resshd")
      if (data) {
        setWhiteLabel(data);

      }
    } catch (error) {
      console.log('Using default application theme');
    }
  };

  React.useEffect(() => {
    loadWhiteLabel();
  }, [userState])

  console.log(whiteLabel, "login dtata check")

  React.useEffect(() => {
    if (userState.status === 'done') {
      const { role, _id } = userState.user
      socketUser.emit('login', {
        role: userState.user.role,
        sessionId: userState.user.sessionId,
        _id,
      })
      localStorage.setItem('login-session', userState.user.sessionId)

      if (userState.user.role && ['admin', '1', '2', '3'].includes(userState.user.role)) {
        return navigate.go('/')
      }

      return isMobile ? navigate.go('/match/4/in-play') : navigate.go('/match/4/in-play')
    }
  }, [userState])

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
  }
  const handleSubmitDemoLogin = () => {
    const loginFormNew = { ...loginForm, isDemo: true };
    setLoginForm(loginFormNew)
    setIsDemoLogin(true)

  }
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(loginAction(loginForm))
    setIsDemoLogin(false)

  }


  const API_URL = process.env.REACT_APP_API_BACKURL || "";
  const isDefaultDomain = window.location.hostname.includes("35peti") || window.location.hostname.includes("localhost");

  const logoSrc = whiteLabel?.logoImage
    ? `${API_URL}${whiteLabel.logoImage}`
    : isDefaultDomain ? "/imgs/logo.png" : "";
  return (
    <div>
      <div className='login'>
        <div className='loginInner1'>
          <div className='log-logo m-b-20 text-center'>
            <img src={logoSrc} className='logo-login' />
          </div>
          <div className='featured-box-login featured-box-secundary default'>
            <h4 className='text-center'>
              LOGIN <i className='fas fa-hand-point-down'></i>
            </h4>
            <form
              onSubmit={(e) => handleSubmit(e)}
              role='form'
              autoComplete='off'
              method='post'
            >
              <div className='form-group m-b-20'>
                <input
                  name='username'
                  placeholder='User Name'
                  type='text'
                  className='form-control'
                  aria-required='true'
                  aria-invalid='false'
                  onChange={handleForm}
                  required={!isDemoLogin}

                />
                <i className='fas fa-user'></i>
                <small className='text-danger' style={{ display: 'none' }}></small>
              </div>
              <div className='form-group m-b-20'>
                <input
                  name='password'
                  placeholder='Password'
                  type='password'
                  className='form-control'
                  aria-required='true'
                  aria-invalid='false'
                  onChange={handleForm}
                  required={!isDemoLogin}

                />
                <i className='fas fa-key'></i>
                {userState.error ? (
                  <small className='text-danger'>{userState.error}</small>
                ) : (
                  ''
                )}
              </div>
              <div className='form-group text-center mb-0'>
                <SubmitButton type='submit' className='btn btn-submit btn-login mb-10'>
                  Login
                  {userState.status === 'loading' ? (
                    <i className='ml-2 fas fa-spinner fa-spin'></i>
                  ) : (
                    <i className='ml-2 fas fa-sign-in-alt'></i>
                  )}
                </SubmitButton>
                <SubmitButton type='submit' onClick={() => handleSubmitDemoLogin()} className='btn btn-submit btn-login mb-10'>
                  Login with Demo ID
                  {userState.status === 'loading' ? (
                    <i className='ml-2 fas fa-spinner fa-spin'></i>
                  ) : (
                    <i className='ml-2 fas fa-sign-in-alt'></i>
                  )}
                </SubmitButton>

                {whiteLabel?.mode == "manual" && <SubmitButton className='btn btn-submit btn-login mb-10'>
                  <CustomLink to={"/register"} className='text-white'>Register Now</CustomLink>
                </SubmitButton>}


                <small className='recaptchaTerms'>
                  This site is protected by reCAPTCHA and the Google
                  <a
                    target={'_blank'}
                    rel='noopener noreferrer'
                    href='https://policies.google.com/privacy'
                  >
                    Privacy Policy
                  </a>{' '}
                  and
                  <a
                    target={'_blank'}
                    rel='noopener noreferrer'
                    href='https://policies.google.com/terms'
                  >
                    Terms of Service
                  </a>{' '}
                  apply.
                </small>


              </div>
              <div className='mt-2 text-center download-apk'></div>
            </form>
          </div>
        </div>
      </div>
      <section className="footer footer-login"><div className="footer-top"><div className="footer-links"><nav className="navbar navbar-expand-sm"><ul className="navbar-nav"><li className="nav-item"><a className="nav-link" href="/terms-and-conditions" target="_blank"> Terms and Conditions </a></li><li className="nav-item"><a className="nav-link" href="/responsible-gaming" target="_blank"> Responsible Gaming </a></li></ul></nav></div><div className="support-detail"><h2>24X7 Support</h2><p></p></div><div className="social-icons-box"></div></div></section>
      <WhatsAppButton phoneNumber={whiteLabel?.whatsappNumber || (isDefaultDomain ? "911234567890" : undefined)} />
    </div>

  )
}

export default Login
