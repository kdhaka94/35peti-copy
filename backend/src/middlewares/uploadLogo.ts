import multer from "multer"
import path from "path"
import fs from "fs"

// Ensure the upload directory exists (survives deploys/restarts)
const LOGO_UPLOAD_DIR = "uploads-settings/logo-images"
fs.mkdirSync(LOGO_UPLOAD_DIR, { recursive: true })

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LOGO_UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `logo-${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`
    cb(null, uniqueName)
  }
})

export const uploadLogo = multer({
  storage: logoStorage,
  limits:{
    fileSize:5 * 1024 * 1024
  }
})