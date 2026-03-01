// import React from "react";
// import userService from "../../../services/user.service";
// import depositWithdrawService from "../../../services/deposit-withdraw.service";
// import { useAppSelector } from "../../../redux/hooks";
// import { selectUserData } from "../../../redux/actions/login/loginSlice";
// import { CustomLink } from "../../../pages/_layout/elements/custom-link";
// // import DashboardSidebar from "./DashboardSidebar";
// import DashboardDrawer from "./DashboardSidebar";
// interface StatCardProps {
//     color: any;
//     value: any;
//     label: any;
//     link: any;
// }

// type TxnStatus = "approved" | "rejected" | "pending";

// interface TxnItem {
//     amount: number;
//     status: TxnStatus;
//     type: "deposit" | "withdraw";
//     createdAt: string;
// }

// interface Stats {
//     totalAmount: number;
//     totalCount: number;
//     approvedAmount: number;
//     approvedCount: number;
//     rejectedAmount: number;
//     rejectedCount: number;
//     pendingAmount: number;
//     pendingCount: number;
// }


// const Txn = () => {


//     const [drawerOpen, setDrawerOpen] = React.useState(false);



//     const userState = useAppSelector(selectUserData);

//     const [depositStats, setDepositStats] = React.useState<Stats | null>(null);
//     const [withdrawStats, setWithdrawStats] = React.useState<Stats | null>(null);
//     const [newClients, setNewClients] = React.useState<number>(0);
//     const [staffid, setStaffid] = React.useState("")
//     const [staffrole, setStaffrole] = React.useState("")
//     const [staffpid, setStaffpid] = React.useState("")

//     React.useEffect(() => {
//         let id :any= localStorage.getItem('staff-clientId')
//         setStaffid(id)
//          let pid :any= localStorage.getItem('staff-parentId')
//         setStaffpid(pid)
//          let role :any= localStorage.getItem('staff-role')
//         setStaffrole(role)
//     }, [])


//     const calculateStats = (data: TxnItem[]): Stats => {
//         return data.reduce(
//             (acc, item) => {
//                 acc.totalAmount += item.amount;
//                 acc.totalCount += 1;

//                 if (item.status === "approved") {
//                     acc.approvedAmount += item.amount;
//                     acc.approvedCount += 1;
//                 }
//                 if (item.status === "rejected") {
//                     acc.rejectedAmount += item.amount;
//                     acc.rejectedCount += 1;
//                 }
//                 if (item.status === "pending") {
//                     acc.pendingAmount += item.amount;
//                     acc.pendingCount += 1;
//                 }
//                 return acc;
//             },
//             {
//                 totalAmount: 0,
//                 totalCount: 0,
//                 approvedAmount: 0,
//                 approvedCount: 0,
//                 rejectedAmount: 0,
//                 rejectedCount: 0,
//                 pendingAmount: 0,
//                 pendingCount: 0,
//             }
//         );


//     };

//     /* ---------------- Deposit ---------------- */
//  const getDepositStmt = () => {
//     if (staffrole !== "both" && staffrole !== "deposit") return

//     depositWithdrawService
//         .getDepositWithdrawListstwo({ type: "deposit", parentId: staffpid })
//         .then((res) => {
//             const data: TxnItem[] = res?.data?.data ?? [];
//             setDepositStats(calculateStats(data));
//         });
// };

// const getWithdrawStmt = () => {
//     // if (staffrole !== "both" && staffrole !== "withdraw") return
//     console.log("staffrole",staffrole)

//     depositWithdrawService
//         .getDepositWithdrawListstwo({ type: "withdraw", parentId: staffpid })
//         .then((res) => {
//             const data: TxnItem[] = res?.data?.data ?? [];
//             setWithdrawStats(calculateStats(data));
//         });
// };

