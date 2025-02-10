const { closeOpenApps, ensureAppiumIsRunning } = require('./tools');
const { runTestFirstLevel, runTestSecondLevel } = require('./test_runners');
const { DialerApp } = require('./AppObject/DialerApp');

describe("Suite I", () => {
    before(async function () {
        this.timeout(60000);
        await ensureAppiumIsRunning();
    });

    beforeEach(async function () {
        this.timeout(60000);
        await ensureAppiumIsRunning();
        await closeOpenApps();
    });

    it("Ouvrir l'application: Dialer", async function () {
        this.timeout(60000);
        try {
            await runTestFirstLevel(this, "Dialer");
        }
        catch (error) {
            console.error(error);
        }
    });

    it("Ouvrir l'application et tester une fonctionnalité basique: Dialer", async function () {
        this.timeout(70000);
        try {
            await runTestSecondLevel(this, "Dialer", new DialerApp());
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    });
});
