const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const STATIC_PORT = process.env.STATIC_PORT || 8082;
const STATIC_URL = `http://127.0.0.1:${STATIC_PORT}`;
const BACKEND_ENTRY = path.join(ROOT, 'backend', 'server.js');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    console.log('Starting static server...');
    const staticProc = spawn(process.execPath, [path.join(__dirname, 'start-static-server.js')], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    staticProc.stdout.on('data', d => process.stdout.write(`[static] ${d}`));
    staticProc.stderr.on('data', d => process.stderr.write(`[static-err] ${d}`));

    // give static server time to start
    await sleep(800);

    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('[page]', msg.text()));

    // Intercept requests to backend port and block them initially to simulate offline
    await page.setRequestInterception(true);
    let backendAllowed = false;
    page.on('request', req => {
        const url = req.url();
        if (url.startsWith('http://127.0.0.1:3000') && !backendAllowed) {
            // Simulate network failure
            return req.abort();
        }
        return req.continue();
    });

    console.log('Opening app page...');
    await page.goto(STATIC_URL, { waitUntil: 'networkidle2' });

    // Wait for connection indicator to report 'Disconnected' (health check completes)
    await page.waitForSelector('#connection-indicator');
    try {
        await page.waitForFunction(() => {
            const el = document.getElementById('connection-indicator');
            return el && /Disconnected/i.test(el.textContent);
        }, { timeout: 8000 });
        console.log('Indicator reached Disconnected state');
    } catch (e) {
        const current = await page.$eval('#connection-indicator', el => el.textContent.trim());
        console.error('Indicator did not reach Disconnected within timeout. Current:', current);
        await cleanup(browser, staticProc, null);
        process.exit(1);
    }

    // Ensure demo todos are present
    const demoExists = await page.evaluate(() => {
        return !!document.querySelector("li[data-id^='demo-']");
    });
    console.log('Demo todos present:', demoExists);
    if (!demoExists) {
        console.error('Expected demo todos to appear when offline');
        await cleanup(browser, staticProc, null);
        process.exit(1);
    }

    // Add a task while offline
    console.log('Adding offline task...');
    await page.type('#todo-input', 'Offline Task 1');
    await page.click('#todo-form button[type="submit"]');
    await sleep(500);

    // Check localStorage for offline_todos
    const offlineItems = await page.evaluate(() => JSON.parse(localStorage.getItem('offline_todos') || '[]'));
    console.log('Offline items in localStorage after add:', offlineItems.length);
    if (offlineItems.length === 0) {
        console.error('No offline items saved to localStorage');
        await cleanup(browser, staticProc, null);
        process.exit(1);
    }

    // Start backend
    console.log('Starting mock backend server...');
    const backendProc = spawn(process.execPath, [path.join(__dirname, 'mock-backend.js')], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    backendProc.stdout.on('data', d => process.stdout.write(`[backend] ${d}`));
    backendProc.stderr.on('data', d => process.stderr.write(`[backend-err] ${d}`));

    // Wait for backend to be ready (listen on port 3000). Check via page health-check triggered by clicking Retry
    await sleep(1500);

    // Click retry
    console.log('Clicking Retry button...');
    // Allow backend requests now that the backend is starting
    backendAllowed = true;
    await page.click('#retry-connection');

    // Wait for Checking... then Connected
    await page.waitForFunction(() => {
        const el = document.getElementById('connection-indicator');
        return el && /Connected|Checking/.test(el.textContent);
    }, { timeout: 5000 });

    // Wait for Connected state
    await page.waitForFunction(() => document.getElementById('connection-indicator') && /Connected/i.test(document.getElementById('connection-indicator').textContent), { timeout: 10000 });
    console.log('Indicator became Connected');

    // Wait a bit for sync notification
    await sleep(1500);

    // Check notifications for sync message
    const notifText = await page.evaluate(() => {
        const n = document.querySelector('.notification.success');
        return n ? n.textContent : null;
    });
    console.log('Notification text:', notifText);

    // Verify localStorage cleaned of synced items
    const offlineAfter = await page.evaluate(() => localStorage.getItem('offline_todos'));
    console.log('offline_todos after sync:', offlineAfter);

    // Clean up
    await cleanup(browser, staticProc, backendProc);
    console.log('Test completed successfully');
}

async function cleanup(browser, staticProc, backendProc) {
    try { if (browser) await browser.close(); } catch (e) {}
    try { if (staticProc) staticProc.kill(); } catch (e) {}
    try { if (backendProc) backendProc.kill(); } catch (e) {}
}

run().catch(async (err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
