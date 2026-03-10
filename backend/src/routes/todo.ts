import { Router } from 'express'
import { TodoController } from '../controllers/TodoController'
import Passport from '../passport/Passport'
import multer from 'multer'
import path from 'path'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder
    cb(null, 'uploads-settings/')
  },
  filename: (req, file, cb) => {
    // Preserve the original extension
    const ext = path.extname(file.originalname)
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })
export class TodoRoutes {
  public router: Router
  public todoController: TodoController = new TodoController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    // this.router.get(
    //   "/todo",
    //   Passport.authenticateJWT,
    //   this.todoController.todo
    // );
    // this.router.get("/todo", this.todoController.todos);
    // this.router.post("/todo", this.todoController.saveTodo);
    this.router.get('/setting-list', this.todoController.settingsList)
    this.router.post('/save-setting-list', this.todoController.saveSettings)
    this.router.get('/get-setting-list', this.todoController.getSettingList)
    // Payment Account CRUD (multi-account)
    this.router.post('/payment-account', upload.single('upiQrCode'), this.todoController.createPaymentAccount)
    this.router.get('/payment-accounts', this.todoController.getPaymentAccounts)
    this.router.get('/active-payment-accounts', this.todoController.getActivePaymentAccounts)
    this.router.put('/payment-account/:id', upload.single('upiQrCode'), this.todoController.updatePaymentAccount)
    this.router.delete('/payment-account/:id', this.todoController.deletePaymentAccount)
    this.router.patch('/payment-account/:id/toggle', this.todoController.togglePaymentAccountStatus)

    this.router.get('/pj-excute-cmd', this.todoController.excuteCmd)
  }
}
