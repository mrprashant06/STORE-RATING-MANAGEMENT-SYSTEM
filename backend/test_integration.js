const http = require('http');
const app = require('./app');

function req(server, method, path, token = null, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const request = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

async function runEndToEndIntegration() {
  console.log('🚀 Running Phase 8 End-to-End Integration Test Suite...\n');
  const server = app.listen(0);
  let passed = 0;
  let total = 0;

  function assert(condition, message, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message} - ${details}`);
    }
  }

  try {
    // 1. Admin logs in
    const adminLogin = await req(server, 'POST', '/api/auth/login', null, {
      email: 'admin@bengalurustores.in',
      password: 'Admin@12345'
    });
    assert(adminLogin.status === 200, '1. Admin Authentication Successful');
    const adminToken = adminLogin.body.token;

    // 2. Admin creates a new Store Owner
    const newOwnerEmail = `raghavendra_${Date.now()}@bengalurubakers.in`;
    const createOwner = await req(server, 'POST', '/api/admin/users', adminToken, {
      name: 'Raghavendra Narayana Murthy', // 27 chars
      email: newOwnerEmail,
      password: 'OwnerPass@123', // 13 chars (8-16)
      address: 'Shop 88, 17th Cross, MC Layout, Vijayanagar, Bengaluru, Karnataka 560040',
      role: 'OWNER'
    });
    assert(createOwner.status === 201 && createOwner.body.user.role === 'OWNER', '2. Admin Created Store Owner');
    const newOwnerId = createOwner.body.user.id;

    // 3. Admin creates a new Store linked to this Owner
    const createStore = await req(server, 'POST', '/api/admin/stores', adminToken, {
      name: 'Bengaluru Artisanal Bakery House', // 32 chars
      email: 'care@bengalurubakers.in',
      address: 'Shop 88, Ground Floor, 17th Cross, MC Layout, Vijayanagar, Bengaluru, Karnataka 560040',
      owner_id: newOwnerId
    });
    assert(createStore.status === 201 && createStore.body.store.id, '3. Admin Created Store Linked to New Owner');
    const newStoreId = createStore.body.store.id;

    // 4. Normal user registers
    const userEmail1 = `deepika_${Date.now()}@bengaluruhub.in`;
    const registerUser1 = await req(server, 'POST', '/api/auth/register', null, {
      name: 'Deepika Ramesh Chandrasekar', // 27 chars
      email: userEmail1,
      password: 'CustomerPass@123',
      address: 'Flat 101, Gopalan Grandeur, Hoodi Circle, Whitefield, Bengaluru, Karnataka 560048'
    });
    assert(registerUser1.status === 201, '4. Customer 1 Registered Successfully');
    const user1Token = registerUser1.body.token;

    // 5. Customer 1 rates the new store with 4 stars
    const rate1 = await req(server, 'POST', '/api/ratings', user1Token, {
      store_id: newStoreId,
      rating: 4
    });
    assert(rate1.status === 201 && rate1.body.data.rating === 4, '5. Customer 1 Submitted 4-Star Rating');

    // 6. Normal user attempts to submit a duplicate rating for the same store -> 409 Conflict
    const dupRate = await req(server, 'POST', '/api/ratings', user1Token, {
      store_id: newStoreId,
      rating: 5
    });
    assert(dupRate.status === 409, '6. Duplicate Rating Prevented (Unique Constraint Enforced)');

    // 7. Customer 2 registers and rates the same store with 5 stars
    const userEmail2 = `karthik_${Date.now()}@bengaluruhub.in`;
    const registerUser2 = await req(server, 'POST', '/api/auth/register', null, {
      name: 'Karthik Subramanian Balaji', // 26 chars
      email: userEmail2,
      password: 'CustomerPass@123',
      address: 'House 44, 11th Main, 4th Block, Jayanagar, Bengaluru, Karnataka 560011'
    });
    assert(registerUser2.status === 201, '7. Customer 2 Registered Successfully');
    const user2Token = registerUser2.body.token;

    const rate2 = await req(server, 'POST', '/api/ratings', user2Token, {
      store_id: newStoreId,
      rating: 5
    });
    assert(rate2.status === 201, '8. Customer 2 Submitted 5-Star Rating');

    // 8. Verify aggregated average: (4 + 5) / 2 = 4.5
    const checkStore = await req(server, 'GET', `/api/stores/${newStoreId}`);
    assert(
      checkStore.status === 200 && parseFloat(checkStore.body.store.average_rating) === 4.5,
      '9. Store Average Rating Aggregated Correctly: 4.5'
    );

    // 9. Customer 1 updates rating from 4 to 5 stars
    const updateRate1 = await req(server, 'PUT', `/api/ratings/${newStoreId}`, user1Token, {
      rating: 5
    });
    assert(
      updateRate1.status === 200 && parseFloat(updateRate1.body.data.storeAverage) === 5.0,
      '10. Customer 1 Updated Rating to 5 Stars -> Store Average Recalculated to 5.0'
    );

    // 10. Store Owner logs in
    const ownerLogin = await req(server, 'POST', '/api/auth/login', null, {
      email: newOwnerEmail,
      password: 'OwnerPass@123'
    });
    assert(ownerLogin.status === 200 && ownerLogin.body.user.role === 'OWNER', '11. Store Owner Logged In');
    const newOwnerToken = ownerLogin.body.token;

    // 11. Owner checks dashboard: sees their store and 5.0 average
    const ownerDashboard = await req(server, 'GET', '/api/owner/dashboard', newOwnerToken);
    assert(
      ownerDashboard.status === 200 &&
      ownerDashboard.body.store.id === newStoreId &&
      parseFloat(ownerDashboard.body.stats.averageRating) === 5.0,
      '12. Owner Dashboard Reflects Own Store & Real-Time Aggregates'
    );

    // 12. Owner views customers who rated their store
    const ownerReviews = await req(server, 'GET', '/api/owner/ratings', newOwnerToken);
    assert(
      ownerReviews.status === 200 &&
      ownerReviews.body.ratings.length === 2 &&
      ownerReviews.body.ratings.some(r => r.user_name === 'Deepika Ramesh Chandrasekar') &&
      ownerReviews.body.ratings.some(r => r.user_name === 'Karthik Subramanian Balaji'),
      '13. Owner Views Reviewing Customer Details (Name, Email, Rating, Date)'
    );

    // 13. Security boundary: Normal user cannot access owner APIs
    const ownerApiAsUser = await req(server, 'GET', '/api/owner/dashboard', user1Token);
    assert(ownerApiAsUser.status === 403, '14. Role Boundary Protected: USER cannot access OWNER dashboard (403)');

    // 14. Password Change Flow
    const changePass = await req(server, 'PUT', '/api/auth/change-password', user1Token, {
      currentPassword: 'CustomerPass@123',
      newPassword: 'NewPass@456'
    });
    assert(changePass.status === 200, '15. Customer Successfully Changed Password');

    // 15. Verify old password fails, new password succeeds
    const oldLogin = await req(server, 'POST', '/api/auth/login', null, {
      email: userEmail1,
      password: 'CustomerPass@123'
    });
    assert(oldLogin.status === 401, '16. Old Password Rejected (401)');

    const newLogin = await req(server, 'POST', '/api/auth/login', null, {
      email: userEmail1,
      password: 'NewPass@456'
    });
    assert(newLogin.status === 200, '17. New Password Accepted (200)');

    console.log(`\n======================================================`);
    console.log(`Phase 8 Integration Suite: ${passed}/${total} Passed!`);
    console.log(`======================================================\n`);
  } finally {
    server.close();
  }
}

runEndToEndIntegration().catch(console.error);