//     /* ---------------- New Clients (last 2 days) ---------------- */
//     // const getNewClients = () => {
//     //     userService
//     //         .getUserList({
//     //             username: userState?.user?.username,
//     //             type: "",
//     //             search: "",
//     //             status: "",
//     //             page: 1,
//     //         })
//     //         .then((res: any) => {
//     //             const users = res?.data?.data?.items ?? [];
//     //             const twoDaysAgo = new Date();
//     //             twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

//     //             const recentUsers = users?.filter(
//     //                 (u: any) => new Date(u.createdAt) >= twoDaysAgo
//     //             );

//     //             setNewClients(recentUsers.length);
//     //         });
//     // };

//     React.useEffect(() => {
//         getDepositStmt();
//         getWithdrawStmt();
       
//     }, []);



//     return (
//         <div className="container-fluid p-4 bg-light">


//             {/* Header */}
//             {/* <div className="d-flex justify-content-between align-items-center mb-4">
//   <div className="d-flex align-items-center gap-3">
//     <button
//       className="btn btn-outline-secondary"
//       onClick={() => setDrawerOpen(true)}
//     >
//       ☰
//     </button>
//     <h4 className="fw-bold mb-0">WELCOME</h4>
//   </div>
//   <small className="text-muted">Home / Dashboard</small>
// </div>

// <DashboardDrawer
//   open={drawerOpen}
//   onClose={() => setDrawerOpen(false)}
// /> */}





//             {/* Top Action Cards */}
//             <div className="row g-3 mb-4">
//                 {[

//                     { title: "Deposit list", color: "primary", icon: "💰", link: "/staff/depostie" },
//                     //   { title: "UTR Entry", color: "danger", icon: "🏦" , link:"/payment-method" },
//                     { title: "Withdraw", color: "success", icon: "💵", link: "/staff/withdraw" },
//                     { title: "Add Account", color: "danger", icon: "🏛️", link: `/payment-method` },
//                     //   { title: "Account list", color: "danger", icon: "🏦" , link:`/payment-method` },
//                     //   { title: "Global search", color: "secondary", icon: "🔍" , link:`/list-clients/${userState?.user?.username}` },
//                 ].map((item, i) => (
//                     <div className="col-xl-3 col-lg-4 col-md-6" key={i}>
//                         <div className="card shadow-sm p-2 mb-2">
//                             <div className="card-body d-flex align-items-center gap-3 ">
//                                 <div
//                                     className={`rounded text-white d-flex align-items-center justify-content-center bg-${item.color}`}
//                                     style={{ width: 50, height: 50, fontSize: 22 }}
//                                 >
//                                     {item.icon}
//                                 </div>
//                                 <div className="ml-3">
//                                     <div className="fw-semibold">{item.title}</div>
//                                     <a href={item?.link}>
//                                         <button className={`btn btn-sm bg-${item.color} mt-1 text-white`}>
//                                             CLICK HERE
//                                         </button>
//                                     </a>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Stats Cards */}
//             <div className="row g-3">
//                 <StatCard
//                     color="warning"
//                     value={newClients}
//                     label="New Clients"
//                     link={`/list-clients/${userState?.user?.username}`}
//                 />

//                 <StatCard
//                     color="primary"
//                     value={depositStats?.totalAmount ?? 0}
//                     label={`Total Deposits : ${depositStats?.totalCount ?? 0}`}
//                     link="/depositstatement"
//                 />

//                 <StatCard
//                     color="success"
//                     value={depositStats?.approvedAmount ?? 0}
//                     label={`Approved Deposits : ${depositStats?.approvedCount ?? 0}`}
//                     link="/depositstatement"
//                 />

//                 <StatCard
//                     color="danger"
//                     value={depositStats?.rejectedAmount ?? 0}
//                     label={`Rejected Deposits : ${depositStats?.rejectedCount ?? 0}`}
//                     link="/depositstatement"
//                 />

//                 <StatCard
//                     color="info"
//                     value={withdrawStats?.totalAmount ?? 0}
//                     label={`Total Withdrawals : ${withdrawStats?.totalCount ?? 0}`}
//                     link="/withdrawstatement"
//                 />

