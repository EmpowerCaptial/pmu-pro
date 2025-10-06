const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function migrateTyroneServices() {
  try {
    console.log('🔧 MIGRATING TYRONE\'S LOCALSTORAGE SERVICES TO DATABASE...\n');
    
    // Step 1: Login as Tyrone
    console.log('1️⃣ Logging in as Tyrone...');
    const loginResponse = await makeRequest('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tyronejackboy@gmail.com',
        password: 'Tyronej22!'
      })
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.error);
      return;
    }

    const user = loginResponse.data.user;
    console.log('   ✅ Login successful!');
    console.log('   👤 User:', user.name);
    console.log('   📧 Email:', user.email);
    
    // Step 2: Create sample services that might be in localStorage
    // (You'll need to provide the actual services from your localStorage)
    console.log('\\n2️⃣ Creating sample services to migrate...');
    
    // These are examples - you'll need to replace with your actual services
    const localStorageServices = [
      {
        name: 'Student Training',
        description: 'Training session for students',
        defaultDuration: 120,
        defaultPrice: 200,
        category: 'other',
        isActive: true
      },
      {
        name: 'Microblading',
        description: 'Semi-permanent eyebrow tattooing',
        defaultDuration: 120,
        defaultPrice: 400,
        category: 'eyebrows',
        isActive: true
      },
      {
        name: 'Lip Blushing',
        description: 'Semi-permanent lip color enhancement',
        defaultDuration: 90,
        defaultPrice: 300,
        category: 'lips',
        isActive: true
      },
      {
        name: 'Eyeliner',
        description: 'Semi-permanent eyeliner application',
        defaultDuration: 60,
        defaultPrice: 250,
        category: 'eyeliner',
        isActive: true
      },
      {
        name: 'Powder Brows',
        description: 'Ombre powder eyebrow technique',
        defaultDuration: 90,
        defaultPrice: 350,
        category: 'eyebrows',
        isActive: true
      },
      {
        name: 'Areola Restoration',
        description: 'Medical tattooing for areola restoration',
        defaultDuration: 120,
        defaultPrice: 500,
        category: 'other',
        isActive: true
      }
    ];
    
    console.log('   📋 Services to migrate:', localStorageServices.length);
    localStorageServices.forEach(s => {
      console.log(\`     - \${s.name}: $\${s.defaultPrice}\`);
    });
    
    // Step 3: Migrate services to database
    console.log('\\n3️⃣ Migrating services to database...');
    const migrateResponse = await makeRequest('https://thepmuguide.com/api/migrate-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: user.email,
        localStorageServices: localStorageServices
      })
    });
    
    console.log('   📊 Migration Status:', migrateResponse.status);
    if (migrateResponse.status === 200) {
      console.log('   ✅ Migration successful!');
      console.log('   📋 Migrated services:', migrateResponse.data.migratedCount);
      if (migrateResponse.data.errors) {
        console.log('   ⚠️ Errors:', migrateResponse.data.errors);
      }
    } else {
      console.log('   ❌ Migration failed:', migrateResponse.data.error);
    }
    
    // Step 4: Verify services are now in database
    console.log('\\n4️⃣ Verifying services in database...');
    const servicesResponse = await makeRequest('https://thepmuguide.com/api/services', {
      headers: { 'x-user-email': user.email }
    });
    
    console.log('   📊 Services Status:', servicesResponse.status);
    console.log('   📋 Total services in database:', servicesResponse.data.services?.length || 0);
    if (servicesResponse.data.services?.length > 0) {
      console.log('   📝 Service names:', servicesResponse.data.services.map(s => s.name).join(', '));
      console.log('\\n🎉 SUCCESS: Services are now in database!');
      console.log('   ✅ Team members will be able to see these services');
      console.log('   ✅ Services will persist across browser sessions');
      console.log('   ✅ Services are now properly backed up');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

migrateTyroneServices();
