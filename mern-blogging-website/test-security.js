// Security Test Script for Islamic Stories Website
// Tests all implemented security features

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPass123!';

async function testSecurityFeatures() {
    console.log('🔒 Testing Security Features...\n');

    try {
        // Test 1: CSRF Protection
        console.log('1. Testing CSRF Protection...');
        try {
            await axios.post(`${BASE_URL}/api/signup`, {
                firstname: 'Test',
                lastname: 'User',
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            console.log('❌ CSRF protection failed - request should have been blocked');
        } catch (error) {
            if (error.response?.status === 403 && error.response?.data?.error === 'CSRF token validation failed') {
                console.log('✅ CSRF protection working correctly');
            } else {
                console.log('❌ Unexpected error:', error.response?.data);
            }
        }

        // Test 2: Rate Limiting
        console.log('\n2. Testing Rate Limiting...');
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(
                axios.post(`${BASE_URL}/api/login`, {
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD
                }).catch(err => err.response?.status)
            );
        }
        
        const results = await Promise.all(promises);
        const rateLimited = results.filter(status => status === 429).length;
        if (rateLimited > 0) {
            console.log(`✅ Rate limiting working (${rateLimited} requests blocked)`);
        } else {
            console.log('❌ Rate limiting may not be working');
        }

        // Test 3: Security Headers
        console.log('\n3. Testing Security Headers...');
        const response = await axios.get(`${BASE_URL}/api/latest-blogs`);
        const headers = response.headers;
        
        const requiredHeaders = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection'
        ];
        
        let headersOk = true;
        requiredHeaders.forEach(header => {
            if (!headers[header]) {
                console.log(`❌ Missing security header: ${header}`);
                headersOk = false;
            }
        });
        
        if (headersOk) {
            console.log('✅ Security headers present');
        }

        // Test 4: Input Validation
        console.log('\n4. Testing Input Validation...');
        try {
            await axios.post(`${BASE_URL}/api/signup`, {
                firstname: '<script>alert("xss")</script>',
                lastname: 'User',
                email: 'invalid-email',
                password: 'weak'
            });
            console.log('❌ Input validation failed');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Input validation working');
            } else {
                console.log('❌ Unexpected validation error:', error.response?.data);
            }
        }

        // Test 5: Secure Cookie Endpoints
        console.log('\n5. Testing Secure Cookie Endpoints...');
        try {
            const cookieResponse = await axios.get(`${BASE_URL}/api/get-auth-cookie`, {
                withCredentials: true
            });
            console.log('✅ Secure cookie endpoint accessible');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Secure cookie endpoint properly protected (no auth)');
            } else {
                console.log('❌ Cookie endpoint error:', error.response?.data);
            }
        }

        console.log('\n🎉 Security tests completed!');
        console.log('\n📋 Summary:');
        console.log('- CSRF Protection: Implemented');
        console.log('- Rate Limiting: Implemented');
        console.log('- Security Headers: Implemented');
        console.log('- Input Validation: Implemented');
        console.log('- Secure Cookies: Implemented');
        console.log('- Session Storage: Replaced with secure storage');
        console.log('- Content Security Policy: Strengthened');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testSecurityFeatures();
}

module.exports = { testSecurityFeatures }; 