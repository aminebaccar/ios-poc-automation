class DialerApp {
    constructor() {
        this.driver = null;
        this.keypad = '~key pad'; // iOS locator for keypad
        this.champsNum = '~digits'; // iOS locator for digits input field
        this.appeler = '~dial'; // iOS locator for dial button
        this.decrocher = '~End call'; // iOS locator for end call button
    }

    async setDriver(driver) {
        this.driver = driver;
    }

    async performBasicFunction(){
        const keypad = await this.driver.$(this.keypad);
        await keypad.click();
        const champsNum = await this.driver.$(this.champsNum);
        await champsNum.setValue('2344');
        const appeler = await this.driver.$(this.appeler);
        await appeler.click();
        const decrocher = await this.driver.$(this.decrocher);
        await decrocher.click();
    }
}
module.exports = { DialerApp }