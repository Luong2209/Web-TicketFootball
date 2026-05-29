const { chromium } = require('playwright');

const BASE = 'http://localhost:3001';
const OUT = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  const shots = [
    { url: '/matches', file: 'ss_matches.png', role: 'user' },
    { url: '/my-tickets', file: 'ss_mytickets.png', role: 'user' },
    { url: '/admin', file: 'ss_admin_dashboard.png', role: 'admin' },
    { url: '/admin/users', file: 'ss_admin_users.png', role: 'admin' },
    { url: '/admin/matches', file: 'ss_admin_matches.png', role: 'admin' },
  ];

  for (const s of shots) {
    const role = s.role || 'admin';
    const fakeUser = JSON.stringify({ id: 1, username: role, name: role === 'admin' ? 'Admin' : 'User', role });
    // Set localStorage before navigating
    await ctx.addInitScript(() => {});
    const newPage = await ctx.newPage();
    await newPage.addInitScript((r) => {
      const u = JSON.stringify({ id: 1, username: r, name: r === 'admin' ? 'Admin' : 'User', role: r });
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('role', r);
      localStorage.setItem('user', u);
    }, role);
    try {
      await newPage.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 8000 });
    } catch {
      await newPage.goto(BASE + s.url, { waitUntil: 'domcontentloaded', timeout: 5000 });
    }
    await newPage.waitForTimeout(1500);
    await newPage.screenshot({ path: OUT + s.file, fullPage: false });
    await newPage.close();
    console.log('OK ' + s.file);
  }

  await browser.close();
})();
