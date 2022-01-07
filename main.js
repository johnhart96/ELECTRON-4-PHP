// Includes
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const {shell} = require('electron')

const httpPort = getRandomInt(30000);


// Define App Menu
app.on('ready', () => {
  const template = [
   {
      label: "File",
      submenu: [
        {
          label: "Print",
          click: function() { print(); },
          accelerator: 'CmdOrCtrl+P'
        }
      ]
    },{
      label: "Edit",
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:'
        },{
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:'
        },{
          type: 'separator'
        },{
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        },{
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        },{
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:'
        },{
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    },{
      label: "View",
        submenu: [
          {
            role: 'resetZoom'
          },{
            role: 'zoomIn'
          },{
            role: 'zoomOut'
          },{
            role: 'zoom'
          }
        ]
    }
];
if( process.env.DEBUG ) {
  template.push({
    label: 'Debugging',
    submenu: [
      {
        label: 'Dev Tools',
        role: 'toggleDevTools'
      },

      { type: 'separator' },
      {
        role: 'reload',
        accelerator: 'Alt+R'
      }
    ]
  });
}
function navigate( url ) {
    mainWindow.loadURL('http://'+server.host+':'+server.port+'/'+url);
}
  var mainMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(mainMenu);
});

// PHP Server
const PHPServer = require('php-server-manager');
var options;
if( process.platform == "win32" ) {
  options = {
    port: httpPort,
    host: "127.0.0.1",
    directory: __dirname,
    php: 'php/php.exe',
    directives: {
      display_errors: 1,
      expose_php: 1
    }
  }
} else {
  options = {
    port: httpPort,
    host: "127.0.0.1",
    directory: __dirname,
    directives: {
      display_errors: 1,
      expose_php: 1
    }
  }
}
const server = new PHPServer(options);

// Main Window
let mainWindow
function createWindow() {
  server.run();
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: 0.8,
      enableRemoteModule: false,
      scrollBounce: false
    },
    frame: true,
    minWidth: 1024,
    minHeight: 768
  });
  mainWindow.loadURL('http://'+server.host+':'+server.port+'/index.php');
  shell.showItemInFolder('fullPath');
  mainWindow.on('closed', function () {
    server.close();
    app.quit();
    mainWindow = null;
  });
}

// Init main window on win32
app.on('ready', createWindow)

// Window closed
app.on('window-all-closed', function () {
  if( process.platform !== 'darwin' ) {
    server.close();
    app.quit();
  }
})

// Init main window on macOS
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
})

// Disable security warnings
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Functions
function print() {
  let win = BrowserWindow.getFocusedWindow();
	// let win = BrowserWindow.getAllWindows()[0];

	win.webContents.print(options, (success, failureReason) => {
		if (!success) console.log(failureReason);

		console.log('Print Initiated');
	});
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}