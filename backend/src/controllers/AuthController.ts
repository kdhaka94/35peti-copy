import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import Locals from '../providers/Locals'
import { ApiController } from './ApiController'
import bcrypt from 'bcrypt-nodejs'
import { RoleType } from '../models/Role'
import { checkMaintenance, generateOTP } from '../util/maintenance'
import { UserLog } from '../models/UserLog'
import Operation from '../models/Operation'
import { Types, ObjectId } from 'mongoose'
import { IUser } from '../models/User';
import axios from 'axios'
import UserSocket from '../sockets/user-socket'
import Staff from '../models/staff'




export class AuthController extends ApiController {
  constructor() {
    super()
    this.login = this.login.bind(this)
    this.refreshToken = this.refreshToken.bind(this)
    this.getUser = this.getUser.bind(this)
    this.resendotp = this.resendotp.bind(this)
    this.telegramwebhook = this.telegramwebhook.bind(this)
    this.setTelegramBotUrl = this.setTelegramBotUrl.bind(this)
    this.verifyotp = this.verifyotp.bind(this)
  }

  static token(user: any) {
    return jwt.sign(
      {
        username: user.username,
      },
      Locals.config().appSecret,
      {
        expiresIn: Locals.config().jwtExpiresIn,
      },
    )
  }