//                 <StatCard
//                     color="warning"
//                     value={withdrawStats?.pendingAmount ?? 0}
//                     label={`Pending Withdrawals : ${withdrawStats?.pendingCount ?? 0}`}
//                     link="/withdrawstatement"
//                 />

//                 <StatCard
//                     color="success"
//                     value={withdrawStats?.approvedAmount ?? 0}
//                     label={`Approved Withdrawals : ${withdrawStats?.approvedCount ?? 0}`}
//                     link="/withdrawstatement"
//                 />

//                 <StatCard
//                     color="danger"
//                     value={withdrawStats?.rejectedAmount ?? 0}
//                     label={`Rejected Withdrawals : ${withdrawStats?.rejectedCount ?? 0}`}
//                     link="/withdrawstatement"
//                 />
//             </div>
//         </div>
//     );
// };

// const StatCard: React.FC<StatCardProps> = ({ color, value, label, link }) => {
//     return (
//         <div className="col-xl-3 col-lg-4 col-md-6 mb-4">
//             <div className={`card text-white bg-${color} shadow-sm h-100`}>
//                 <div className="card-body p-2">
//                     <h3 className="fw-bold">{value}</h3>
//                     <p className="mb-2">{label}</p>
//                     <div className=" text-center ">
//                         <CustomLink to={link} className="text-white text-center text-decoration-none fw-semibold">
//                             More info →
//                         </CustomLink></div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Txn;



// import React, { useEffect, useState } from "react";
// import depositWithdrawService from "../../../services/deposit-withdraw.service";
// import { useAppSelector } from "../../../redux/hooks";
// import { selectUserData } from "../../../redux/actions/login/loginSlice";
// import { CustomLink } from "../../../pages/_layout/elements/custom-link";

// interface StatCardProps {
//   color: string;
//   value: number;
//   label: string;
//   link: string;
// }

// type TxnStatus = "approved" | "rejected" | "pending";

// interface TxnItem {
//   amount: number;
//   status: TxnStatus;
//   type: "deposit" | "withdraw";
//   createdAt: string;
// }

// interface Stats {
//   totalAmount: number;
//   totalCount: number;
//   approvedAmount: number;
//   approvedCount: number;
//   rejectedAmount: number;
//   rejectedCount: number;
//   pendingAmount: number;
//   pendingCount: number;
// }

// const Txn = () => {
//   const userState = useAppSelector(selectUserData);

//   const [depositStats, setDepositStats] = useState<Stats | null>(null);
//   const [withdrawStats, setWithdrawStats] = useState<Stats | null>(null);
//   const [newClients] = useState<number>(0);

//   const [staffpid, setStaffpid] = useState<string>("");
//   const [staffrole, setStaffrole] = useState<string>("");

//   /* ---------------- Get Staff Data ---------------- */
//   useEffect(() => {
//     const pid = localStorage.getItem("staff-parentId") || "";
//     const role = localStorage.getItem("staff-role") || "";

//     setStaffpid(pid);
//     setStaffrole(role);
//   }, []);

//   /* ---------------- Calculate Stats ---------------- */
//   const calculateStats = (data: TxnItem[]): Stats => {
//     return data.reduce(
//       (acc, item) => {
//         acc.totalAmount += item.amount;
//         acc.totalCount += 1;

//         if (item.status === "approved") {
//           acc.approvedAmount += item.amount;
//           acc.approvedCount += 1;
//         }

//         if (item.status === "rejected") {
//           acc.rejectedAmount += item.amount;
//           acc.rejectedCount += 1;
//         }

//         if (item.status === "pending") {
//           acc.pendingAmount += item.amount;
//           acc.pendingCount += 1;
//         }

