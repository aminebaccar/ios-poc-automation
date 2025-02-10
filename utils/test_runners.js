const CONFIG_APP = 'configApp.json';
const { getEntryById, openAppByBundleId, checkAppIsOpenedSuccessfully, takeScreenshot } = require('./tools');
const assert = require('assert');

async function runTestFirstLevel(testContext, packageName) {
    await runTestWithCallback(testContext, packageName, null);
}

async function runTestSecondLevel(testContext, packageName, appObject) {
    await runTestWithCallback(testContext, packageName, async (driver) => {
        await appObject.setDriver(driver);
        await appObject.performBasicFunction();
    });
}

async function runTestWithCallback(testContext, packageName, callback) {
    let status = 'failed';
    let driver;
    const app = await getEntryById(CONFIG_APP, packageName);
    try {
        driver = await openAppByBundleId(app.package, app.activity);
        await checkAppIsOpenedSuccessfully(driver, app);
        if (callback) {
            await callback(driver);
        }
        status = 'passed';
    } catch (err) {
        console.error(err);
        status = 'failed';
        await takeScreenshot(testContext, driver, packageName);
    }
    finally {
        assert.equal('passed', status);
    }
}

module.exports = { runTestFirstLevel, runTestSecondLevel}