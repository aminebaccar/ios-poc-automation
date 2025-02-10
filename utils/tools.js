const { exec } = require('child_process');
const { remote } = require('webdriverio');
const addContext = require('mochawesome/addContext');
const net = require('net');
const fs = require('fs');

function loadJson(filePath) {
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);
    return data;
}

function getEntryById(filePath, idParam) {
    const data = loadJson(filePath);

    for (const entry of data) {
        if (entry.id === idParam) {
            return entry;
        }
    }

    return null;
}

async function openAppByBundleId(bundleId) {
    const options = {
        hostname: '127.0.0.1',
        path: '/',
        port: 4723,
        capabilities: {
            platformName: 'iOS',
            'appium:udid': 'your-ios-device-udid',
            'appium:automationName': 'XCUITest',
            'appium:bundleId': bundleId,
            'appium:noReset': true
        }
    };

    const client = await remote(options);
    return client;
}

async function createAppiumSession() {
    const options = {
        hostname: '127.0.0.1',
        path: '/',
        port: 4723,
        capabilities: {
            platformName: 'iOS',
            'appium:udid': 'your-ios-device-udid',
            'appium:automationName': 'XCUITest',
            'appium:noReset': true
        }
    };

    const client = await remote(options);
    return client;
}

async function getAllOpenApps() {
    return new Promise((resolve, reject) => {
        exec(`ideviceinstaller -l`, (error, stdout, stderr) => {
            if (error) {
                return reject(`exec error: ${error}`);
            }
            if (stderr) {
                return reject(`stderr: ${stderr}`);
            }
            const packages = stdout.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            resolve(packages);
        });
    });
}

async function checkAppIsOpenedSuccessfully(driver, app) {
    const firstObject = driver.$(app.firstObject);
    await firstObject.waitForExist({ timeout: 25000 });
}

async function takeScreenshot(testContext, driver, bundleId) {
    const imageFileName = `${bundleId}-${Date.now()}.png`;
    const screenshotPath = `mochawesome-report/screenshots/${imageFileName}`;
    try {
        await driver.saveScreenshot(screenshotPath);
        addContext(testContext, { title: "Screenshot", value: `screenshots/${imageFileName}` });
        console.log(`Screenshot saved to ${screenshotPath}`);
    } catch (error) {
        console.error('Failed to take screenshot');
        console.error(error);
    }
}

async function closeOpenApps() {
    try {
        const packagesToClose = await getAllOpenApps();
        for (const appPackage of packagesToClose) {
            try {
                exec(`ideviceinstaller -U ${appPackage}`, (error, stdout, stderr) => {
                    if (error) {
                        console.warn(`Could not close app ${appPackage}: ${error.message}`);
                    }
                    if (stderr) {
                        console.warn(`Error closing app ${appPackage}: ${stderr}`);
                    }
                });
            } catch (err) {
                console.warn(`Could not close app ${appPackage}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error(`Error fetching running apps: ${error}`);
    }
}

async function ensureAppiumIsRunning() {
    const port = 4723; // Default Appium port
    const isPortTaken = await checkPort(port);

    if (!isPortTaken) {
        console.log('Appium server is not running. Starting it now...');
        await startAppium();
        console.log('Appium server started.');
    } else {
        console.log('Appium server is already running.');
    }
}

function checkPort(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(true);
            } else {
                reject(err);
            }
        });
        server.once('listening', () => {
            server.close();
            resolve(false);
        });
        server.listen(port);
    });
}

function startAppium() {
    return new Promise((resolve, reject) => {
        const appiumProcess = exec('appium', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error starting Appium: ${error}`);
                return reject(error);
            }
            console.log(stdout);
            console.error(stderr);
        });

        appiumProcess.stdout.on('data', (data) => {
            if (data.includes('Appium REST http interface listener started on')) {
                resolve();
            }
        });

        appiumProcess.stderr.on('data', (data) => {
            console.error(`Appium stderr: ${data}`);
        });

        appiumProcess.on('close', (code) => {
            if (code !== 0) {
                console.log(`Appium process exited with code ${code}`);
                reject(new Error(`Appium exited with code ${code}`));
            }
        });
    });
}

module.exports = { loadJson, getEntryById, openAppByBundleId, getAllOpenApps, createAppiumSession, closeOpenApps, checkAppIsOpenedSuccessfully, takeScreenshot, ensureAppiumIsRunning }
