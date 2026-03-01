



// import React, { useState } from "react";
// import axios from "axios";
// import "./assign-agent.css";
// import userService from "../../../services/user.service";

// const MultiLogin = () => {
//   const [formData, setFormData] = useState({
//     clientId: "",
//     username: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [withdraw, setWithdraw] = useState(false);
//   const [deposit, setDeposit] = useState(false);

//   const handleChange = (e:any) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e:any) => {
//     e.preventDefault();

//     const { clientId, username, password, confirmPassword } = formData;

//     if (!clientId || !username || !password || !confirmPassword) {
//       alert("All fields are required");
//       return;
//     }

//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     let role = "";

//     if (withdraw && deposit) role = "both";
//     else if (withdraw) role = "withdraw";
//     else if (deposit) role = "deposit";
//     else {
//       alert("Select at least one privilege");
//       return;
//     }

//     try {
//       // const response = await axios.post("/create-staff", );

//       const response = await userService.cerateStaff({
//         clientId,
//         username,
//         password,
//         confirmPassword,
//         role,
//       })

//       alert("Staff Created Successfully");

//       console.log(response.data);

//       // Reset Form
//       setFormData({
//         clientId: "",
//         username: "",
//         password: "",
//         confirmPassword: "",
//       });

//       setWithdraw(false);
//       setDeposit(false);
//     } catch (error) {
//       console.error(error);
//       // alert("Something went wrong");
//     }
//   };

//   return (
//     <div>
//       <div>
//         <div style={{ padding: "10px 15px 70px" }}>
          
//           {/* Title */}
//           <div className="row">
//             <div className="col-12">
//               <div className="page-title-box d-flex align-items-center justify-content-between">
//                 <h4 className="mb-0 font-size-18">Multi Login Account</h4>
//               </div>
//             </div>
//           </div>

//           {/* Form Card */}
//           <div className="row">
//             <div className="col-12">
//               <div className="ca p-4">
//                 <div className="card-body create-account-container">

//                   <form onSubmit={handleSubmit}>
//                     <div className="create-account-form">

//                       {/* Personal Info */}
//                       <h5 className="mb-2" style={{ fontSize: "14px" }}>
//                         Personal Information
//                       </h5>

//                       <div className="row">
//                         <div className="col-md-3 form-group">
//                           <label style={{ fontSize: "14px" }}>
//                             Client ID
//                           </label>
//                           <input
//                             type="text"
//                             name="clientId"
//                             value={formData.clientId}
//                             onChange={handleChange}
//                             className="form-control"
//                           />
//                         </div>

//                         <div className="col-md-3 form-group">
//                           <label style={{ fontSize: "14px" }}>
//                             Username
//                           </label>
//                           <input
//                             type="text"
//                             name="username"
//                             value={formData.username}
//                             onChange={handleChange}
//                             className="form-control"
//                           />
//                         </div>

//                         <div className="col-md-3 form-group">
//                           <label style={{ fontSize: "14px" }}>
//                             Password
//                           </label>
//                           <input
//                             type="password"
//                             name="password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             className="form-control"
//                           />
//                         </div>

//                         <div className="col-md-3 form-group">
//                           <label style={{ fontSize: "14px" }}>
//                             Confirm Password
//                           </label>
//                           <input
//                             type="password"
//                             name="confirmPassword"
//                             value={formData.confirmPassword}
//                             onChange={handleChange}
//                             className="form-control"
//                           />
//                         </div>
//                       </div>

//                       {/* Privileges */}
//                       <div className="mt-3 previlages">
//                         <h5 className="mb-2" style={{ fontSize: "14px" }}>
//                           Privileges
//                         </h5>

//                         <div className="previlage-box">

//                           <div className="previlage-item">
//                             <div className="custom-control custom-checkbox">
//                               <input
//                                 type="checkbox"
//                                 className="custom-control-input"
//                                 id="withdraw"
//                                 checked={withdraw}
//                                 onChange={() => setWithdraw(!withdraw)}
//                               />
//                               <label
//                                 className="custom-control-label"
//                                 htmlFor="withdraw"
//                               >
//                                 Withdraw
//                               </label>
//                             </div>
//                           </div>

//                           <div className="previlage-item">
//                             <div className="custom-control custom-checkbox">
//                               <input
//                                 type="checkbox"
//                                 className="custom-control-input"
//                                 id="deposit"
//                                 checked={deposit}
//                                 onChange={() => setDeposit(!deposit)}
//                               />
//                               <label
//                                 className="custom-control-label"
//                                 htmlFor="deposit"
//                               >
//                                 Deposit
//                               </label>
//                             </div>
//                           </div>

