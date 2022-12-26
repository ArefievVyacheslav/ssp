import puppeteer from "puppeteer";
import { workerData, parentPort } from "worker_threads";

(async () => {
    const { resourse, proxy, selector } = workerData;
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        args: [ `--proxy-server=${proxy}`, '--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: "./chrome/chrome.exe"
    });
    try {
        console.log("Запуск Puppetter");
        const page = await browser.newPage();
        console.log("Открывается страница");
        await page.goto(resourse, {'waitUntil' : 'domcontentloaded'}); 
        console.log("Ждем селектора");
        // await page.screenshot({ path: "./test.png", fullPage: true});
        await page.waitForSelector(selector);
        console.log("Суем контент");
        const result = await page.content();
        console.log("Закрываем браузер");
        await browser.close();
        console.log("Возвращаем");
        return parentPort.postMessage(result);
    } catch (err) {
        console.log(err);
        try {
            await browser.close();
        } catch {}
        return parentPort.postMessage("");
        // console.log("Ошибка fetchPageDDoS");
        // console.error(err);
        // return undefined;
    }

})();