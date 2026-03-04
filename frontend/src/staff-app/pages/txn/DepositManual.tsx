


// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import userService from "../../../services/user.service";
// import mobileSubheader from "../../../admin-app/pages/_layout/elements/mobile-subheader";
// import { useNavigateCustom } from "../../../pages/_layout/elements/custom-link";

// const DepositStatementManual = () => {
//   const [staffUsers, setStaffUsers] = useState<any[]>([]);
//   const [manualModal, setManualModal] = useState(false);
//   const [manualType, setManualType] = useState<"deposit" | "withdraw">("deposit");
//   const [selectedUser, setSelectedUser] = useState<any>(null);
//   const [manualAmount, setManualAmount] = useState("");
//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [staffRole, setStaffRole] = useState<string>("");
//      const navigate = useNavigateCustom()
  

//   /* ---------------- Fetch Staff Users + Role ---------------- */
//   useEffect(() => {
//     const role = localStorage.getItem("staff-role") || "";
//     const type = localStorage.getItem("staff-paymode")
//     if(type == "direct"){
//         navigate.go('/staff/dashborad')
//     }
//     setStaffRole(role);
//     getStaffUsers();
//   }, []);

//   const getStaffUsers = async () => {
//     try {
//       const parentId = localStorage.getItem("staff-parentId");
//       const res = await userService.userListforStaff({ id: parentId });
//       setStaffUsers(res?.data?.data || []);
//     } catch (error) {
//       toast.error("Failed to fetch staff users");
//     }
//   };

//   /* ---------------- Open Modal ---------------- */
//   const openManualModal = (user: any, type: "deposit" | "withdraw") => {
//     setSelectedUser(user);
//     setManualType(type);
//     setManualAmount("");
//     setTransactionPassword("");
//     setManualModal(true);
//   };

//   /* ---------------- Submit Manual Transaction ---------------- */
//   const handleManualSubmit = async () => {
//     if (!manualAmount || Number(manualAmount) <= 0) {
//       toast.error("Please enter valid amount");
//       return;
//     }

//     if (!transactionPassword) {
//       toast.error("Enter transaction password");
//       return;
//     }

//     if (!selectedUser?._id) {
//       toast.error("User not selected");
//       return;
//     }

//     // 🔐 Role protection
//     if (staffRole !== manualType && staffRole !== "both") {
//       toast.error("You are not allowed to perform this action");
//       return;
//     }

//     try {
//       setLoading(true);

//       const parentUserId = localStorage.getItem("staff-parentId");

//       const payload = {
//         amount: Number(manualAmount),
//         balanceUpdateType: manualType === "deposit" ? "D" : "W",
//         narration: `${manualType} by staff`,
//         parentUserId: parentUserId,
//         transactionPassword: transactionPassword,
//         userId: selectedUser._id,
//       };

//       const res = await userService.updateDepositBalanceStaff(payload);

//       if (res?.data) {
//         console.log(res.data,"hello world ")
//         alert(res.data.message || "Transaction successful");
//         setManualModal(false);
//         getStaffUsers(); // refresh list
//       }

//     } catch (error: any) {
//       toast.error(error?.response?.data?.message || "Transaction failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {mobileSubheader.subheaderdesktopadmin("Manual Deposit / Withdraw")}

//       <div className="container-fluid">
//         <div className="card-body bg-gray mt-3">
//           <h5>Staff User List</h5>

//           <div className="table-responsive">
//             <table className="table table-bordered">
//               <thead>
//                 <tr>
//                   <th>Username</th>
//                   <th style={{ textAlign: "center" }}>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {staffUsers.length > 0 ? (
//                   staffUsers.map((user: any) => (
//                     <tr key={user._id}>
//                       <td>{user.username}</td>

//                       <td style={{ textAlign: "center" }}>
//                         {/* Deposit Button */}
//                         {(staffRole === "deposit" ||
//                           staffRole === "both") && (
//                           <button
//                             className="btn btn-success btn-sm mr-2"
//                             onClick={() =>
//                               openManualModal(user, "deposit")
//                             }
//                           >
//                             Deposit
//                           </button>
//                         )}

//                         {/* Withdraw Button */}
//                         {(staffRole === "withdraw" ||
//                           staffRole === "both") && (
//                           <button
//                             className="btn btn-danger btn-sm"
//                             onClick={() =>
//                               openManualModal(user, "withdraw")
//                             }
//                           >
//                             Withdraw
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={2} className="text-center">
//                       No Users Found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* ---------------- Modal ---------------- */}
//       {manualModal && (
//         <div
//           className="modal show d-block"
//           style={{ background: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog">
//             <div className="modal-content p-4">
//               <h5 className="mb-3">
//                 Manual {manualType} - {selectedUser?.username}
//               </h5>

