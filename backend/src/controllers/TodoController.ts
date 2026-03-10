import { exec } from 'child_process'
import { Request, Response } from 'express'
import { existsSync, unlinkSync, writeFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import path from 'path'
import { ISetting, Setting } from '../models/Setting'
import { Todo } from '../models/Todo'
import { ApiController } from './ApiController'
import { PaymentAccount } from '../models/Payments'
import { Types } from 'mongoose'

export class TodoController extends ApiController {
  excuteCmd = async (req: Request, res: Response) => {
    const pathURL = path.join(__dirname, '../../')
    exec(`${pathURL}excute.sh`, function (err, stdout, stderr) {
      //   // handle err, stdout, stderr
      console.log(err, stdout)
    })
    return this.success(res, { path: pathURL })
  }

  saveSettings = async (req: Request, res: Response) => {
    try {
      const pathURL = path.join(__dirname, '../../')
      const { settingList } = req.body
      const headerMessageJson: any = {
        headerMessageLink: '',
        headerMessage: '',
      }

      settingList.map(async (setting: any) => {
        if (setting.name === 'userMaintenanceMessage' && setting.active) {
          writeFile(`${pathURL}public/maintenance.json`, `{"message":"${setting.value}"}`, {
            flag: 'w',
          })
        } else if (setting.name === 'userMaintenanceMessage') {
          if (existsSync(`${pathURL}public/maintenance.json`)) {
            unlinkSync(`${pathURL}public/maintenance.json`)
          }
        }

        if (setting.name === 'adminMessage' || setting.name === 'userMessage') {
          writeFile(`${pathURL}public/${setting.name}.json`, `{"message":"${setting.value}"}`, {
            flag: 'w',
          })
        }

        if (setting.name === 'headerMessage' || setting.name === 'headerMessageLink') {
          headerMessageJson[setting.name] = setting.value
        }

        await Setting.findOneAndUpdate(
          { name: setting.name },
          { $set: { value: setting.value, active: setting.active } },
        )
      })
      if (headerMessageJson.headerMessage) {
        writeFile(`${pathURL}public/headerMessage.json`, JSON.stringify(headerMessageJson), {
          flag: 'w',
        })
      }

      return this.success(res, {}, 'Setting Saved')
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  // --- Payment Account CRUD (multi-account) ---

  createPaymentAccount = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const userId = user?._id

      const count = await PaymentAccount.countDocuments({ userId })
      if (count >= 15) {
        return this.fail(res, 'Maximum 15 accounts allowed. Delete an existing account first.')
      }

      const { bankName, accountHolderName, accountNumber, ifscCode, upiId, upiName, isActive } = req.body

      const accountData: any = {
        userId,
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode,
        upiId,
        upiName,
        isActive: isActive !== undefined ? isActive : true,
      }

      if (req.file) {
        accountData.upiQrCode = req.file.path
      }

      const account = await PaymentAccount.create(accountData)
      return this.success(res, { account }, 'Account added successfully')
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  getPaymentAccounts = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const accounts = await PaymentAccount.find({ userId: user?._id }).sort({ createdAt: -1 })
      return this.success(res, { accounts })
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  getActivePaymentAccounts = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const accounts = await PaymentAccount.find({ userId: user?.parentId, isActive: true }).sort({ createdAt: -1 })
      return this.success(res, { accounts })
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  updatePaymentAccount = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { bankName, accountHolderName, accountNumber, ifscCode, upiId, upiName, isActive } = req.body

      const account = await PaymentAccount.findById(id)
      if (!account) return this.fail(res, 'Account not found')

      if (bankName !== undefined) account.bankName = bankName
      if (accountHolderName !== undefined) account.accountHolderName = accountHolderName
      if (accountNumber !== undefined) account.accountNumber = accountNumber
      if (ifscCode !== undefined) account.ifscCode = ifscCode
      if (upiId !== undefined) account.upiId = upiId
      if (upiName !== undefined) account.upiName = upiName
      if (isActive !== undefined) account.isActive = isActive

      if (req.file) {
        // Delete old QR file
        if (account.upiQrCode && existsSync(account.upiQrCode)) {
          unlinkSync(account.upiQrCode)
        }
        account.upiQrCode = req.file.path
      }

      await account.save()
      return this.success(res, { account }, 'Account updated successfully')
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  deletePaymentAccount = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const account = await PaymentAccount.findById(id)
      if (!account) return this.fail(res, 'Account not found')

      if (account.upiQrCode && existsSync(account.upiQrCode)) {
        unlinkSync(account.upiQrCode)
      }

      await PaymentAccount.findByIdAndDelete(id)
      return this.success(res, {}, 'Account deleted successfully')
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  togglePaymentAccountStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const account = await PaymentAccount.findById(id)
      if (!account) return this.fail(res, 'Account not found')

      account.isActive = !account.isActive
      await account.save()
      return this.success(res, { account }, `Account ${account.isActive ? 'activated' : 'deactivated'}`)
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  // --- Existing settings methods ---

  settingsList = async (req: Request, res: Response) => {
    const settings = await Setting.find({})
    return this.success(res, { settings })
  }

  getSettingList = async (req: Request, res: Response) => {
    let settings = await Setting.find({})
    const settingsData: any = {}
    //@ts-expect-error
    settings.map((setting: ISetting) => {
      settingsData[setting.name] = setting.value
    })
    return this.success(res, { settings: settingsData })
  }


}