//         return acc;
//       },
//       {
//         totalAmount: 0,
//         totalCount: 0,
//         approvedAmount: 0,
//         approvedCount: 0,
//         rejectedAmount: 0,
//         rejectedCount: 0,
//         pendingAmount: 0,
//         pendingCount: 0,
//       }
//     );
//   };

//   /* ---------------- Deposit API ---------------- */
//   const getDepositStmt = async () => {
//     // if (!staffpid) return;
//     // if (staffrole !== "both" && staffrole !== "deposit") return;

//     try {
//       const res = await depositWithdrawService.getDepositWithdrawListstwo({
//         type: "deposit",
//         parentId: staffpid,
//       });

//       const data: TxnItem[] = res?.data?.data ?? [];
//       setDepositStats(calculateStats(data));
//     } catch (error) {
//       console.log("Deposit API Error", error);
//     }
//   };

//   /* ---------------- Withdraw API ---------------- */
//   const getWithdrawStmt = async () => {
//     // if (!staffpid) return;
//     // if (staffrole !== "both" && staffrole !== "withdraw") return;

//     try {
//       const res = await depositWithdrawService.getDepositWithdrawListstwo({
//         type: "withdraw",
//         parentId: staffpid,
//       });

//       const data: TxnItem[] = res?.data?.data ?? [];
//       setWithdrawStats(calculateStats(data));
//     } catch (error) {
//       console.log("Withdraw API Error", error);
//     }
//   };

//   /* ---------------- Load Data ---------------- */
//   useEffect(() => {
//     if (staffpid && staffrole) {
//       getDepositStmt();
//       getWithdrawStmt();
//     }
//   }, [staffpid, staffrole]);

//   return (
//     <div className="container-fluid p-4 bg-light">
      
//       {/* Top Action Cards */}
//       <div className="row g-3 mb-4">
//         {[
//           { title: "Deposit List", color: "primary", icon: "💰", link: "/staff/deposit" },
//           { title: "Withdraw", color: "success", icon: "💵", link: "/staff/withdraw" },
//         //   { title: "Add Account", color: "danger", icon: "🏛️", link: "/payment-method" },
//         ].map((item, i) => (
//           <div className="col-xl-3 col-lg-4 col-md-6" key={i}>
//             <div className="card shadow-sm p-2 mb-2">
//               <div className="card-body d-flex align-items-center gap-3">
//                 <div
//                   className={`rounded text-white d-flex align-items-center justify-content-center bg-${item.color}`}
//                   style={{ width: 50, height: 50, fontSize: 22 }}
//                 >
//                   {item.icon}
//                 </div>
//                 <div>
//                   <div className="fw-semibold">{item.title}</div>
//                   <CustomLink to={item.link}>
//                     <button className={`btn btn-sm bg-${item.color} mt-1 text-white`}>
//                       CLICK HERE
//                     </button>
//                   </CustomLink>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Stats Cards */}
//       <div className="row g-3">
//         <StatCard
//           color="primary"
//           value={depositStats?.totalAmount ?? 0}
//           label={`Total Deposits : ${depositStats?.totalCount ?? 0}`}
//           link="/depositstatement"
//         />

//         <StatCard
//           color="success"
//           value={depositStats?.approvedAmount ?? 0}
//           label={`Approved Deposits : ${depositStats?.approvedCount ?? 0}`}
//           link="/depositstatement"
//         />

//         <StatCard
//           color="danger"
//           value={depositStats?.rejectedAmount ?? 0}
//           label={`Rejected Deposits : ${depositStats?.rejectedCount ?? 0}`}
//           link="/depositstatement"
//         />

//         <StatCard
//           color="info"
//           value={withdrawStats?.totalAmount ?? 0}
//           label={`Total Withdrawals : ${withdrawStats?.totalCount ?? 0}`}
//           link="/withdrawstatement"
//         />

//         <StatCard
//           color="warning"
//           value={withdrawStats?.pendingAmount ?? 0}
//           label={`Pending Withdrawals : ${withdrawStats?.pendingCount ?? 0}`}
//           link="/withdrawstatement"
//         />

