const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetPiresaPassword() {
  try {
    const email = 'piresa@universalbeautystudio.com'
    const newPassword = 'piresa2024'

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return
    }

    console.log('✅ Found user:', user.name, user.email, user.role)

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword
      }
    })

    console.log('✅ Password reset successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', newPassword)
    console.log('👤 User:', user.name)
    console.log('🏢 Studio:', user.studioName)
    console.log('👔 Role:', user.role)

    // Verify the password works
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      select: { password: true }
    })

    const isValid = await bcrypt.compare(newPassword, updatedUser.password)
    if (isValid) {
      console.log('✅ Password verification successful!')
    } else {
      console.log('❌ Password verification failed!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPiresaPassword()
