#!/usr/bin/env node
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const puppeteer = require("puppeteer");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log("api key:", process.env.SENDGRID_API_KEY);

const msg = {
  to: [
    "camilacairo97@gmail.com",
    "rodrimarchese@gmail.com",
    "Cuervo.irigoyen@gmail.com",
    "nicomarchese2003@gmail.com",
  ], // Change to your recipient
  from: "rodrimarchese@hotmail.com", // Change to your verified sender
  subject: "VENTA ENTRADAS SELECCION",
  text: "Posiblemente hay enradas!!",
  html: "<strong>Entra a comprar entradas!!</strong> <br> <a href='https://www.deportick.com/'>Deportick</a>",
};

const msgNoEnradas = {
  to: [
    "camilacairo97@gmail.com",
    "rodrimarchese@gmail.com",
    "Cuervo.irigoyen@gmail.com",
    "nicomarchese2003@gmail.com",
  ], // Change to your recipient
  from: "rodrimarchese@hotmail.com", // Change to your verified sender
  subject: "No cambio nada en la pagina",
  text: "Todavia no hay entradas, no cambio nada aun",
  html: "<strong>Al parecer no cambio nada todavia</strong>",
};

(async () => {
  // Launch Puppeteer in chromium and navigate to the page
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.deportick.com/");

  console.log("Page loaded");

  //wait for the image to appear and gets its src attribute
  // //*[@id="eventList"]/div/div/div[1]/div/a/div/img
  const imageSelector =
    "#eventList > div > div > div:nth-child(1) > div > a > div > img";
  await page.waitForSelector(imageSelector);
  console.log("Image found", imageSelector);

  //get the src attribute
  const src = await page.$eval(imageSelector, (image) => image.src);
  console.log("Src: ", src);

  // Wait for the link to appear and get its href attribute
  // //*[@id="eventList"]/div/div/div[1]/div/a

  const linkSelector = "#eventList > div > div > div:nth-child(1) > div > a";
  await page.waitForSelector(linkSelector);
  console.log("Link found", linkSelector);

  // get the href attribute
  const href = await page.$eval(linkSelector, (link) => link.href);
  console.log("Href: ", href);

  // Check if the link has changed
  const previousHref =
    "https://www.laruralticket.com.ar/event/campeones-del-mundo";

  const previousSrc =
    "https://cdn.getcrowder.com/images/1678371987163-null-Banner_Exhibicion_en_Deportick.jpg";

  if (href !== previousHref || src !== previousSrc) {
    try {
      //send mail
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("No salieron a la venta aun...");
    try {
      //send mail
      sgMail
        .send(msgNoEnradas)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  }

  // Close the browser
  await browser.close();
})();