//         <StatCard
//           color="success"
//           value={withdrawStats?.approvedAmount ?? 0}
//           label={`Approved Withdrawals : ${withdrawStats?.approvedCount ?? 0}`}
//           link="/withdrawstatement"
//         />

//         <StatCard
//           color="danger"
//           value={withdrawStats?.rejectedAmount ?? 0}
//           label={`Rejected Withdrawals : ${withdrawStats?.rejectedCount ?? 0}`}
//           link="/withdrawstatement"
//         />
//       </div>
//     </div>
//   );
// };

// /* ---------------- Stat Card ---------------- */
// const StatCard: React.FC<StatCardProps> = ({ color, value, label}) => {
//   return (
//     <div className="col-xl-3 col-lg-4 col-md-6 mb-4">
//       <div className={`card text-white bg-${color} shadow-sm h-100`}>
//         <div className="card-body p-2">
//           <h3 className="fw-bold">{value}</h3>
//           <p className="mb-2">{label}</p>
//           <div className="text-center">
//             <div
//             //   to={link}
//               className="text-white text-decoration-none fw-semibold"
//             >
//               {/* More info → */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Txn;



import React, { useEffect, useState } from "react";
import depositWithdrawService from "../../../services/deposit-withdraw.service";
import { CustomLink, useNavigateCustom } from "../../../pages/_layout/elements/custom-link";
 

interface StatCardProps {
  color: string;
  value: number;
  label: string;
  link: string;
}

type TxnStatus = "approved" | "rejected" | "pending";

interface TxnItem {
  amount: number;
  status: TxnStatus;
  type: "deposit" | "withdraw";
  createdAt: string;
}

interface Stats {
  totalAmount: number;
  totalCount: number;
  approvedAmount: number;
  approvedCount: number;
  rejectedAmount: number;
  rejectedCount: number;
  pendingAmount: number;
  pendingCount: number;
}

