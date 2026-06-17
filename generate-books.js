import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const SITE_URL = "https://danicamilanovics.netlify.app/";

async function run() {
    console.log("📘 Oldal letöltése:", SITE_URL);

    const response = await fetch(SITE_URL);
    const html = await response.text();

    console.log("📄 HTML mérete:", html.length, "karakter");

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Könyvek a régi HTML-ben: <div class="book">
    const books = [...document.querySelectorAll('.book')];

    console.log("📚 Talált könyvek száma:", books.length);

    if (books.length === 0) {
        console.log("❗ Nem találtam .book elemeket. Ellenőrizd az URL-t.");
        return;
    }

    // Mappák létrehozása
    if (!fs.existsSync('data/books')) {
        fs.mkdirSync('data/books', { recursive: true });
    }

    if (!fs.existsSync('images')) {
        fs.mkdirSync('images');
    }

    const jsonFiles = [];

    for (let i = 0; i < books.length; i++) {
        const book = books[i];

        const title = book.querySelector('h2')?.textContent.trim() || "Ismeretlen cím";
        const description = book.querySelector('p')?.textContent.trim() || "";
        const coverUrl = book.querySelector('img')?.src || "";
        const download = book.querySelector('a')?.href || "";

        // Slug generálás
        const slug = title
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // ékezetek eltávolítása
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        console.log(`➡ Feldolgozás: ${title}`);

        // Borítókép letöltése
        const coverFilename = `${slug}.jpg`;
        const coverPath = path.join('images', coverFilename);

        if (coverUrl) {
            const imgRes = await fetch(SITE_URL + coverUrl);
            const imgBuffer = await imgRes.arrayBuffer();
            fs.writeFileSync(coverPath, Buffer.from(imgBuffer));
        }

        // JSON fájl létrehozása
        const jsonData = {
            title,
            description,
            cover: `/images/${coverFilename}`,
            download: SITE_URL + download
        };

        const jsonFilename = `${slug}.json`;
        jsonFiles.push(jsonFilename);

        fs.writeFileSync(
            path.join('data/books', jsonFilename),
            JSON.stringify(jsonData, null, 2)
        );

        console.log(`✔ JSON létrehozva: ${jsonFilename}`);
    }

    // Könyvlista generálása Netlify-hoz
    fs.writeFileSync(
        'data/books/index.json',
        JSON.stringify(jsonFiles, null, 2)
    );

    console.log("📄 index.json létrehozva a könyvlistával.");
    console.log("🎉 Kész! Minden könyv beemelve JSON formátumba.");
}

run();
