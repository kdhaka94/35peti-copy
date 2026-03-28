import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import moment from "moment";
import depositWithdrawService from "../../../services/deposit-withdraw.service";
import userService from "../../../services/user.service";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
// import CustomAutoComplete from "../../components/CustomAutoComplete";
import BankDetailModal from "./modal/BankDetailsModal";
import RejectedModal from "./modal/RejectedModal";
import mobileSubheader from '../../../admin-app/pages/_layout/elements/mobile-subheader'
import { CustomLink, useNavigateCustom } from "../../../pages/_layout/elements/custom-link";
import { useParams } from "react-router-dom";
import CustomAutoComplete from "../../../admin-app/components/CustomAutoComplete";

const WithdrawStatement = () => {
  const { payStatus } = useParams();
  const [userList, setUserList] = useState<string[]>([]);
  const [filterData, setFilterData] = useState<any>({
    startDate: moment().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: moment().format("YYYY-MM-DD"),
    reportType: "ALL",
    username: "",
  });

  const [withdrawStatement, setWithdrawStatement] = useState<any[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState<any>({});
  const [rejectedModal, setRejectedModal] = useState(false);
  const [rejectedData, setRejectedData] = useState<any>({});
  const [staffpid, setStaffpid] = useState<string>("");
  const navigate = useNavigateCustom()

  /* ---------------- Load Staff ID ---------------- */
  useEffect(() => {
    const pid = localStorage.getItem("staff-parentId") || "";

    if(!pid ){
          navigate.go('/staff/login')

    }
    setStaffpid(pid);
  }, []);

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    if (staffpid) {
      getAccountStmt(1);
    }
  }, [staffpid, rejectedModal ,payStatus]);

  useEffect(() => {
  if (payStatus) {
    setFilterData((prev: any) => ({
      ...prev,
      reportType: payStatus,
    }));
  }
}, [payStatus]);

  const getAccountStmt = async (page: number) => {
    try {
     const payload: any = {
  type: "withdraw",
  ...filterData,
  parentId: staffpid
};

// URL param override karega
if (payStatus) {
  payload.reportType = payStatus;
}

const res = await depositWithdrawService.getDepositWithdrawListstwo(payload);

      setWithdrawStatement(res?.data?.data || []);
      setPageCount(res?.data?.totalPages || 0);
    } catch (error) {
      toast.error("Failed to fetch withdraw statements");
    }
  };

  /* ---------------- Form Change ---------------- */
  const handleFormChange = (e: any) => {
    setFilterData({
      ...filterData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    getAccountStmt(1);
  };

  const handleClick = (details: any) => {
    setBankDetails(details);
  };

  const onSuggestionsFetchRequested = ({ value }: any) => {
    return userService.getUserListSuggestion({ username: value });
  };

  const onSelectUser = (username: any) => {
    setFilterData({ ...filterData, username });
  };

  /* ---------------- Approve / Reject ---------------- */
  const getDepositUpdateStatus = async (item: any, type: string) => {
    if (type === "rejected") {
      setRejectedModal(true);
      setRejectedData(item);
      return;
    }

    try {
      const response = await depositWithdrawService.updateDepositWithdrawStatus({
        id: item._id,
        narration: item.remark,
        balanceUpdateType: "W",
        status: type,
      });

      toast.success(response?.data?.message);
      getAccountStmt(1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const handleCopy = (item: any) => {
  const textToCopy = `
Username: ${item.username}
Account Holder: ${item.bankDetail.accountHolderName || "N/A" }
Account Number: ${item.bankDetail.accountNumber || "N/A"}
IFSC: ${item.bankDetail.ifscCode || "N/A"}
UPI: ${item.bankDetail.upiId || "N/A"}
  `

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      toast.success('Copied to clipboard ✅')
    })
    .catch(() => {
      toast.error('Copy failed ❌')
    })
}

  const handleLogout = () => {
    localStorage.clear(); // sab clear karega
    navigate.go('/staff/login');
};

useEffect(() => {
  if (withdrawStatement.length > 0) {
    const uniqueUsers = [
      //@ts-ignore
      ...new Set(withdrawStatement.map((item: any) => item.username))
    ];
    setUserList(uniqueUsers);
  }
}, [withdrawStatement]);

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin("Withdraw Statements")}
        <div style={{justifyContent:"space-between"}} className="d-flex mb-3 mx-3 mt-2">
                  
                                                    <CustomLink  className="btn btn-success btn-sm" to={"/staff/dashboard"} >Home</CustomLink>
                              
                                  <button
                                      className="btn btn-danger btn-sm"
                                      onClick={handleLogout}
                                  >
                                      Logout
                                  </button>
                              </div>
      <div className="container-fluid">
        <div className="row">
          <div className={!isMobile ? "col-md-12 mt-1" : "col-md-12 padding-custom"}>

            {/* Filter Section */}
            <div className="card-body p15 bg-gray mb-20">
              <form onSubmit={handleSubmitForm}>
                <div className="row row5">

                  <div className="col-lg-2 mbc-5">
                    <label>User</label>
                    {/* <CustomAutoComplete
                      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                      onChangeSelectValue={onSelectUser}
                    /> */}<input
                      name="username"
                      type="text"
                      placeholder="Search Username"
                      value={filterData.username}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>

                  <div className=" col-6 col-lg-2 mbc-5">
                    <label>Start Date</label>
                    <input
                      name="startDate"
                      type="date"
                      value={filterData.startDate}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>

                  <div className=" col-6 col-lg-2 mbc-5">
                    <label>End Date</label>
                    <input
                      name="endDate"
                      type="date"
                      value={filterData.endDate}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-lg-2 mbc-5">
                    <label>Status</label>
                   <select
  name="reportType"
  value={payStatus || filterData.reportType}
  onChange={handleFormChange}
  className="form-control"
>
                      <option value="ALL">All</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="col-lg-2 mbc-5">
                    <label>&nbsp;</label>
                    <button type="submit" className="btn btn-primary btn-block">
                      Submit
                    </button>
                  </div>

                </div>
              </form>
            </div>

            {/* Table */}
            <div style={{zoom:"0.4"}}>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th  className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Date</th>
                      <th  className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>User</th>
                      <th  className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Details</th>
                         <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Ac Holder Name
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                       Ac. Number
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                       IFSC
                      </th>
                       <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                       UPI
                      </th>
                      <th className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}> Request Type</th>
                      <th className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Amount</th>
                      <th className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                      <th className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawStatement.length > 0 ? (
                      withdrawStatement.map((item: any) => (
                        <tr key={item._id}>
                          <td>{moment(item.createdAt).format("DD/MM/YYYY h:mm A")}</td>
                          <td>{item.username}</td>
                          {/* <td>
                            <button onClick={() => handleClick(item.bankDetail)}>
                              View
                            </button>
                          </td> */}
                             <td style={{ textAlign: 'center' }}>
                            <button onClick={() => handleCopy(item)}>
                              Copy
                            </button>
                            {item.accountType === 'qr' && item.bankDetail?.qrImageUrl && (
                              <button
                                onClick={() => handleClick(item.bankDetail)}
                                style={{ marginLeft: '5px' }}
                              >
                                View QR
                              </button>
                            )}
                          </td>
                          <td>{item.bankDetail.accountHolderName}</td>
                          <td>{item.bankDetail.accountNumber}</td>
                          <td>{item.bankDetail.ifscCode}</td>
                          <td>{item.bankDetail.upiId}</td>
                          <td>{item.accountType}</td>
                          <td>{item.amount}</td>
                          <td style={{ textTransform: "capitalize" }}>
                            {item.status}
                          </td>
                          <td>
                            {item.status === "pending" ? (
                              <>
                                <button onClick={() => getDepositUpdateStatus(item, "approved")}>
                                  Approve
                                </button>
                                <button onClick={() => getDepositUpdateStatus(item, "rejected")}>
                                  Reject
                                </button>
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No Result Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <ReactPaginate
                breakLabel="..."
                nextLabel=">>"
                previousLabel="<<"
                pageCount={pageCount}
                pageRangeDisplayed={5}
                onPageChange={(data) => getAccountStmt(data.selected + 1)}
                containerClassName={"pagination"}
                activeClassName={"active"}
              />
            </div>

          </div>
        </div>

        <BankDetailModal bankDetails={bankDetails} />
        <RejectedModal
          show={rejectedModal}
          close={() => setRejectedModal(false)}
          data={rejectedData}
        />
      </div>
    </>
  );
};

export default WithdrawStatement;
