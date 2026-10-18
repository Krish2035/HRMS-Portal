const { app, Tray, Menu, Notification, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');

let tray = null;
const HRMS_PORTAL_URL = process.env.HRMS_PORTAL_URL || 'http://localhost:3000';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

app.whenReady().then(() => {
  // Check autostart status
  const loginItem = app.getLoginItemSettings();
  console.log(`[HRMS Companion] Launch on Startup is: ${loginItem.openAtLogin ? 'ENABLED' : 'DISABLED'}`);

  createTray();
  showStartupReminder();
  setupPeriodicSessionCheck();
});

function createTray() {
  // Use built-in or custom icon
  tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
  updateContextMenu(false);

  tray.setToolTip('HRMS Enterprise Work Companion');
  tray.on('click', () => {
    shell.openExternal(HRMS_PORTAL_URL);
  });
}

function updateContextMenu(isActive = false) {
  const isAutoStart = app.getLoginItemSettings().openAtLogin;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `HRMS Portal: ${isActive ? 'Active Timer' : 'Timer Not Started'}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Open HRMS Dashboard',
      click: () => shell.openExternal(HRMS_PORTAL_URL),
    },
    {
      label: 'Start Work Session',
      click: () => shell.openExternal(`${HRMS_PORTAL_URL}?action=start`),
    },
    { type: 'separator' },
    {
      label: 'Run on Windows Startup',
      type: 'checkbox',
      checked: isAutoStart,
      click: (menuItem) => {
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked,
          openAsHidden: true,
          name: 'HRMS Employee Companion',
        });
        console.log(`[HRMS Companion] Automatic Startup toggled to: ${menuItem.checked}`);
      },
    },
    {
      label: 'About HRMS Companion',
      click: () => {
        dialog.showMessageBox({
          type: 'info',
          title: 'HRMS Enterprise Companion',
          message: 'HRMS Employee Work Timer Companion v1.0.0\n\n- Zero spyware / Non-invasive\n- Automatic Windows Login Reminder\n- Authoritative Server-Side Time Tracking',
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Companion',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function showStartupReminder() {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Good morning! HRMS is Ready',
      body: "You haven't started today's work timer yet. Click here to open your portal and begin.",
      silent: false,
    });

    notification.on('click', () => {
      shell.openExternal(HRMS_PORTAL_URL);
    });

    notification.show();
  }
}

function setupPeriodicSessionCheck() {
  // Periodically check session status every 5 minutes
  setInterval(() => {
    // In production, syncs with BACKEND_API_URL/work-sessions/current
  }, 300000);
}

// Keep companion running in background tray even when windows close
app.on('window-all-closed', (e) => {
  e.preventDefault();
});
