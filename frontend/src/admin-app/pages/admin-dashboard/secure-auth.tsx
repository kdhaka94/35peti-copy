



// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import "./assign-agent.css";
// import userService from "../../../services/user.service";

// const SecureAuth = () => {
//   const [activeTab, setActiveTab] = useState("telegram");
//   const [showTelegramSteps, setShowTelegramSteps] = useState(false);
//   const [authCode, setAuthCode] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [connectionId, setConnectionId] = useState("");
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [enableLoading, setEnableLoading] = useState(false);

//   // ================= MOBILE AUTH CODE =================
//   useEffect(() => {
//     if (activeTab === "mobile") {
//       const randomCode: any = Math.floor(100000 + Math.random() * 900000);
//       setAuthCode(randomCode);
//     }
//   }, [activeTab]);

//   // ================= TELEGRAM AUTH =================
//   const handleTelegramAuth = async () => {
//     if (!password) {
//       toast.error("Please enter password");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res: any = await userService.Auth2Factor({
//         password,
//         type: "telegram",
//       });

//       const key = res?.data?.message; // 👈 backend se string

//       if (!key) {
//         toast.error("Connection ID not received");
//         return;
//       }

//       setConnectionId(key);
//       setShowTelegramSteps(true);
//       setPassword("");

//       toast.success("Connection ID generated");
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Invalid password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= ENABLE BUTTON API =================
//   const handleEnable2FA = async () => {
//     setEnableLoading(true);

//     try {
//       await userService.enableButton({
//         type: "telegram",
//       });

//       setIsEnabled(true);
//       toast.success("2-Step Verification Enabled Successfully");
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Enable failed");
//     } finally {
//       setEnableLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "10px 15px 70px" }}>
//       <div className="security-auth">
//         <div className="card-body">

//           {/* ================= STATUS ================= */}
//           <div className="text-center mb-2">
//             <b>Secure Auth Verification Status:</b>{" "}
//             <span
//               className={`badge ${
//                 isEnabled ? "badge-success" : "badge-danger"
//               }`}
//             >
//               {isEnabled ? "Enabled" : "Disabled"}
//             </span>
//           </div>

//           <div className="text-center mb-3">
//             Please select below option to enable secure auth verification
//           </div>

//           {/* ================= TABS ================= */}
//           <ul className="nav nav-tabs">
//             <li className="nav-item pointer">
//               <a
//                 className={`nav-link ${
//                   activeTab === "mobile" ? "active" : ""
//                 }`}
//                 onClick={() => {
//                   setActiveTab("mobile");
//                   setShowTelegramSteps(false);
//                 }}
//               >
//                 Enable Using Mobile App
//               </a>
//             </li>

//             <li className="nav-item pointer">
//               <a
//                 className={`nav-link ${
//                   activeTab === "telegram" ? "active" : ""
//                 }`}
//                 onClick={() => {
//                   setActiveTab("telegram");
//                   setShowTelegramSteps(false);
//                 }}
//               >
//                 Enable Using Telegram
//               </a>
//             </li>
//           </ul>

//           {/* ================= TELEGRAM TAB ================= */}
//           {activeTab === "telegram" && (
//             <div className="text-center mt-4">

//               {/* PASSWORD INPUT */}
//               {!connectionId && (
//                 <>
//                   <b>Please enter your login password to continue</b>

//                   <div className="form-group mt-3 d-flex justify-content-center">
//                     <input
//                       type="password"
//                       placeholder="Enter your login password"
//                       className="form-control"
//                       style={{ maxWidth: "300px" }}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                     />

//                     <button
//                       className="btn btn-primary ml-2"
//                       onClick={handleTelegramAuth}
//                       disabled={loading}
//                     >
//                       {loading ? "Please wait..." : "Get Connection ID"}
//                     </button>
//                   </div>
//                 </>
//               )}

//               {/* TELEGRAM STEPS */}
//               {connectionId && (
//                 <div className="mt-4">
//                   <b>Please follow below instructions:</b>

//                   <p className="mt-2">
//                     Open{" "}
//                     <a
//                       href="https://t.me/two_factor_gauth_bot?start"
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       @two_factor_gauth_bot
//                     </a>{" "}
//                     and type <kbd>/start</kbd>
//                   </p>

//                   <p className="text-dark pt-3 pb-3">
//                     Then type <kbd>/connect {connectionId}</kbd>
//                   </p>

//                   {/* ENABLE BUTTON */}
//                   {!isEnabled && (
//                     <button
//                       className="btn btn-success mt-3"
//                       onClick={handleEnable2FA}
//                       disabled={enableLoading}
//                     >
//                       {enableLoading ? "Enabling..." : "Enable 2-Step Verification"}
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ================= MOBILE TAB ================= */}
//           {activeTab === "mobile" && (
//             <div className="text-center mt-4">
//               <b>Enter below code in Secure Auth App</b>

//               <div
//                 className="mt-3"
//                 style={{
//                   display: "inline-block",
//                   padding: "10px 20px",
//                   borderRadius: "8px",
//                   letterSpacing: "15px",
//                   backgroundColor: "#3c444b",
//                   color: "#aaafb5",
//                   fontSize: "20px",
//                 }}
//               >
//                 {authCode}
//               </div>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default SecureAuth;


import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./assign-agent.css";
import userService from "../../../services/user.service";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import { useAppSelector } from "../../../redux/hooks";
import User from "../../../models/User";