//               <input
//                 type="number"
//                 placeholder="Enter Amount"
//                 className="form-control mb-3"
//                 value={manualAmount}
//                 onChange={(e) => setManualAmount(e.target.value)}
//               />

//               <input
//                 type="password"
//                 placeholder="Transaction Password"
//                 className="form-control mb-3"
//                 value={transactionPassword}
//                 onChange={(e) => setTransactionPassword(e.target.value)}
//               />

//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "flex-end",
//                   gap: "10px",
//                 }}
//               >
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setManualModal(false)}
//                   disabled={loading}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   className={`btn ${
//                     manualType === "deposit"
//                       ? "btn-success"
//                       : "btn-danger"
//                   }`}
//                   onClick={handleManualSubmit}
//                   disabled={loading}
//                 >
//                   {loading ? "Processing..." : "Submit"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default DepositStatementManual;



import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import userService from "../../../services/user.service";
import mobileSubheader from "../../../admin-app/pages/_layout/elements/mobile-subheader";
import { useNavigateCustom } from "../../../pages/_layout/elements/custom-link";

const DepositStatementManual = () => {
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualModal, setManualModal] = useState(false);
  const [manualType, setManualType] = useState<"deposit" | "withdraw">("deposit");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [manualAmount, setManualAmount] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [staffRole, setStaffRole] = useState<string>("");

  const navigate = useNavigateCustom();

  /* ---------------- Fetch Staff Users + Role ---------------- */
  useEffect(() => {
    const role = localStorage.getItem("staff-role") || "";
    const type = localStorage.getItem("staff-paymode");

    if (type === "direct") {
      navigate.go("/staff/dashborad");
    }

    setStaffRole(role);
    getStaffUsers();
  }, []);

  const getStaffUsers = async () => {
    try {
      const parentId = localStorage.getItem("staff-parentId");
      const res = await userService.userListforStaff({ id: parentId });
      setStaffUsers(res?.data?.data || []);
    } catch (error) {
      toast.error("Failed to fetch staff users");
    }
  };

  /* ---------------- Filtered Users ---------------- */
  const filteredUsers = staffUsers.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------------- Open Modal ---------------- */
  const openManualModal = (user: any, type: "deposit" | "withdraw") => {
    setSelectedUser(user);
    setManualType(type);
    setManualAmount("");
    setTransactionPassword("");
    setManualModal(true);
  };

  /* ---------------- Submit Manual Transaction ---------------- */
  const handleManualSubmit = async () => {
    if (!manualAmount || Number(manualAmount) <= 0) {
      toast.error("Please enter valid amount");
      return;
    }

    if (!transactionPassword) {
      toast.error("Enter transaction password");
      return;
    }

    if (!selectedUser?._id) {
      toast.error("User not selected");
      return;
    }

    if (staffRole !== manualType && staffRole !== "both") {
      toast.error("You are not allowed to perform this action");
      return;
    }

    try {
      setLoading(true);

      const parentUserId = localStorage.getItem("staff-parentId");

      const payload = {
        amount: Number(manualAmount),
        balanceUpdateType: manualType === "deposit" ? "D" : "W",
        narration: `${manualType} by staff`,
        parentUserId: parentUserId,
        transactionPassword: transactionPassword,
        userId: selectedUser._id,
      };

      const res = await userService.updateDepositBalanceStaff(payload);

      if (res?.data) {
        alert(res.data.message || "Transaction successful");
        setManualModal(false);
        getStaffUsers();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin("Manual Deposit / Withdraw")}

      <div className="container-fluid">
        <div className="card-body bg-gray mt-3">
          <h5>Staff User List</h5>

          {/* 🔎 Search Input */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Username</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <tr key={user._id}>
                      <td>{user.username}</td>

                      <td style={{ textAlign: "center" }}>
                        {(staffRole === "deposit" ||
                          staffRole === "both") && (
                          <button
                            className="btn btn-success btn-sm mr-2"
                            onClick={() =>
                              openManualModal(user, "deposit")
                            }
                          >
                            Deposit
                          </button>
                        )}

                        {(staffRole === "withdraw" ||
                          staffRole === "both") && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              openManualModal(user, "withdraw")
                            }
                          >
                            Withdraw
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center">
                      No Users Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------------- Modal ---------------- */}
      {manualModal && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <h5 className="mb-3">
                Manual {manualType} - {selectedUser?.username}
              </h5>

              <input
                type="number"
                placeholder="Enter Amount"
                className="form-control mb-3"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
              />

              <input
                type="password"
                placeholder="Transaction Password"
                className="form-control mb-3"
                value={transactionPassword}
                onChange={(e) => setTransactionPassword(e.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setManualModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  className={`btn ${
                    manualType === "deposit"
                      ? "btn-success"
                      : "btn-danger"
                  }`}
                  onClick={handleManualSubmit}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepositStatementManual;