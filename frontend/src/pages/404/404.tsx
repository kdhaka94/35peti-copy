import React, { useState } from 'react'
import { MouseEvent } from 'react'
import { useNavigateCustom } from '../_layout/elements/custom-link'
import { useWhiteLabel } from '../../context/WhiteLabelContext'

const Page404 = () => {
  const navigate = useNavigateCustom()
  const [timerCount, setTimerCount] = useState<any>(true)

  const redirectToHome = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate.go('/')
  }
  React.useEffect(() => {
    setTimeout(() => {
      setTimerCount(false)
    }, 2000)
  }, [])

  const { whiteLabel } = useWhiteLabel();
  const API_URL = process.env.REACT_APP_API_BACKURL || "";

  const logoSrc = whiteLabel?.logoImage
    ? `${API_URL}${whiteLabel.logoImage}`
    : "";


  return (
    <div className='login'>
      <div className='wrapper'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12'>
              <div className='loginInner1'>
                <div className='log-logo m-b-20 text-center'>
                  <img src={logoSrc} className='logo-login' />
                </div>
                {!timerCount &&
                  <div className='featured-box-login featured-box-secundary default text-center'>
                    <div className='error-template'>
                      <h1>Oops!</h1>
                      <h2>404 Not Found</h2>
                      <div className='error-details m-b-20'>
                        Sorry, an error has occured, Requested page not found!
                      </div>
                      <div className='error-actions'>
                        <a href='#' onClick={redirectToHome} className='btn btn-primary btn-lg'>
                          <span className='glyphicon glyphicon-home' />
                          Take Me Home{' '}
                        </a>
                      </div>
                    </div>
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page404
