import fetch from "node-fetch";
import HttpsProxyAgent from 'https-proxy-agent';
import { JSDOM } from "jsdom"; 
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import fs from "fs";
// import { Worker } from "worker_threads";


// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
// puppeteer.use(StealthPlugin());


dotenv.config();

let puppeteerCounter = 0;

const host = `${process.env.DB_HOST}:${process.env.DB_PORT}`;

// Присоединение к MongoDB

const client = process.env.DB_USERNAME ?   
    new MongoClient(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASS}@${host}/?authMechanism=DEFAULT`) 
    :
    new MongoClient(`mongodb://${host}`);


// Функция, обрезающая пробелы справа и слева строки и очистки слов от \n

function cutSpaces(str) {
    try {
        return str.split(" ").filter(e => {
            if (e == "\n" || e == "" ) return false;
            return true;
        }).map(e => e.split("\n").join("")).join(" ");
    } catch {
        return "";
    }
}

async function fetchPageDDoS (resourse, proxyAgent, proxy, selector) {
    try {
        let fetchedPage = await fetch(resourse, { agent: proxyAgent })
        .then(res => res.text());
        if ((new JSDOM(fetchedPage)).window.document.querySelector(selector)) {
            return fetchedPage;
        } else {
            console.log("Скрипт забанен на 3 минуты защитой от DDoS. Ждем...");
            await new Promise(resolve => setTimeout(resolve, 3 * 60 * 1e3));
            return fetchPageDDoS(resourse, proxyAgent, proxy, selector);
            
            // console.log("Puppeteer запущен");
            // while (true) {
            //     if (puppeteerCounter < 4) {
            //         puppeteerCounter += 1;
            //         const worker = new Worker( './worker.js', { workerData: { resourse, proxy, selector } });
                        
            //         const result = await new Promise((res) => {
            //             worker.on('message', async (msg) => {
            //                 puppeteerCounter --;
            //                 res(msg);
            //             });
            //         });
            //         resolve(result);
            //         break; 
            //     } 
            //     await new Promise(res => setTimeout(res, 3000));  
            // }
        }
    } catch (err) {
        console.log("Ошибка fetchPageDDoS");
        console.error(err);
        return undefined;
    }
}

// Функция обработки одной страницы магазина (основной функционал здесь)

async function fetchShopPage(proxyAgent, proxy, gender, page) {
    try {
        let counter = 0;
        const productsLinksArray = [...page.window.document.querySelectorAll(".product-card__link")]
        .map(e => e.href);
        for (let link of productsLinksArray) {
            try {
                const productPage = new JSDOM(
                    await fetchPageDDoS("https://brandshop.ru" + link, proxyAgent, proxy, ".toolbar__product-page")
                );
                const colorsArray = [...productPage.window.document.querySelectorAll(".product-colors__item")]
                .map(e => ({ 
                    color: e.querySelector(".product-colors__tooltip").textContent, 
                    href: "https://brandshop.ru" + (e.querySelector(".product-colors__item-link").href || link)
                }));
                // Выполняется для всех цветов данного товара
                for (let colorInfo of colorsArray) {
                    try {
                        // Загрузка страницы
                        const productPage = new JSDOM(
                            await fetchPageDDoS(colorInfo.href, proxyAgent, proxy, ".toolbar__product-page")
                        );

                        // Получается ссылка на товар
                        const dataLink = (
                            await fetch(`https://cakelink.ru/link?dl=${colorInfo.href}&pass=heiI0Lb6K0szpYk8`, { agent: proxyAgent })
                            .then(res => res.json())
                        )?.data?.url;
                        const product = {
                            age: "Взрослый",
                            color: colorInfo.color.toLowerCase().replace(/ё/g, "е"),
                            delivery:  ["ru", "rb", "kz"],
                            deliveryPrice: 490,
                            description: false,
                            gender: gender,
                            id: Math.random().toString().slice(2, 12),
                            images: [],
                            info: [],
                            installment: true,
                            link: dataLink,
                            pp: "advcake",
                            shop: "brandshop",
                            sizes: [],
                            structure: []
                        };

                        // Обрабатывается бренд и название
                        const descriptionList = [...productPage.window.document.querySelectorAll(".product-page__subheader")]
                        .map(e => cutSpaces(e.innerHTML));
                        const brand = productPage.window.document.querySelector(".product-page__header")?.textContent;
                        product.brand = brand.toUpperCase();
                        product.name = descriptionList[2] + " " + brand;


                        // Обрабатываются старая, новая цены и скидка
                        const newPrice = productPage.window.document.querySelector(".product-order__price_new")?.textContent;
                        const oldPrice = productPage.window.document.querySelector(".product-order__price_old")?.textContent;
                        const discount = productPage.window.document.querySelector(".product-order__price-discount")?.textContent;
                        product.oldprice = parseInt(cutSpaces(oldPrice)?.split(" ").join(""), 10);
                        product.price = parseInt(cutSpaces(newPrice)?.split(" ").join(""), 10);
                        product.discount = parseInt(discount?.split("–")[1], 10);
                        product.benifit = product.oldprice - product.price;


                        // Обрабатываются категория и субкатегория
                        let toolbarArray = [...productPage.window.document.querySelectorAll(".breadcrumbs__item")]
                        .map(e => cutSpaces(e.textContent));
                        product.category = (() => {
                            if (toolbarArray[2]?.toLowerCase().includes("одежда")) return "Одежда";
                            if (toolbarArray[2]?.toLowerCase().includes("обувь")) return "Обувь";
                            if (toolbarArray[2]?.toLowerCase().includes("аксессуары")) return "Аксессуары";
                            return undefined;
                        })();
                        product.subcategory = toolbarArray[3];



                        // Обрабатывается все описание (в том числе страна-производитель и материал)
                        let menuArray = [...productPage.window.document.querySelectorAll(".product-menu__content > div li")]
                        .map(e => e.textContent);
                        product.country = cutSpaces(menuArray.find(e => e.includes("Страна-производитель:"))?.split("Страна-производитель:")[1]);
                        const materials = menuArray.find(e => e.includes("Материал:"))?.split("Материал:")[1];
                        if (materials?.includes(";")) {
                            product.structure = materials.split(";").map(e => cutSpaces(e));
                        } else if (materials?.includes(",")) {
                            product.structure = materials.split(",").map(e => cutSpaces(e));
                        } else if (materials) {
                            product.structure = [ cutSpaces(materials) ];
                        } 
                        menuArray = menuArray.filter(e => !(e.includes("Страна-производитель:") || e.includes("Материал:")));
                        product.info = menuArray.map(e => cutSpaces(e));

                        // Обрабатываются ссылки на фотографии
                        let imageRefs = [...productPage.window.document.querySelectorAll(".zoom-region > div > img")].map(e => e.src);
                        product.images = imageRefs;

                        // Обрабаывается информация о размерах в наличии
                        let sizes = [...productPage.window.document.querySelectorAll(".product-plate__item")]
                        .map(e => cutSpaces(e.textContent?.split("\n")[1]));
                        product.sizes = sizes;


                        
                        // Полный результат парсинга добавляется в БД
                        if (product.price) {
                            const db = client.db(process.env.DB_NAME);
                            let collection = "";
                            switch(product.category) {
                                case "Одежда":  
                                    collection = db.collection("clothes");
                                    break;
                            
                                case 'Обувь':  
                                    collection = db.collection("shoes");
                                    break;
                            
                                case 'Аксессуары':  
                                    collection = db.collection("accessories");
                                    break;
                            }
                            if (collection) {
                                await collection.insertOne(product);
                                counter++;
                            } else {
                                throw new Error("Invalid product category");
                            }
                        } 
                    } catch (err) {
                        console.log("Ошибка обработки одного товара.");
                        console.error(err);    
                    }
                } 
            } catch (err) {
                console.log("Ошибка обработки группы товаров.");
                console.error(err);
            }
        }
        //Возвращается число товаров, которые с этой страницы были стянуты
        return counter; 
    } catch (err) {
        console.log("Ошибка объявления потока.");
        console.error(err);
        return err;
    }
}

