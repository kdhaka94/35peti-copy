import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData, updateMessage } from '../../../redux/actions/login/loginSlice'
import { userUpdate } from '../../../redux/actions/login/loginSlice'
import authService from '../../../services/auth.service'
import { useNavigateCustom } from '../../../pages/_layout/elements/custom-link'
import SubmitButton from '../../../components/SubmitButton'
import userService from '../../../services/user.service'
import { toast } from 'react-toastify'

const OtpVerification = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigateCustom()
    const userState = useAppSelector(selectUserData)

    const [otp, setOtp] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const [timer, setTimer] = React.useState(30)

    // ⏱ OTP TIMER
    React.useEffect(() => {
        if (timer === 0) return
        const interval = setInterval(() => {
            setTimer((t) => t - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [timer])

    // 🔒 SAFETY: direct access block
    // React.useEffect(() => {
    //     if (userState.user?.authkey !== 1) {
    //         navigate.go('/list-clients')
    //     }
    // }, [])

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp) return setError('Please enter OTP')

        try {
            setLoading(true)
            setError('')

            const token = localStorage.getItem('token-admin')

            const res = await userService.VerifyOtptwo({ otp, token })
            console.log(res.data)

            if (res.data.code == '200') {
                // ✅ authkey remove


                localStorage.setItem('token-admin', res.data.data.token)
                localStorage.setItem('refreshToken-admin', res.data.data.refreshToken)

                localStorage.setItem('admin_otp_pending', 'false')

                navigate.go('/admin/list-clients')

                navigate.go('/list-clients')
            } else {
                setError('Invalid OTP')
            }
        } catch (e: any) {
            setError(e.response?.data?.message || 'OTP verification failed')
        } finally {
            setLoading(false)
        }
    }

    //   const handleResendOtp = async () => {
    //     try {
    //       await authService.resendOtp()
    //       setTimer(30)
    //     } catch (e) {
    //       console.error(e)
    //     }
    //   }

    React.useEffect(() => {
        const SendOtp = async () => {
            const res = await userService.enableButton({ type: "telegaram" })
            const msg = res?.data?.data?.message;
            console.log(msg, "lokesh")

            // 👇 OTP CASE
            if (msg === "Otp sent successfully") {

                toast.success("OTP sent successfully");
                return;
            }


        }
        SendOtp()
    }, [])

    return (
        <div className="login">
            <div className="wrapper d-flex justify-content-center align-items-center">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="loginInner1">
                                <div className="featured-box-login featured-box-secundary default log-fld">
                                    <h2 className="text-center">OTP Verification</h2>

                                    <form onSubmit={handleVerifyOtp}>
                                        <div className="form-group m-b-20">
                                            <input
                                                type="text"
                                                className="form-control text-center"
                                                placeholder="Enter OTP"
                                                value={otp}
                                                maxLength={6}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                            {error && (
                                                <small className="text-danger">{error}</small>
                                            )}
                                        </div>

                                        <div className="form-group text-center">
                                            <SubmitButton
                                                type="submit"
                                                className="btn btn-submit btn-login"
                                                disabled={loading}
                                            >
                                                Verify OTP
                                                {loading && (
                                                    <i className="fas fa-spinner fa-spin ml-2"></i>
                                                )}
                                            </SubmitButton>
                                        </div>

                                        <div className="text-center mt-3">
                                            {timer > 0 ? (
                                                <small>Resend OTP in {timer}s</small>
                                            ) : (
                                                <a
                                                    style={{ cursor: 'pointer' }}
                                                //   onClick={handleResendOtp}
                                                >
                                                    Resend OTP
                                                </a>
                                            )}
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

export default OtpVerification
