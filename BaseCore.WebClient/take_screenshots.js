const { chromium } = require('playwright');

const BASE = 'http://localhost:3001';
const OUT = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  // Inject fake localStorage to bypass auth
  await ctx.addInitScript(() => {
    const fakeUser = JSON.stringify({ id: 1, username: 'admin', name: 'Admin', userType: 'admin' });
    localStorage.setItem('auth_token', 'fake-token-for-screenshot');
    localStorage.setItem('auth_user', fakeUser);
  });

  const shots = [
    { url: '/', file: 'ss_home.png' },
    { url: '/matches', file: 'ss_matches.png' },
    { url: '/my-tickets', file: 'ss_mytickets.png' },
    { url: '/admin', file: 'ss_admin_dashboard.png' },
    { url: '/admin/users', file: 'ss_admin_users.png' },
    { url: '/admin/matches', file: 'ss_admin_matches.png' },
  ];

  for (const s of shots) {
    try {
      await page.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 8000 });
    } catch {
      await page.goto(BASE + s.url, { waitUntil: 'domcontentloaded', timeout: 5000 });
    }
    await page.waitForTimeout(1500);
    await page.screenshot({ path: OUT + s.file, fullPage: false });
    console.log('OK ' + s.file);
  }

  await browser.close();
})();
