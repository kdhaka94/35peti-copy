/**
 * Generate API Key for mrd0018 crash game operator
 * Links to the "Loom1234" white-label admin in 35peti
 *
 * Usage: npx ts-node scripts/generate-api-key-mrd0018.ts
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

// Load env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') })

// Import models
import { User } from '../backend/src/models/User'
import { WhiteLabel } from '../backend/src/models/WhiteLabel'
import { ApiKey, generateApiKeyPair, hashSecret } from '../backend/src/models/ApiKey'

async function main() {
  const mongoUrl = process.env.MONGOOSE_URL
  if (!mongoUrl) {
    console.error('MONGOOSE_URL not found in .env')
    process.exit(1)
  }

  await mongoose.connect(mongoUrl)
  console.log('Connected to MongoDB')

  // 1. Find user Loom1234
  const user = await User.findOne({ username: 'Loom1234' })
  if (!user) {
    console.error('User "Loom1234" not found')
    process.exit(1)
  }
  console.log(`Found user: ${user.username} (ID: ${user._id})`)

  // 2. Find their white-label
  const whiteLabel = await WhiteLabel.findOne({ userId: user._id })
  if (!whiteLabel) {
    console.error('White-label not found for Loom1234')
    process.exit(1)
  }
  console.log(`Found white-label: ${whiteLabel.companyName} (ID: ${whiteLabel._id})`)

  // 3. Check if API key already exists
  const existingKey = await ApiKey.findOne({ whiteLabelId: whiteLabel._id, isActive: true })
  if (existingKey) {
    console.log('\n⚠️  An active API key already exists for this white-label:')
    console.log(`   Key: ${existingKey.key}`)
    console.log('   (Secret is hashed and cannot be recovered)')
    console.log('\n   Creating a new one anyway...\n')
  }

  // 4. Generate key pair
  const { key, secret } = generateApiKeyPair()
  const secretHash = hashSecret(secret)

  const apiKey = new ApiKey({
    whiteLabelId: whiteLabel._id,
    key,
    secretHash,
    label: 'mrd0018 Crash Game',
  })
  await apiKey.save()

  console.log('\n' + '='.repeat(60))
  console.log('🔑 API KEY GENERATED SUCCESSFULLY')
  console.log('='.repeat(60))
  console.log(`API Key:    ${key}`)
  console.log(`API Secret: ${secret}`)
  console.log(`Label:      mrd0018 Crash Game`)
  console.log(`White-Label: ${whiteLabel.companyName}`)
  console.log('='.repeat(60))
  console.log('\n⚠️  SAVE THE SECRET NOW — it will NOT be shown again!')
  console.log('\nAdd these to mrd0018 .env:')
  console.log(`PETI_API_KEY=${key}`)
  console.log(`PETI_API_SECRET=${secret}`)
  console.log('')

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
