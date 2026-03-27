import React, { useEffect, useState } from "react";
import depositWithdrawService from "../../../services/deposit-withdraw.service";
import { CustomLink, useNavigateCustom } from "../../../pages/_layout/elements/custom-link";


interface StatCardProps {
    color: string;
    value: number;
    label: string;
    link: string;
    payStatus?: string;
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
    const [staffpay, setStaffpay] = useState('')
    const navigate = useNavigateCustom()

    /* ---------------- Get Staff Data ---------------- */
    useEffect(() => {
        const pid = localStorage.getItem("staff-parentId") || "";
        const role = localStorage.getItem("staff-role") || "";
        const paymode = localStorage.getItem('staff-paymode') || "";
        setStaffpid(pid);
        setStaffrole(role);

        if (!pid || !role) {
            navigate.go('/staff/login')

        }

        if (paymode == "manual") {
            // navigate.go('/staff/dashborad/manual')
            navigate.go('/staff/dashboard')
            return
        }
        navigate.go('/staff/dashborad/manual')

      
    }, []);

    const handleLogout = () => {
        localStorage.clear(); // sab clear karega
        navigate.go('/staff/login');
    };

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
             <div style={{justifyContent:"space-between"}} className="d-flex mb-3 mx-3 mt-2">
                              
                                                                <CustomLink  className="btn btn-success btn-sm" to={"/staff/dashboard"} >Home</CustomLink>
                                          
                                              <button
                                                  className="btn btn-danger btn-sm"
                                                  onClick={handleLogout}
                                              >
                                                  Logout
                                              </button>
                                          </div>
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
                            link="deposit"
                            payStatus=""
                        />
                        <StatCard
                            color="success"
                            value={depositStats?.approvedAmount ?? 0}
                            label={`Approved Deposits : ${depositStats?.approvedCount ?? 0}`}
                            link="deposit"
                            payStatus="approved"
                        />
                        <StatCard
                            color="danger"
                            value={depositStats?.rejectedAmount ?? 0}
                            label={`Rejected Deposits : ${depositStats?.rejectedCount ?? 0}`}
                            link="deposit"
                            payStatus="rejected"
                        />
                        <StatCard
                            color="warning"
                            value={depositStats?.pendingAmount ?? 0}
                            label={`Pending Deposits : ${depositStats?.pendingCount ?? 0}`}
                            link="deposit"
                            payStatus="pending"
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
                            link="withdraw"
                            payStatus=""
                        />
                        <StatCard
                            color="warning"
                            value={withdrawStats?.pendingAmount ?? 0}
                            label={`Pending Withdrawals : ${withdrawStats?.pendingCount ?? 0}`}
                            link="withdraw"
                            payStatus="pending"
                        />
                        <StatCard
                            color="success"
                            value={withdrawStats?.approvedAmount ?? 0}
                            label={`Approved Withdrawals : ${withdrawStats?.approvedCount ?? 0}`}
                            link="withdraw"
                            payStatus="approved"
                        />
                        <StatCard
                            color="danger"
                            value={withdrawStats?.rejectedAmount ?? 0}
                            label={`Rejected Withdrawals : ${withdrawStats?.rejectedCount ?? 0}`}
                            link="withdraw"
                            payStatus="rejected"
                        />
                    </>
                )}

            </div>
        </div>
    );
};

/* ---------------- Stat Card ---------------- */
const StatCard: React.FC<StatCardProps> = ({ color, value, label ,link,payStatus }) => {
    return (
        <div className="col-xl-3 col-lg-4 col-md-6 mb-4">
            <CustomLink to={`/staff/${link}/${payStatus}`} className={`card text-white bg-${color} shadow-sm h-100`}>
                <div className="card-body p-3">
                    <h3 className="fw-bold">{value}</h3>
                    <p className="mb-0">{label}</p>
                </div>
            </CustomLink>
        </div>
    );
};

export default Txn;