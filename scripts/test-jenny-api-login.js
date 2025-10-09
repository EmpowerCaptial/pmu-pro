const https = require('https');

const data = JSON.stringify({
  email: 'jenny@universalbeautystudio.com',
  password: 'JennyStudent123!'
});

const options = {
  hostname: 'thepmuguide.com',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing Jenny\'s login via API...\n');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseData);
    
    try {
      const parsed = JSON.parse(responseData);
      if (parsed.success) {
        console.log('\n✅ LOGIN WORKS!');
        console.log('   User ID:', parsed.user.id);
        console.log('   Name:', parsed.user.name);
        console.log('   Email:', parsed.user.email);
        console.log('\nJenny CAN log in - she might be using wrong page or typing password incorrectly');
      } else {
        console.log('\n❌ LOGIN FAILED');
        console.log('   Error:', parsed.error);
      }
    } catch (e) {
      console.log('\nRaw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error);
});

req.write(data);
req.end();