  async login(req: Request, res: Response): Promise<any> {
    try {
      const { logs, isDemo } = req.body

      if (isDemo) {

        const dummyuser = await User.findOne({ isDemo: true });
        if (dummyuser) {
          req.body.username = dummyuser.username;
          req.body.password = '';
          const token = AuthController.token(dummyuser)
          // dummyuser.sessionId = Date.now();
          // await dummyuser.save()


          // Prevent sessionId update for demo users
          if (!dummyuser.isDemo) {
            dummyuser.sessionId = Date.now();
            await dummyuser.save();
          }

          await UserLog.insertMany([{ logs, userId: dummyuser._id }])
          return this.success(res, {
            token,
            refreshToken: dummyuser.refreshToken,
            username: dummyuser.username,
            role: dummyuser.role,
            _id: dummyuser._id,
            sessionId: dummyuser.sessionId,
            isDemo: dummyuser.isDemo,
          })
        } else {
          req.body.username = '';
          req.body.password = '';
        }

      }

      if (!req.body.username || !req.body.password) {
        return this.fail(res, 'Please, send your username and password.')
      }

      const user = await User.findOne({ username: { $regex: new RegExp(`^${req.body.username}$`, 'i') }, role: RoleType.user })

      if (!user) {
        return this.fail(res, 'User does not exixts!')
      }

      if (user.role !== RoleType.admin && !user.isLogin) {
        return this.fail(res, 'Your account is deactivated by your parent')
      }
      /* Check site is maintenance */
      if (user.role !== RoleType.admin) {
        const message = checkMaintenance()
        if (message) {
          return this.fail(res, message.message)
        }
      }

      return await user.comparePassword(req.body.password).then(async (isMatch) => {
        if (isMatch) {
          const token = AuthController.token(user)
          user.refreshToken = bcrypt.hashSync(user.username)
          user.sessionId = Date.now();
          await user.save()
          await UserLog.insertMany([{ logs, userId: user._id }])
          return this.success(res, {
            token,
            refreshToken: user.refreshToken,
            username: user.username,
            role: user.role,
            _id: user._id,
            sessionId: user.sessionId
          })
        }
        return this.fail(res, 'The email or password are incorrect!')
      })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  loginAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
      const { logs } = req.body
      if (!req.body.username || !req.body.password) {
        return this.fail(res, 'Please, send your username and password.')
      }

      // @ts-expect-error
      const user = await User.findOne({ username: { $regex: new RegExp(`^${req.body.username}$`, 'i') }, role: { $ne: 'user' } })
      console.log(user)
      if (!user) {
        return this.fail(res, 'User does not exixts!')
      }

      if (user.role !== RoleType.admin && !user.isLogin) {
        return this.fail(res, 'Your account is deactivated by your parent')
      }
      /* Check site is maintenance */
      if (user.role !== RoleType.admin) {
        const message = checkMaintenance()
        if (message) {
          return this.fail(res, message.message)
        }
      }

      return await user.comparePassword(req.body.password).then(async (isMatch = true) => {
        if (isMatch = true) {
          const token = AuthController.token(user)
          user.refreshToken = bcrypt.hashSync(user.username)
          await user.save()
          await UserLog.insertMany([{ logs, userId: user._id }])
          return this.success(res, {
            token,
            refreshToken: user.refreshToken,
            username: user.username,
            role: user.role,
            _id: user._id,
            authkey:user.auth_method
          })
        }
        return this.fail(res, 'The email or password are incorrect!')
      })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async getUser(req: Request, res: Response): Promise<Response> {
    // const username:any = req.user.username;
    // const userData = await User.findOne({username})
    return this.success(res, { user: req.user })
  }






  staffLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { clientId, password } = req.body;

    console.log(req.body)

    if (!clientId || !password) {
      return res.status(400).json({
        success: false,
        message: "ClientId and password required"
      });
    }

    const staff = await Staff.findOne({
      clientId: clientId,
    }).lean();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    if (staff.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // password hata ke response bhej rahe
    delete staff.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: staff
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

  //  async getUser(req: Request, res: Response): Promise<Response> {
  //   const userData = await User
  //     .findOne(Types.ObjectId(req.user._id))
  //     .select('-password');

  //   if (!userData) {
  //     return res.status(404).json({ message: 'User not found' });
  //   }

  //   return this.success(res, { user: userData });
  // }


  async refreshToken(req: Request, res: Response): Promise<Response> {
    const { token } = req.body

    const user = await User.findOne({ refreshToken: token })

    if (!user) {
      return this.fail(res, 'User does not exixts!')
    }

    const newToken = AuthController.token(user)

    return this.success(res, { newToken }, '')
  }

  updatePassword = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const { current_password, confirm_password, new_password } = req.body
      if (confirm_password !== new_password) {
        return this.fail(res, 'Confirm Password not matched')
      }
      const userData: any = await User.findOne({ _id: user._id })

      return await userData.comparePassword(current_password).then(async (isMatch: any) => {
        if (!isMatch) {
          return this.fail(res, 'Current Password not matched')
        }

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(new_password, salt)
        await User.findOneAndUpdate({ _id: user._id }, { $set: { password: hash } })

        await Operation.create({
          username: user.username,
          operation: "Password Change",
          doneBy: `${user.username}`,
          // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,

          description: `password change by ${user.username} !`,
        });

        return this.success(res, { sucess: true }, 'Password updated succesfully')
      })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  addTransactionPassword = async (req: Request, res: Response) => {
    console.log(req.body, "req for olldd")
    try {
      const user: any = req.user
      const { txn_password, confirm_password, current_password, new_password } = req.body
      if (confirm_password !== new_password) {
        return this.fail(res, 'Confirm Password not matched')
      }

      const username = user.username
      const user2 = await User.findOne({ username })


      const userData: any = await User.findOne({ _id: user._id });
      // Verify current password
      const isMatch = await userData.comparePassword(current_password);
      if (!isMatch) {
        return res.status(400).json({
          message: 'Current Password not matched',
          errors: { current_password: 'Current Password not matched' }
        });
      }


      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(new_password, salt)
      const hashTransactionPassword = bcrypt.hashSync(txn_password, salt)
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            password: hash,
            transactionPassword: hashTransactionPassword,
            changePassAndTxn: true,
          },
        },
      )

      await Operation.create({
        username: username,
        operation: "Password Change",
        doneBy: `${username}`,
        // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,

        description: `password change by ${username} !`,
      });

      return this.success(res, { sucess: true }, 'Password updated succesfully')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  Auth2Factor = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const { password } = req.body
      console.log(req.body, "Lokesh")


      const userData: any = await User.findOne({ _id: user._id })

      // return await userData.comparePassword(password).then(async (isMatch: any) => {
      // if (!isMatch) {
      //   return this.fail(res, 'Current Password not matched')
      // }

      const generateRandom8DigitString = (): string => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";

        for (let i = 0; i < 8; i++) {
          const randomIndex = Math.floor(Math.random() * chars.length);
          result += chars[randomIndex];
        }



        return result;
      };

      const otp = generateRandom8DigitString();

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            tgram_ukey: otp
          }
        }
      );





      return this.success(res, { sucess: true },otp)
      // })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async setTelegramBotUrl(req: Request, res: Response): Promise<any> {
    const bot_token = "8508208036:AAH-39949zXx4M1_YNEcAypSCza4BPDHWuM"
    const webhook_url = "https://api.sangamexch.com/api/telegram-webhook"
    const response = axios.post(
      `https://api.telegram.org/bot${bot_token}/setWebhook`,
      { "url": webhook_url }
    )
    if (response) {
      return this.success(res, 'Webhook registered successfully!')
    } else {
      return this.fail(res, 'Failed to register webhook: {response.text}')
    }
  }
  async resendotp(req: Request, res: Response): Promise<any> {
    try {
      const { token } = req.body
      let userExtract: any = req.user
      if (!userExtract?._id) {
        userExtract = AuthController.verifyToken(token)
      }

      const user = await User.findOne({
        username: userExtract.username,
      })

      if (!user) {
        return this.fail(res, 'User does not exixts!')
      }

      if (user.role !== RoleType.admin && !user.isLogin) {
        return this.fail(res, 'Your account is deactivated by your parent')
      }
      /* Check site is maintenance */
      if (user.role !== RoleType.admin) {
        const message = checkMaintenance()
        if (message) {
          return this.fail(res, message.message)
        }
      }
      const numberOtp = parseInt(generateOTP())
      await User.updateOne({ _id: user?._id }, { $set: { otp: numberOtp } })
      await this.sendMessage(user.telegram_chat_id, `Login Code: ${numberOtp} ${userExtract.username} . Do not give this code to anyone, even if they say they are from Telegram! Its valid for 30 sec.`);
      return this.success(res, { message: "Otp sent successfully" })


    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  static verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, Locals.config().appSecret);
      return decoded; // Return the decoded payload
    } catch (error) {
      console.error('Token verification failed:', error.message);
      throw new Error('Invalid or expired token');
    }
  }

  async verifyotp(req: Request, res: Response): Promise<any> {
    try {
      const { otp, token } = req.body

      console.log(req.body,"loesh req.body")
      const fullotp = otp
      const userExtract: any = AuthController.verifyToken(token)
      const user = await User.findOne({
        username: userExtract.username,
        // role: RoleType.user,
      })

      if (!user) {
        return this.fail(res, 'User does not exixts!')
      }

      if (user.role !== RoleType.admin && !user.isLogin) {
        return this.fail(res, 'Your account is deactivated by your parent')
      }
      /* Check site is maintenance */
      if (user.role !== RoleType.admin) {
        const message = checkMaintenance()
        if (message) {
          return this.fail(res, message.message)
        }
      }
      console.log(user,"user")
      if (user.otp == parseInt(fullotp)) {
        const token = AuthController.token(user)
        user.refreshToken = bcrypt.hashSync(user.username)
        user.sessionId = Date.now()
          // const findMessage: any = await Setting.findOne({ name: "img_desktop" }, { value: 1 })
          // @ts-ignore
          // .cache(0, 'img_desktop')
          // const findMessage2: any = await Setting.findOne({ name: "img_mobile" }, { value: 1 })
          // @ts-ignore
          // .cache(0, 'img_mobile')
        await user.save()
        return this.success(res, {
          token,
          refreshToken: user.refreshToken,
          username: user.username,
          role: user.role,
          _id: user._id,
          sessionId: user.sessionId,
          isDemo: user.isDemo,
          authStatus: user.auth_method,
          // img_desktop: findMessage?.value,
          // img_mobile: findMessage2?.value
        })
      }

      return this.fail(res, 'Invalid otp')

    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async telegramwebhook(req: Request, res: Response): Promise<any> {
    const update = req.body; // Get the update sent by Telegram
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || "No text";
      if (text.includes("/connect")) {
        const replaceData = text.replace("/connect ", "")
        const user = await User.findOne({ tgram_ukey: replaceData })
        if (user) {
          await User.updateOne({ _id: user?._id }, { $set: { auth_method: 1, telegram_chat_id: chatId } })
          UserSocket.logout({
            role: user.role,
            sessionId: '123',
            _id: user._id,
          })
          await this.sendMessage(chatId, `2-Step Verification is enabled, Now you can use this bot to login into your account.`);

        } else {
          await this.sendMessage(chatId, `Invalid Auth code`);
        }
      } else if (text.includes("/start")) {
        await this.sendMessage(chatId, `Hey! You are 1 step away from 2-Step Verification, Now please proceed for further step: /connect your_id to enable it for your account.`);
      } else {
        await this.sendMessage(chatId, `Please send correct auth code`);
      }
    }
    return this.success(res, 'Webhook registered successfully!')
  }

  async sendMessage(chatId, text) {
    const BOT_TOKEN = "8508208036:AAH-39949zXx4M1_YNEcAypSCza4BPDHWuM";
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
    try {
      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: chatId,
        text: text,
      });
      console.log("Message sent:", response.data);
    } catch (error) {
      console.error("Error sending message:", error.response.data);
    }
  }




}
