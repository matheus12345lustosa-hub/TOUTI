const http = require('http');

const baseUrl = 'http://localhost:3000';

function checkUrl(path, name) {
    return new Promise((resolve) => {
        http.get(baseUrl + path, (res) => {
            console.log(`[${name}] ${path} -> Status: ${res.statusCode}`);
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`[PASS] ${name} responded successfully.`);
                    if (data.includes('value="a"')) {
                        console.log(`[PASS] Search param verified in content.`);
                    }
                } else {
                    console.log(`[FAIL] ${name} returned ${res.statusCode}`);
                }
                resolve();
            });
        }).on('error', (err) => {
            console.log(`[FAIL] ${name} error: ${err.message}`);
            resolve();
        });
    });
}

async function run() {
    console.log("Starting connectivity check...");
    await checkUrl('/dashboard/products', 'Products Page');
    await checkUrl('/dashboard/products?q=a', 'Product Search');
    await checkUrl('/dashboard/sales', 'Sales Page');
    await checkUrl('/dashboard/clients', 'Clients Page');
    console.log("Done.");
}

run();