const SecureAuth = () => {
    const userState = useAppSelector<{ user: User }>(selectUserData)
  const [activeTab, setActiveTab] = useState("telegram");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [connectionId, setConnectionId] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  const [enableLoading, setEnableLoading] = useState(false);

  // OTP STATES
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // ================= TELEGRAM AUTH =================
  const handleTelegramAuth = async () => {
    if (!password) {
      toast.error("Please enter password");
      return;
    }

    setLoading(true);
    try {
      const res: any = await userService.Auth2Factor({
        password,
        type: "telegram",
      });

      const key = res?.data?.message; // 👈 connection string

      if (!key) {
        toast.error("Connection ID not received");
        return;
      }

      setConnectionId(key);
      setPassword("");
      toast.success("Connection ID generated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  // ================= ENABLE 2FA =================
  const handleEnable2FA = async () => {
    setEnableLoading(true);

    try {
      const res: any = await userService.enableButton({
        type: "telegram",
      });

      const msg = res?.data?.data?.message;
      console.log(msg,"lokesh")

      // 👇 OTP CASE
      if (msg === "Otp sent successfully") {
        setShowOtpBox(true);
        toast.success("OTP sent successfully");
        return;
      }

      // 👇 DIRECT ENABLE CASE
      
      toast.success("2-Step Verification Enabled Successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Enable failed");
    } finally {
      setEnableLoading(false);
    }
  };

  const handleEnable2FA2 = async () => {
    setEnableLoading(true);

    try {
      // const res: any = await userService.enableButton({
      //   type: "telegram",
      // });

      // const msg = res?.data?.data?.message;
      // console.log(msg,"lokesh")

      // // 👇 OTP CASE
      // if (msg === "Otp sent successfully") {
      //   setShowOtpBox(true);
      //   toast.success("OTP sent successfully");
      //   return;
      // }

      // 👇 DIRECT ENABLE CASE

   localStorage.removeItem('token-admin')
   localStorage.removeItem('refreshToken-admin')

      
      toast.success("2-Step Verification Enabled Successfully");
    } catch (err: any) {
      // toast.error(err?.response?.data?.message || "Enable failed");
    } finally {
      setEnableLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const handleSubmitOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter valid 6 digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      await userService.VerifyOtp({
        otp,
        type: "telegram",
      });

      setIsEnabled(true);
      setShowOtpBox(false);
      setOtp("");
      toast.success("2-Step Verification Enabled Successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };


   const handleSubmitOtp2 = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter valid 6 digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token-admin')
      await userService.VerifyOtptwo({
        otp,
        type: "telegram",
        token
      });

      setIsEnabled(true);
      setShowOtpBox(false);
      setOtp("");
      
      toast.success("2-Step Verification Enabled Successfully");

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };


  React.useEffect(()=>{ if(userState.user.authkey != 1){
   setIsEnabled(false);
  }else{
     setIsEnabled(true);
  }},[])
 

  return (
    <div style={{ padding: "10px 15px 70px" }}>
      <div className="security-auth">
        <div className="card-body">

          {/* ================= STATUS ================= */}
          <div className="text-center mb-3">
            <b>Secure Auth Verification Status:</b>{" "}
            <span
              className={`badge ${
                isEnabled ? "badge-success" : "badge-danger"
              }`}
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* ================= TABS ================= */}
          <ul className="nav nav-tabs">
            <li className="nav-item pointer">
              <a
                className={`nav-link ${
                  activeTab === "telegram" ? "active" : ""
                }`}
                // onClick={() => setActiveTab("telegram")}
                   onClick={handleEnable2FA}
              >
                {isEnabled ? "Disable Using Telegram" : "Ennable Using Telegaram"}
              </a>
            </li>
          </ul>

          {/* ================= TELEGRAM TAB ================= */}
          {activeTab === "telegram" && (
            <div className="text-center mt-4">

              {/* PASSWORD INPUT */}
              {!connectionId && userState.user.authkey != 1 &&(
                <>
                  <b>Please enter your login password to continue</b>

                  <div className="form-group mt-3 d-flex justify-content-center">
                    <input
                      type="password"
                      placeholder="Enter your login password"
                      className="form-control"
                      style={{ maxWidth: "300px" }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                      className="btn btn-primary ml-2"
                      onClick={handleTelegramAuth}
                      disabled={loading}
                    >
                      {loading ? "Please wait..." : "Get Connection ID"}
                    </button>
                  </div>
                </>
              )}

              {/* TELEGRAM STEPS */}
              {connectionId && (
                <div className="mt-4">
                  <b>Follow below instructions:</b>

                  <p className="mt-2">
                    Open{" "}
                    <a
                      href="https://t.me/two_factor_gauth_bot?start"
                      target="_blank"
                      rel="noreferrer"
                    >
                      @two_factor_gauth_bot
                    </a>{" "}
                    and type <kbd>/start</kbd>
                  </p>

                  <p className="text-dark pt-3 pb-3">
                    Then type <kbd>/connect {connectionId}</kbd>
                  </p>

                  { !showOtpBox && (
                    <button
                      className="btn btn-success mt-2"
                      onClick={handleEnable2FA2}
                      disabled={enableLoading}
                    >
                      {enableLoading
                        ? "Please wait..."
                        : "Enable 2-Step Verification"}
                    </button>
                  )}
                </div>
              )}

              {/* ================= OTP BOX ================= */}
              {showOtpBox && (
                <div className="mt-4">
                  <b>Enter 6 Digit OTP</b>

                  <div className="form-group mt-2 d-flex justify-content-center">
                    <input
                      type="text"
                      maxLength={6}
                      className="form-control text-center"
                      style={{
                        maxWidth: "200px",
                        letterSpacing: "8px",
                        fontSize: "20px",
                      }}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="______"
                    />
                  </div>

                  <button
                    className="btn btn-primary mt-2"
                    onClick={handleSubmitOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? "Verifying..." : "Submit OTP"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureAuth;


