import { exec } from 'child_process'
import { Request, Response } from 'express'
import { existsSync, unlinkSync, writeFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import path from 'path'
import { ISetting, Setting } from '../models/Setting'
import { Todo } from '../models/Todo'
import { ApiController } from './ApiController'
import { Payment } from '../models/Payments'
import { PaymentAccount } from '../models/PaymentAccount'
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

  savepaymentSettings = async (req: Request, res: Response) => {
    try {
      const pathURL = path.join(__dirname, '../../')
      const user: any = req.user
      const { settingList } = req.body
      const hostName = user?._id
      console.log(req.files, " req.files req.files")
      //@ts-expect-error
      let files = req.files?.reduce((acc, file: any) => {
        acc[file.fieldname] = file.path
        return acc
      }, {})
      console.log(files)
      let settingsData: any = await Payment.find({
        $or: [
          { userId: { $in: hostName } }, // Matches any value in the hostName array
          { userId: Types.ObjectId("63382d9bfbb3a573110c1ba5") } // Matches static ID
        ]
      });
      console.log(settingsData, "settingsData")
      settingsData = settingsData.reduce((acc: any, setting: any) => {
        acc[setting.name] = setting
        return acc
      })
      console.log(settingsData)

      settingList.map(async (setting: any, index: number) => {
        if (setting.inputType === 'file') {
          const oldFile = settingsData[setting.name].value
          if (files[`settingList[${index}][${setting.name}-file]`]) {
            setting['value'] = files[`settingList[${index}][${setting.name}-file]`]
            const filePath = path.join(pathURL, oldFile)
            if (existsSync(filePath) && oldFile) {
              unlinkSync(filePath)
            }
          } else {
            setting['value'] = oldFile
          }
        }
        console.log(hostName)
        console.log(setting)
        await Payment.findOneAndUpdate(
          { name: setting.name, userId: hostName },
          {
            $set: {
              value: setting.value,
              active: setting.active || null,
              name: setting.name,
              label: setting.label,
              userId: hostName,
              inputType: setting?.inputType
            },
          },
          {
            upsert: true, // Create a new document if no match is found
            new: true, // Return the new document after update/insert
          }
        )
      })
      return this.success(res, {}, 'Setting Saved')
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }
  settingsList = async (req: Request, res: Response) => {
    const settings = await Setting.find({})
    return this.success(res, { settings })
  }

  paymentSettingsList = async (req: Request, res: Response) => {
    const userinfo: any = req.user
    let settings = await Payment.find({ userId: userinfo?._id })

    if (settings.length <= 0) {
      let settingsData: any = []
      let settingsCommon = await Payment.find({ userId: Types.ObjectId("63382d9bfbb3a573110c1ba5") })
      settingsCommon.map((setting: any) => {
        setting.value = ""
        settingsData.push(setting)
      })
      settings = settingsData;

    }
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
  getUserSettingList = async (req: Request, res: Response) => {
    const userinfo: any = req.user
    console.log(userinfo)
    let settiddngs = await Payment.find({ userId: userinfo?.parentId })

    if (settiddngs.length <= 0) {
      settiddngs = await Payment.find({ userId: Types.ObjectId("63382d9bfbb3a573110c1ba5") })
    }

    console.log(settiddngs)

    const settingsData: any = {}
    //@ts-expect-error
    settiddngs.map((setting: ISetting) => {
      settingsData[setting.name] = setting.value
    })
    if (settiddngs.length <= 0) {

    }
    return this.success(res, { settings: settingsData })
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

  addPaymentAccount = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const count = await PaymentAccount.countDocuments({ userId: user?._id })
      if (count >= 15) {
        return this.fail(res, 'Maximum 15 accounts allowed')
      }
      let upiQrCode = ''
      const files: any = req.files
      if (files && files.length > 0) {
        upiQrCode = files[0].path
      }
      const account = new PaymentAccount({
        bankName: req.body.bankName,
        upiId: req.body.upiId,
        upiName: req.body.upiName,
        upiQrCode,
        ifscCode: req.body.ifscCode,
        accountNumber: req.body.accountNumber,
        accountHolderName: req.body.accountHolderName,
        isActive: true,
        userId: user?._id,
      })
      await account.save()
      return this.success(res, { account }, 'Account Added')
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  updatePaymentAccount = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const { id } = req.params
      const updateData: any = {
        bankName: req.body.bankName,
        upiId: req.body.upiId,
        upiName: req.body.upiName,
        ifscCode: req.body.ifscCode,
        accountNumber: req.body.accountNumber,
        accountHolderName: req.body.accountHolderName,
      }
      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive
      }
      const files: any = req.files
      if (files && files.length > 0) {
        const oldAccount: any = await PaymentAccount.findById(id)
        if (oldAccount?.upiQrCode) {
          const oldPath = path.join(__dirname, '../../', oldAccount.upiQrCode)
          if (existsSync(oldPath)) unlinkSync(oldPath)
        }
        updateData.upiQrCode = files[0].path
      }
      const account = await PaymentAccount.findOneAndUpdate(
        { _id: id, userId: user?._id },
        { $set: updateData },
        { new: true },
      )
      if (!account) return this.fail(res, 'Account not found')
      return this.success(res, { account }, 'Account Updated')
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  deletePaymentAccount = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const { id } = req.params
      const account: any = await PaymentAccount.findOneAndDelete({ _id: id, userId: user?._id })
      if (!account) return this.fail(res, 'Account not found')
      if (account.upiQrCode) {
        const filePath = path.join(__dirname, '../../', account.upiQrCode)
        if (existsSync(filePath)) unlinkSync(filePath)
      }
      return this.success(res, {}, 'Account Deleted')
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  getUserPaymentAccounts = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      let accounts = await PaymentAccount.find({ userId: user?.parentId, isActive: true })
      if (accounts.length <= 0) {
        accounts = await PaymentAccount.find({
          userId: Types.ObjectId('63382d9bfbb3a573110c1ba5'),
          isActive: true,
        })
      }
      return this.success(res, { accounts })
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }
}
