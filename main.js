//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}


const electron = require('electron');
const { app, BrowserWindow, dialog, Menu } = electron;
const fs = require('fs');
const path = require('path');
const url = require('url');

var mainWindow = null;

function createWindow() {

    // initializing our start up window
    mainWindow = new BrowserWindow({
        width: 612,
        height: 384
    });

    // loading the initial page
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // opening the developer tools for only dev purpose
    // mainWindow.webContents.openDevTools();

    // closing the window
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // creating menu object
    const customMenu = Menu.buildFromTemplate(menuTemplate);

    // creating our custom menu
    Menu.setApplicationMenu(customMenu);

}

const menuTemplate = [
    {
        label: 'Select Albums',
        submenu: [
            {
                label: 'Sound Control',
                asselerator: process.platform == 'darwin' ? 'Command+O' : 'Ctrl+O',
                click: function () {
                    openFolderDialog();
                }  
            }
        ]
    }
];

if (process.platform == 'darwin') {
    menuTemplate.unshift({});
}

function openFolderDialog() {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }, function(filePath) {
        fs.readdir(filePath[0], function(error, files) {
            var arr = [];
            for (var i = 0; i < files.length; i++) {
                if(files[i].substr(-4) === '.mp3') {
                    arr.push(files[i]);
                }
            }
            var objToSend = {};
            objToSend.files = arr;
            objToSend.path = filePath[0];
            mainWindow.webContents.send('modal-file-content', objToSend);
        });
        
    });
}

// creating a application window when it is ready
app.on('ready', createWindow);

// close the application when all windows are closed
app.on('window-all-closed', () => {
    
    // excluding the mac because it is done only when clicked quit
    if(process.platform != 'darwin') {
        app.quit();        
    }

});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});
