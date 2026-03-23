import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import mobileSubheader from '../../../admin-app/pages/_layout/elements/mobile-subheader'
// import CustomAutoComplete from '../../components/CustomAutoComplete'
import moment from 'moment'
import userService from '../../../services/user.service'
import depositWithdrawService from '../../../services/deposit-withdraw.service'
import ReactPaginate from 'react-paginate'
import BankDetailModal from './modal/BankDetailsModal'
import { toast } from 'react-toastify'
import RejectedModal from './modal/RejectedModal'
import { CustomLink, useNavigateCustom } from '../../../pages/_layout/elements/custom-link'
import { useParams } from 'react-router-dom'
import CustomAutoComplete from '../../../admin-app/components/CustomAutoComplete'
const DepositStatement = () => {
  const { payStatus } = useParams()
  const [filterData, setFilterData] = React.useState<any>({
    startDate: '',
    endDate: '',
    reportType: '',
    username: '',
  })
  const [depositStatement, setDepositStatement] = useState([])
  const [pageCount, setPageCount] = React.useState<any>(0)
  const [userList, setUserList] = useState<string[]>([]);
  const [bankDetails, setBankDetails] = useState({})
  const [rejectedModal, setRejectedModal] = useState(false)
  const [rejectedData, setRejectedData] = useState<any>({})
    const [staffpid, setStaffpid] = useState<string>("");
      const navigate = useNavigateCustom()
  
  // useEffect(() => {
  //   getAccountStmt(1)
  // }, [rejectedModal])

  useEffect(() => {
      const pid = localStorage.getItem("staff-parentId") || "";

    if(!pid ){
          navigate.go('/staff/login')

    }
      setStaffpid(pid);
    }, []);

  React.useEffect(() => {
   setFilterData((prev: any) => ({
  ...prev,
  startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD')
}))
  }, [])

  React.useEffect(() => {
  if (payStatus) {
    setFilterData((prev: any) => ({
      ...prev,
      reportType: payStatus,
    }))
  }
}, [payStatus])

  const handleClick = (details: any) => {
    setBankDetails(details)
  }

  // const getAccountStmt = (page: number) => {
  //   depositWithdrawService
  //     .getDepositWithdrawLists({ type: 'deposit', ...filterData })
  //     .then((res) => setDepositStatement(res?.data?.data))
  // }


   /* ---------------- Fetch Data ---------------- */
    useEffect(() => {
      if (staffpid) {
        getAccountStmt(1);
      }
    }, [staffpid, rejectedModal,payStatus]);
  
    const getAccountStmt = async (page: number) => {
      try {
       const payload: any = {
  type: "deposit",
  ...filterData,
  parentId: staffpid
}

// URL se aaya ho toh override karega
if (payStatus) {
  payload.reportType = payStatus
}

const res = await depositWithdrawService.getDepositWithdrawListstwo(payload);
  
        setDepositStatement(res?.data?.data || []);
        setPageCount(res?.data?.totalPages || 0);
      } catch (error) {
        toast.error("Failed to fetch withdraw statements");
      }
    };

  const handleformchange = (event: any) => {
  const { name, value } = event.target
  setFilterData((prev:any) => ({
    ...prev,
    [name]: value
  }))
}
  const handleSubmitform = (event: any) => {
    event.preventDefault()
    getAccountStmt(1)
  }

  const onSuggestionsFetchRequested = ({ value }: any) => {
    return userService.getUserListSuggestion({ username: value })
  }
  const onSelectUser = (user: any) => {
  setFilterData((prev:any) => ({
    ...prev,
    username: user.username   // ✅ only string
  }))
}
  const getDepositUpdateStatus = async (item: any, type: string) => {
    if (type == 'rejected') {
      setRejectedModal(true)
      setRejectedData(item)
    } else {
      const obj = {
        id: item._id,
        narration: item.remark,
        balanceUpdateType: 'D',
        status: type,
      }
      const response = await depositWithdrawService.updateDepositWithdrawStatus(obj)
      try {
        if (response?.data) {
          getAccountStmt(1)
          toast.success(response?.data?.message)
        }
      } catch (error) {
        toast.error(response?.data?.message)
      }
    }
  }
  const handleLogout = () => {
    localStorage.clear(); // sab clear karega
    navigate.go('/staff/login');
};

useEffect(() => {
  if (depositStatement.length > 0) {
    const uniqueUsers = [
      //@ts-ignore
      ...new Set(depositStatement.map((item: any) => item.username))
    ];
    setUserList(uniqueUsers);
  }
}, [depositStatement]);

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Deposit Statements')}
        <div style={{justifyContent:"space-between"}} className="d-flex mb-3 mx-3 mt-2">
            
                                                  <CustomLink  className="btn btn-success btn-sm" to={"/staff/dashboard"} >Home</CustomLink>
                            
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
      <div className='container-fluid'>
        <div className='row'>
          <div className={!isMobile ? 'col-md-12 mt-1' : 'col-md-12 padding-custom'}>
            <div className='card-body p15 bg-gray mb-20'>
              <form
                className='ng-pristine ng-valid ng-touched mb-0'
                method='post'
                onSubmit={handleSubmitform}
              >
                <div className='row row5'>
                  <div className='col-6 col-lg-2 mbc-5'>
                    <label className='label'>User</label>
                    {/* <CustomAutoComplete
                      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                      onSelectUser={onSelectUser}
                    /> */}
                     <select
    name="username"
    value={filterData.username}
    onChange={handleformchange}
    className="form-control"
  >
    <option value="">All Users</option>

    {userList.map((user: string, index: number) => (
      <option key={index} value={user}>
        {user}
      </option>
    ))}
  </select>
                  </div>
                  <div className='col-6 col-lg-2 mbc-5'>
                    <div className='form-group mb-0'>
                      <label className='label'>Start Date</label>
                      <div className='mx-datepicker'>
                        <div className='mx-input-wrapper'>
                          <input
                            name='startDate'
                            type='date'
                            autoComplete='off'
                            onChange={handleformchange}
                            defaultValue={filterData.startDate}
                            placeholder='Select Date'
                            className='mx-input ng-pristine ng-valid ng-touched'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-6 col-lg-2 mbc-5'>
                    <div className='form-group mb-0'>
                      <label className='label'>End Date</label>
                      <div className='mx-datepicker'>
                        <div className='mx-input-wrapper'>
                          <input
                            name='endDate'
                            type='date'
                            autoComplete='off'
                            defaultValue={filterData.endDate}
                            onChange={handleformchange}
                            placeholder='Select Date'
                            className='mx-input ng-untouched ng-pristine ng-valid'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-12 col-lg-2 mbc-5'>
                    <div className='form-group mb-0'>
                      <label className='label'>Type</label>
                      <select
                        name='reportType'
                        value={payStatus || filterData.reportType}
                        onChange={handleformchange}
                        className='custom-select ng-untouched ng-pristine ng-valid'
                      >
                        <option value=''>All </option>
                        <option value='approved'>Approved</option>
                        <option value='pending'>Pending</option>
                        <option value='rejected'>Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className='col-12 col-lg-1 mbc-5'>
                    <label className='label'>&nbsp;</label>
                    <button type='submit' className='btn btn-primary btn-block'>
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div style={{zoom:"0.4"}}>
              <div className='table-responsive'>
                <table className='table table-bordered' id='customers1'>
                  <thead>
                    <tr>
                      <th
                        className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}
                      >
                        Date
                      </th>
                      <th
                        className='bg2 text-white'
                        style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}
                      >
                        User Name
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Details
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        UTR
                      </th>
                      {/* <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Approved By
                      </th> */}
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Request Type
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Amount
                      </th>
                      {/* <th className='bg2 text-white' style={{ width: '35%', textAlign: 'center' }}>
                        Bank Name
                      </th> */}
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Status
                      </th>
                      <th className='bg2 text-white' style={{ width: '35%', textAlign: 'center' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositStatement ? (
                      depositStatement.map((item: any) => (
                        <tr key={item._id}>
                          <td style={{ textAlign: 'center' }}>
                            {moment(item.createdAt).format('DD/MM/YYYY h:mm:ss A')}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.username}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              data-toggle='modal'
                              data-target='#bankModal'
                              onClick={() => handleClick(item)}
                            >
                              View
                            </button>
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.utrno}</td>

                          {/* <td></td> */}
                          <td style={{ textAlign: 'center' }}>{item.type}</td>
                          <td style={{ textAlign: 'center' }}>{item.amount}</td>
                          <td style={{ textAlign: 'center' }}>
                            {' '}
                            {item.status == 'rejected' ? (
                              <p style={{ color: 'red', textTransform: 'capitalize' }}>
                                {item.status}
                              </p>
                            ) : item.status == 'pending' ? (
                              <p style={{ color: 'orange', textTransform: 'capitalize' }}>
                                {item.status}
                              </p>
                            ) : (
                              <p style={{ color: 'green', textTransform: 'capitalize' }}>
                                {item.status}
                              </p>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {item.status == 'pending' ? (
                              <div
                                style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
                              >
                                <button onClick={() => getDepositUpdateStatus(item, 'approved')}>
                                  Approved
                                </button>
                                <button onClick={() => getDepositUpdateStatus(item, 'rejected')}>
                                  Rejected
                                </button>
                              </div>
                            ) : (
                              <p>-</p>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className='text-center'>
                          No Result Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <ReactPaginate
                breakLabel='...'
                nextLabel='>>'
                // onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                containerClassName={'pagination'}
                activeClassName={'active'}
                previousLabel={'<<'}
                breakClassName={'break-me'}
              />
            </div>
          </div>
          <BankDetailModal bankDetails={bankDetails} />
          <RejectedModal
            show={rejectedModal}
            close={() => setRejectedModal(!rejectedModal)}
            data={rejectedData}
          />
        </div>
      </div>
    </>
  )
}

export default DepositStatement