const Txn = () => {
  const [depositStats, setDepositStats] = useState<Stats | null>(null);
  const [withdrawStats, setWithdrawStats] = useState<Stats | null>(null);

  const [staffpid, setStaffpid] = useState("");
  const [staffrole, setStaffrole] = useState("");
   const navigate = useNavigateCustom()

  /* ---------------- Get Staff Data ---------------- */
  useEffect(() => {
    const pid = localStorage.getItem("staff-parentId") || "";
    const role = localStorage.getItem("staff-role") || "";

    if(!pid || ! role){
          navigate.go('/staff/login')

    }

    setStaffpid(pid);
    setStaffrole(role);
  }, []);

  /* ---------------- Calculate Stats ---------------- */
  const calculateStats = (data: TxnItem[]): Stats => {
    return data.reduce(
      (acc, item) => {
        acc.totalAmount += item.amount;
        acc.totalCount += 1;

        if (item.status === "approved") {
          acc.approvedAmount += item.amount;
          acc.approvedCount += 1;
        }

        if (item.status === "rejected") {
          acc.rejectedAmount += item.amount;
          acc.rejectedCount += 1;
        }

        if (item.status === "pending") {
          acc.pendingAmount += item.amount;
          acc.pendingCount += 1;
        }

        return acc;
      },
      {
        totalAmount: 0,
        totalCount: 0,
        approvedAmount: 0,
        approvedCount: 0,
        rejectedAmount: 0,
        rejectedCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
      }
    );
  };

  /* ---------------- Deposit API ---------------- */
  const getDepositStmt = async () => {
    try {
      const res = await depositWithdrawService.getDepositWithdrawListstwo({
        type: "deposit",
        parentId: staffpid,
      });

      const data: TxnItem[] = res?.data?.data ?? [];
      setDepositStats(calculateStats(data));
    } catch (error) {
      console.log("Deposit API Error", error);
    }
  };

  /* ---------------- Withdraw API ---------------- */
  const getWithdrawStmt = async () => {
    try {
      const res = await depositWithdrawService.getDepositWithdrawListstwo({
        type: "withdraw",
        parentId: staffpid,
      });

      const data: TxnItem[] = res?.data?.data ?? [];
      setWithdrawStats(calculateStats(data));
    } catch (error) {
      console.log("Withdraw API Error", error);
    }
  };

  /* ---------------- Load Based On Role ---------------- */
  useEffect(() => {
    if (!staffpid || !staffrole) return;

    if (staffrole === "both") {
      getDepositStmt();
      getWithdrawStmt();
    } else if (staffrole === "deposit") {
      getDepositStmt();
    } else if (staffrole === "withdraw") {
      getWithdrawStmt();
    }
  }, [staffpid, staffrole]);

  return (
    <div className="container-fluid p-4 bg-light">

      {/* Top Buttons */}
      <div className="row g-3 mb-4">

        {(staffrole === "both" || staffrole === "deposit") && (
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card shadow-sm p-2">
              <div className="card-body">
                <div className="fw-semibold">Deposit List</div>
                <CustomLink to="/staff/deposit">
                  <button className="btn btn-primary btn-sm mt-2 text-white">
                    CLICK HERE
                  </button>
                </CustomLink>
              </div>
            </div>
          </div>
        )}

        {(staffrole === "both" || staffrole === "withdraw") && (
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card shadow-sm p-2">
              <div className="card-body">
                <div className="fw-semibold">Withdraw List</div>
                <CustomLink to="/staff/withdraw">
                  <button className="btn btn-success btn-sm mt-2 text-white">
                    CLICK HERE
                  </button>
                </CustomLink>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="row g-3">

        {/* Deposit Cards */}
        {(staffrole === "both" || staffrole === "deposit") && (
          <>
            <StatCard
              color="primary"
              value={depositStats?.totalAmount ?? 0}
              label={`Total Deposits : ${depositStats?.totalCount ?? 0}`}
              link="/depositstatement"
            />
            <StatCard
              color="success"
              value={depositStats?.approvedAmount ?? 0}
              label={`Approved Deposits : ${depositStats?.approvedCount ?? 0}`}
              link="/depositstatement"
            />
            <StatCard
              color="danger"
              value={depositStats?.rejectedAmount ?? 0}
              label={`Rejected Deposits : ${depositStats?.rejectedCount ?? 0}`}
              link="/depositstatement"
            />
          </>
        )}

        {/* Withdraw Cards */}
        {(staffrole === "both" || staffrole === "withdraw") && (
          <>
            <StatCard
              color="info"
              value={withdrawStats?.totalAmount ?? 0}
              label={`Total Withdrawals : ${withdrawStats?.totalCount ?? 0}`}
              link="/withdrawstatement"
            />
            <StatCard
              color="warning"
              value={withdrawStats?.pendingAmount ?? 0}
              label={`Pending Withdrawals : ${withdrawStats?.pendingCount ?? 0}`}
              link="/withdrawstatement"
            />
            <StatCard
              color="success"
              value={withdrawStats?.approvedAmount ?? 0}
              label={`Approved Withdrawals : ${withdrawStats?.approvedCount ?? 0}`}
              link="/withdrawstatement"
            />
            <StatCard
              color="danger"
              value={withdrawStats?.rejectedAmount ?? 0}
              label={`Rejected Withdrawals : ${withdrawStats?.rejectedCount ?? 0}`}
              link="/withdrawstatement"
            />
          </>
        )}

      </div>
    </div>
  );
};

/* ---------------- Stat Card ---------------- */
const StatCard: React.FC<StatCardProps> = ({ color, value, label }) => {
  return (
    <div className="col-xl-3 col-lg-4 col-md-6 mb-4">
      <div className={`card text-white bg-${color} shadow-sm h-100`}>
        <div className="card-body p-3">
          <h3 className="fw-bold">{value}</h3>
          <p className="mb-0">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default Txn;