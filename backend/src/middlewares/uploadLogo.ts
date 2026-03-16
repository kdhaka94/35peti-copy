import multer from "multer"
import path from "path"

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,"uploads-settings/logo-images")
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