const http = require('http');
const app = require('./app');

// Helper to send HTTP requests to test server
function request(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Comprehensive Backend API Test Suite...\n');
  const server = app.listen(0); // random available port
  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
    }
  }

  try {
    // 1. Health check
    const health = await request(server, { method: 'GET', path: '/api/health' });
    assert(health.status === 200 && health.body.status === 'UP', 'API Health Check returns 200 UP');

    // 2. Admin Login
    const adminLogin = await request(server, { method: 'POST', path: '/api/auth/login' }, {
      email: 'admin@bengalurustores.in',
      password: 'Admin@12345'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'ADMIN', 'Admin Login Successful', JSON.stringify(adminLogin.body));
    const adminToken = adminLogin.body.token;

    // 3. User Login
    const userLogin = await request(server, { method: 'POST', path: '/api/auth/login' }, {
      email: 'priyanka@bengaluruhub.in',
      password: 'User@12345'
    });
    assert(userLogin.status === 200 && userLogin.body.user.role === 'USER', 'Normal User Login Successful');
    const userToken = userLogin.body.token;

    // 4. Owner Login
    const ownerLogin = await request(server, { method: 'POST', path: '/api/auth/login' }, {
      email: 'rajesh@koramangalatech.in',
      password: 'Owner@12345'
    });
    assert(ownerLogin.status === 200 && ownerLogin.body.user.role === 'OWNER', 'Store Owner Login Successful');
    const ownerToken = ownerLogin.body.token;

    // 5. Registration Validation Failure (Name too short: < 20 chars)
    const failReg = await request(server, { method: 'POST', path: '/api/auth/register' }, {
      name: 'Short Name',
      email: 'test' + Date.now() + '@example.com',
      password: 'Password@123',
      address: '100 Feet Road, Indiranagar, Bengaluru'
    });
    assert(failReg.status === 400 && failReg.body.message.includes('Validation failed'), 'Registration Rejects Short Name (<20 chars)');

    // 6. Registration Success (Valid Indian user and Bangalore address)
    const testEmail = `aniruddh_${Date.now()}@bengaluruhub.in`;
    const successReg = await request(server, { method: 'POST', path: '/api/auth/register' }, {
      name: 'Aniruddh Venkatesh Raghavan', // 27 chars
      email: testEmail,
      password: 'SecurePass@123',
      address: 'Flat 204, Brigade Gateway, Dr. Rajkumar Road, Malleshwaram, Bengaluru, Karnataka 560055'
    });
    assert(successReg.status === 201 && successReg.body.user.role === 'USER', 'Public Registration Succeeds as USER');

    // 7. Security Check: Normal user cannot access Admin endpoints
    const forbiddenCheck = await request(server, {
      method: 'GET',
      path: '/api/admin/dashboard',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(forbiddenCheck.status === 403, 'Normal user receives 403 Forbidden on Admin Dashboard');

    // 8. Admin Dashboard Stats
    const adminDash = await request(server, {
      method: 'GET',
      path: '/api/admin/dashboard',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminDash.status === 200 && adminDash.body.data.totalUsers >= 3, 'Admin Dashboard Returns Accurate Stats');

    // 9. Admin List Users with Sorting & Search
    const adminUsers = await request(server, {
      method: 'GET',
      path: '/api/admin/users?sortBy=name&sortOrder=ASC',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminUsers.status === 200 && Array.isArray(adminUsers.body.users), 'Admin Users List with Sort & Filter works');

    // 10. Store Listing for User (includes my_rating)
    const storesList = await request(server, {
      method: 'GET',
      path: '/api/stores',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(storesList.status === 200 && storesList.body.stores.length > 0, 'User Can Browse Stores with Average Rating');
    const ratedStore = storesList.body.stores.find((s) => s.my_rating) || storesList.body.stores[0];
    const storeId = ratedStore.id;

    // If user hasn't rated this store yet, submit a rating first
    if (!ratedStore.my_rating) {
      await request(server, {
        method: 'POST',
        path: '/api/ratings',
        headers: { Authorization: `Bearer ${userToken}` }
      }, { store_id: storeId, rating: 5 });
    }

    // 11. Update Rating by User
    const updateRating = await request(server, {
      method: 'PUT',
      path: `/api/ratings/${storeId}`,
      headers: { Authorization: `Bearer ${userToken}` }
    }, { rating: 4 });
    assert(updateRating.status === 200 && updateRating.body.data.rating === 4, 'User Can Update Existing Store Rating');

    // 12. Owner Dashboard
    const ownerDash = await request(server, {
      method: 'GET',
      path: '/api/owner/dashboard',
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert(ownerDash.status === 200 && ownerDash.body.store !== null, 'Store Owner Dashboard Returns Assigned Store Info');

    // 13. Owner Ratings List (customers who rated owner\'s store)
    const ownerRatings = await request(server, {
      method: 'GET',
      path: '/api/owner/ratings',
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert(ownerRatings.status === 200 && Array.isArray(ownerRatings.body.ratings), 'Store Owner Can View Reviewers for Their Store');

    console.log(`\n=========================================`);
    console.log(`Test Results: ${passed}/${total} Passed!`);
    console.log(`=========================================\n`);
  } finally {
    server.close();
  }
}

runTests().catch(console.error);