// Главная функция программы (на экспорт)

async function praseBrandshop() {
    try {
        await client.connect();
        const start = Date.now();
        const processData = {
            name: "brandshop",
            first: `Начало сбора в ${(new Date()).toLocaleTimeString("ru-RU")}`
        }

        // Чистится БД
        const db = client.db(process.env.DB_NAME);
        let collection = db.collection("clothes");
        await collection.deleteMany({});
        collection = db.collection("shoes");
        await collection.deleteMany({});
        collection = db.collection("accessories");
        await collection.deleteMany({});
        collection = db.collection("processing");
        await collection.deleteMany({});


        const proxies = fs.readFileSync(process.env.PROXY_PATH, { encoding: "utf8" }).split("\r\n");
        let proxyCounter = 0;
        const generatePromises = async (gender) => {
            const result = [];
            let i = 1;
            while (true) {
                try {
                    let proxyAgent;
                    let page;
                    while (!page) {
                        proxyAgent = new HttpsProxyAgent("http://" + proxies[proxyCounter % 50]);
                        proxyCounter ++;
                        page = await fetchPageDDoS(`https://brandshop.ru/sale/?mfp=17-pol%5B${gender}%5D&page=${i}`, proxyAgent, proxies[(proxyCounter - 1) % 50], ".header__menu");
                    }
                    
                    if ((new JSDOM(page)).window.document.querySelector(".product-card__link")) {
                        result.push(fetchShopPage(proxyAgent, proxies[(proxyCounter - 1) % 50],  gender, (new JSDOM(page))));
                    } else {
                        break;
                    }
                    i ++;
                } catch (err) {
                    console.log("Ошибка generatePromises.");
                    console.error(err);
                    continue;
                }
            }
            return result;
        };
        const malePromises = await generatePromises("Мужской");
        const femalePromises = await generatePromises("Женский");


        // Асинхронно выполняется парсинг всех страниц на разных прокси
        // Результатом получаем число товаров в сумме со всех страниц
        const sum = await Promise.allSettled([...malePromises, ...femalePromises])
        .then(results => results?.filter(e => e.status == "fulfilled").map(e => e.value).reduce((acc, e) => acc + e, 0));


        // Обрабатывается время выполнения и загружается в БД
        const timePassed = parseInt((Date.now() - start) / 1e3);
        const timeString = (timePassed > 3600) ? 
            `${ parseInt(timePassed / 3600) } ч. ${ parseInt(timePassed % 3600 / 60) } мин. ${ parseInt(timePassed % 60) } сек.`
            :
            `${ parseInt(timePassed / 60) } мин. ${ parseInt(timePassed % 60) } сек.`
            ; 
        processData.total = `${sum} прод. было собрано за ${timeString}`;
        await collection.insertOne(processData);
        await client.close();
    } catch (err) {
        console.log("Ошибка при инициализации приложения.");
        console.error(err);
    }
};

export default praseBrandshop;