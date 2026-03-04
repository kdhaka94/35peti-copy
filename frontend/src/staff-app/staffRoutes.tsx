import React from 'react'
import AuthLayout from '../pages/_layout/AuthLayout'
import StaffLogin from './pages/login/login'
import { element } from 'prop-types'
import Txn from './pages/txn/Txn'
import DepositStatement from './pages/txn/DepositStatementAdmin'
import WithdrawStatement from './pages/txn/WithdrawStatementsAdmin'
import DepositStatementManual from './pages/txn/DepositManual'
import TxnManual from './pages/txn/Txnmanual'
const StaffRoutes = () => {
  return [
    {
      path: '/staff',
      element: <AuthLayout />,
      children: [
        {
          path: 'login',
          element: <StaffLogin />,
        },
        {
           path: 'dashboard',
            element:<Txn/>,
        },
        {
            path:"deposit",
            element:<DepositStatement/>
        },
        { 
            path:"withdraw",
            element:<WithdrawStatement/>
        },
        {
            path:"deposit/manual",
            element:<DepositStatementManual/>
        },
        {
            path:"dashborad/manual",
            element:<TxnManual/>
        }

      ],
    },
  ]
}

export default StaffRoutes
