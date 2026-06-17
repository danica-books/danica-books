const booksPerPage = 8;
let currentPage = 1;
let allBooks = [];

// Könyvek betöltése a data/books mappából
async function loadBooks() {
  const response = await fetch('/data/books/');
  const text = await response.text();

  // JSON fájlok listázása
  const parser = new DOMParser();
  const html = parser.parseFromString(text, 'text/html');
  const links = [...html.querySelectorAll('a')].map(a => a.href);

  const jsonFiles = links.filter(link => link.endsWith('.json'));

  // Minden JSON fájl beolvasása
  const bookPromises = jsonFiles.map(async (file) => {
    const res = await fetch(file);
    return await res.json();
  });

  allBooks = await Promise.all(bookPromises);

  renderPage();
  renderPagination();
}

// Könyvek megjelenítése
function renderPage() {
  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  const booksToShow = allBooks.slice(start, end);

  const container = document.getElementById('book-container');
  container.innerHTML = '';

  booksToShow.forEach(book => {
    container.innerHTML += `
      <div class="book-card">
        <img src="${book.cover}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>${book.description}</p>
        <a href="${book.download}" class="download-btn">Letöltés</a>
      </div>
    `;
  });
}

// Lapozó UI
function renderPagination() {
  const totalPages = Math.ceil(allBooks.length / booksPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = `
    <button onclick="prevPage()" ${currentPage === 1 ? 'disabled' : ''}>Előző</button>
    <span>${currentPage} / ${totalPages}</span>
    <button onclick="nextPage()" ${currentPage === totalPages ? 'disabled' : ''}>Következő</button>
  `;
}

function nextPage() {
  const totalPages = Math.ceil(allBooks.length / booksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
    renderPagination();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
    renderPagination();
  }
}

// Indítás
loadBooks();