//                         </div>

//                         {/* Submit Buttons */}
//                         <div className="previlage-master mt-3">
//                           <div className="form-group d-flex gap-2">
//                             <button
//                               type="submit"
//                               className="btn btn-success mr-1"
//                             >
//                               Submit
//                             </button>

//                             <button
//                               type="button"
//                               className="btn btn-light"
//                               onClick={() => {
//                                 setFormData({
//                                   clientId: "",
//                                   username: "",
//                                   password: "",
//                                   confirmPassword: "",
//                                 });
//                                 setWithdraw(false);
//                                 setDeposit(false);
//                               }}
//                             >
//                               Reset
//                             </button>
//                           </div>
//                         </div>

//                       </div>
//                     </div>
//                   </form>

//                   {/* Table (UI same as before) */}
//                   <div className="outer mt-4">
//                     <div className="inner">
//                       <table className="table table-bordered">
//                         <thead>
//                           <tr>
//                             <th>Action</th>
//                             <th>Username</th>
//                             <th>Withdraw</th>
//                             <th>Deposit</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {/* Future staff list yaha map kar sakte ho */}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>

//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default MultiLogin;


import React, { useEffect, useState } from "react";
import "./assign-agent.css";
import userService from "../../../services/user.service";
import depositWithdrawService from "../../../services/deposit-withdraw.service";

const MultiLogin = () => {
  const [formData, setFormData] = useState({
    clientId: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [withdraw, setWithdraw] = useState(false);
  const [deposit, setDeposit] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Get Staff List ---------------- */
  const getStaffList = async () => {
    try {
      setLoading(true);
      const res = await depositWithdrawService.staffList();
      setStaffList(res?.data?.data || []);
    } catch (error) {
      console.error("Staff List Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Delete Staff ---------------- */
  const handleDelete = async (id: string) => {
    console.log(id,"id id id id ")
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    let data = {id}
    try {
      await depositWithdrawService.deleteStaff(data);
      alert("Staff Deleted Successfully");
      getStaffList(); // refresh list
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Delete Failed");
    }
  };

  /* ---------------- Initial Load ---------------- */
  useEffect(() => {
    getStaffList();
  }, []);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { clientId, username, password, confirmPassword } = formData;

    if (!clientId || !username || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    let role = "";

    if (withdraw && deposit) role = "both";
    else if (withdraw) role = "withdraw";
    else if (deposit) role = "deposit";
    else {
      alert("Select at least one privilege");
      return;
    }

    try {
      await userService.cerateStaff({
        clientId,
        username,
        password,
        confirmPassword,
        role,
      });

      alert("Staff Created Successfully");

      // Reset
      setFormData({
        clientId: "",
        username: "",
        password: "",
        confirmPassword: "",
      });

      setWithdraw(false);
      setDeposit(false);

      getStaffList(); // refresh after create
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "10px 15px 70px" }}>

      <h4 className="mb-3">Multi Login Account</h4>

      {/* ================= FORM ================= */}
      <div className="card p-4">
        <form onSubmit={handleSubmit}>
          <div className="row">

            <div className="col-md-3">
              <label>Client ID</label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-3">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-3">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-3">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          {/* Privileges */}
          <div className="mt-3">
            <label className="mr-3">
              <input
                type="checkbox"
                checked={withdraw}
                onChange={() => setWithdraw(!withdraw)}
              />{" "}
              Withdraw
            </label>

            <label className="ml-3">
              <input
                type="checkbox"
                checked={deposit}
                onChange={() => setDeposit(!deposit)}
              />{" "}
              Deposit
            </label>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-success mr-2">
              Submit
            </button>

            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setFormData({
                  clientId: "",
                  username: "",
                  password: "",
                  confirmPassword: "",
                });
                setWithdraw(false);
                setDeposit(false);
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Action</th>
              <th>Username</th>
              <th>Withdraw</th>
              <th>Deposit</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : staffList.length > 0 ? (
              staffList.map((item: any) => (
                <tr key={item._id}>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                  <td>{item.username}</td>
                  <td style={{ textAlign: "center" }}>
                    {item.role === "withdraw" || item.role === "both"
                      ? "✔"
                      : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {item.role === "deposit" || item.role === "both"
                      ? "✔"
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No Staff Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default MultiLogin;