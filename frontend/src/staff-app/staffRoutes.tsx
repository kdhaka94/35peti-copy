import React from 'react'
import AuthLayout from '../pages/_layout/AuthLayout'
import StaffLogin from './pages/login/login'
import { element } from 'prop-types'
import Txn from './pages/txn/Txn'
import DepositStatement from './pages/txn/DepositStatementAdmin'
import WithdrawStatement from './pages/txn/WithdrawStatementsAdmin'
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
        }

      ],
    },
  ]
}

export default StaffRoutes
