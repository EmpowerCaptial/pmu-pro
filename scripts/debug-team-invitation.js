const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function debugTeamInvitation() {
  console.log('🔍 DEBUGGING TEAM INVITATION ISSUE...');
  
  const testData = {
    memberEmail: 'debug-test@example.com',
    memberName: 'Debug Test Artist',
    memberPassword: 'TestPass123!',
    memberRole: 'licensed',
    studioName: 'Universal Beauty Studio Academy',
    studioOwnerName: 'Tyrone Jackson'
  };

  console.log('📊 Test Data:', testData);

  // Step 1: Test database connection
  console.log('\n📊 Step 1: Testing database connection...');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return;
  }

  // Step 2: Check if user already exists
  console.log('\n📊 Step 2: Checking if test user exists...');
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: testData.memberEmail }
    });
    
    if (existingUser) {
      console.log('⚠️ Test user already exists, deleting for clean test...');
      await prisma.user.delete({
        where: { email: testData.memberEmail }
      });
      console.log('✅ Test user deleted');
    } else {
      console.log('✅ Test user does not exist (clean test)');
    }
  } catch (error) {
    console.error('❌ Error checking/deleting existing user:', error);
  }

  // Step 3: Test password hashing
  console.log('\n📊 Step 3: Testing password hashing...');
  try {
    const hashedPassword = await bcrypt.hash(testData.memberPassword, 12);
    console.log('✅ Password hashing successful');
    console.log('📝 Hashed password length:', hashedPassword.length);
  } catch (error) {
    console.error('❌ Password hashing failed:', error);
  }

  // Step 4: Test user creation
  console.log('\n📊 Step 4: Testing user creation...');
  try {
    const hashedPassword = await bcrypt.hash(testData.memberPassword, 12);
    
    const newUser = await prisma.user.create({
      data: {
        email: testData.memberEmail,
        name: testData.memberName,
        password: hashedPassword,
        role: testData.memberRole,
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        isLicenseVerified: testData.memberRole === 'licensed' || testData.memberRole === 'instructor',
        businessName: testData.studioName,
        studioName: testData.studioName,
        licenseNumber: testData.memberRole === 'licensed' || testData.memberRole === 'instructor' ? 'PENDING' : '',
        licenseState: testData.memberRole === 'licensed' || testData.memberRole === 'instructor' ? 'PENDING' : '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ User creation successful');
    console.log('📝 Created user ID:', newUser.id);
  } catch (error) {
    console.error('❌ User creation failed:', error);
    console.error('📝 Error details:', error.message);
    if (error.code) {
      console.error('📝 Error code:', error.code);
    }
    if (error.meta) {
      console.error('📝 Error meta:', error.meta);
    }
  }

  // Step 5: Test email content generation
  console.log('\n📊 Step 5: Testing email content generation...');
  try {
    const getRoleDescription = (role) => {
      switch (role) {
        case 'student':
          return 'You have been invited to join as a Student/Apprentice. You will use the supervision booking system and require instructor oversight for all procedures.'
        case 'licensed':
          return 'You have been invited to join as a Licensed Artist. You will use the regular booking system and can work independently with clients.'
        case 'instructor':
          return 'You have been invited to join as an Instructor. You can supervise students, manage your availability, and access instructor management features.'
        default:
          return 'You have been invited to join the studio team.'
      }
    }

    const getInvitationLink = (role) => {
      switch (role) {
        case 'student':
          return `${process.env.NEXT_PUBLIC_BASE_URL}/studio/supervision?tab=find`
        case 'licensed':
          return `${process.env.NEXT_PUBLIC_BASE_URL}/booking`
        case 'instructor':
          return `${process.env.NEXT_PUBLIC_BASE_URL}/studio/supervision?tab=availability`
        default:
          return `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`
      }
    }

    const emailContent = {
      to: testData.memberEmail,
      subject: `You've been invited to join ${testData.studioName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Studio Team Invitation</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">Welcome to ${testData.studioName}!</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Hi ${testData.memberName},
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              ${testData.studioOwnerName} has invited you to join their studio team on PMU Pro.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Your Role: ${testData.memberRole === 'licensed' ? 'Licensed Artist' : testData.memberRole === 'instructor' ? 'Instructor' : 'Student/Apprentice'}</h3>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
                ${getRoleDescription(testData.memberRole)}
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">Your Login Credentials</h3>
              <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
                <strong>Email:</strong> ${testData.memberEmail}
              </p>
              <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
                <strong>Password:</strong> ${testData.memberPassword}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${getInvitationLink(testData.memberRole)}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Log In Now
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              You can now log in using the credentials above. We recommend changing your password after your first login for security.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions, please contact ${testData.studioOwnerName} directly.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This invitation was sent by ${testData.studioOwnerName} for ${testData.studioName}.<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    };

    console.log('✅ Email content generation successful');
    console.log('📝 Email content length:', emailContent.html.length);
    console.log('📝 Environment variables:');
    console.log('  - NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
    console.log('  - SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL);
    console.log('  - SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
  } catch (error) {
    console.error('❌ Email content generation failed:', error);
  }

  // Step 6: Clean up test user
  console.log('\n📊 Step 6: Cleaning up test user...');
  try {
    await prisma.user.deleteMany({
      where: { email: testData.memberEmail }
    });
    console.log('✅ Test user cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test user:', error);
  }

  await prisma.$disconnect();
  console.log('\n🎉 DEBUG COMPLETE');
}

if (require.main === module) {
  debugTeamInvitation()
    .catch(error => {
      console.error('Unhandled error during debug:', error);
      process.exit(1);
    });
}

module.exports = { debugTeamInvitation };
