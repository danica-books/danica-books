// Hány könyv jelenjen meg egy oldalon
const BOOKS_PER_PAGE = 8;

let books = [];
let currentPage = 1;

// Könyvek betöltése
async function loadBooks() {
    try {
        const list = await fetch('/data/books/index.json').then(r => r.json());

        books = [];
        for (const file of list.books) {
            const data = await fetch(`/data/books/${file}`).then(r => r.json());
            books.push(data);
        }

        renderBooks();
        updatePagination();

    } catch (err) {
        console.error("Hiba a könyvek betöltésekor:", err);
        document.getElementById('book-list').innerHTML =
            "<p style='color:red;'>Hiba történt a könyvek betöltésekor.</p>";
    }
}

// Könyvek kirenderelése
function renderBooks() {
    const container = document.getElementById('book-list');
    container.innerHTML = "";

    const start = (currentPage - 1) * BOOKS_PER_PAGE;
    const end = start + BOOKS_PER_PAGE;

    const pageBooks = books.slice(start, end);

    pageBooks.forEach(book => {
        const div = document.createElement('div');
        div.className = "book-card";

        div.innerHTML = `
            <img src="${book.cover}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>${book.description}</p>
            <a href="${book.download}" class="download-btn" target="_blank">Letöltés (PDF)</a>
        `;

        container.appendChild(div);
    });
}

// Lapozás frissítése
function updatePagination() {
    const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE);

    document.getElementById('page-number').textContent =
        `${currentPage} / ${totalPages}`;

    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages;
}

// Előző oldal
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderBooks();
        updatePagination();
    }
}

// Következő oldal
function nextPage() {
    const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderBooks();
        updatePagination();
    }
}

// Indítás
loadBooks();
