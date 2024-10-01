document.addEventListener('DOMContentLoaded', function () {
    const navItems = document.querySelectorAll('.nav-item');
    const booksSection = document.querySelector('.books-section');
    const authorsSection = document.querySelector('.authors-section');

    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            navItems.forEach(nav => nav.classList.remove('selected'));
            item.classList.add('selected');
            const filter = item.getAttribute('data-filter');
            filterItems(filter);
        });
    });

    function filterItems(filter) {
        if (filter === 'todo') {
            booksSection.style.display = 'block';
            authorsSection.style.display = 'block';
        } else if (filter === 'libros') {
            booksSection.style.display = 'block';
            authorsSection.style.display = 'none';
        } else if (filter === 'autores') {
            booksSection.style.display = 'none';
            authorsSection.style.display = 'block';
        }
    }

    Papa.parse('../data/bibliotecario.csv', {
        download: true,
        header: true,
        complete: function (results) {
            const data = results.data;
            const authorsSection = document.querySelector('.authors');
            const booksSection = document.querySelector('.books');

            const authorsSet = new Set();
            const booksSet = new Set();

            let authorsHTML = '';
            let booksHTML = '';

            data.forEach(row => {
                if (!authorsSet.has(row.id_autor)) {
                    authorsSet.add(row.id_autor);
                    const authorImgPath = `../assets/img/autores/${row.autor_Libro}.webp`;
                    authorsHTML += `<a href="pages/autor.html?id_autor=${row.id_autor}&autor_Libro=${row.autor_Libro}" class="author">
                                        <img src="${authorImgPath}" alt="${row.autor_Libro}">
                                        <h3>${row.autor_Libro}</h3>
                                    </a>`;
                }

                const bookIdentifier = `${row.id_libro}-${row.titulo_Libro}`;
                if (!booksSet.has(bookIdentifier)) {
                    booksSet.add(bookIdentifier);
                    const bookImgPath = `../assets/img/libros/${row.autor_Libro}-${row.titulo_Libro}.webp`;
                    booksHTML += `<a href="pages/libro.html?id_libro=${row.id_libro}&titulo_Libro=${row.titulo_Libro}&autor_Libro=${row.autor_Libro}" class="book">
                                    <img src="${bookImgPath}" alt="${row.titulo_Libro}">
                                    <h3>${row.titulo_Libro}</h3>
                                    <p>${row.autor_Libro}</p>
                                </a>`;
                }
            });

            authorsSection.innerHTML = authorsHTML;
            booksSection.innerHTML = booksHTML;

            const authorDivs = authorsSection.querySelectorAll('.author');
            const bookDivs = booksSection.querySelectorAll('.book');

            function showMoreItems(items, button) {
                items.forEach((item, index) => {
                    if (index >= 6) {
                        item.style.display = 'none';
                    }
                });

                button.addEventListener('click', () => {
                    items.forEach(item => {
                        item.style.display = 'block';
                    });
                    button.style.display = 'none';
                });
            }

            const authorsMoreButton = document.querySelector('.authors-section .more-button');
            const booksMoreButton = document.querySelector('.books-section .more-button');

            showMoreItems(authorDivs, authorsMoreButton);
            showMoreItems(bookDivs, booksMoreButton);
        }
    });

    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    const searchButton = document.getElementById('search-button');

    let booksAndAuthors = [];

    Papa.parse('../data/bibliotecario.csv', {
        download: true,
        header: true,
        complete: function (results) {
            const data = results.data;

            data.forEach(row => {
                booksAndAuthors.push({ type: 'autor', name: row.autor_Libro, id: row.id_autor });
                booksAndAuthors.push({ type: 'libro', name: row.titulo_Libro, autor: row.autor_Libro, id: row.id_libro });
            });
        }
    });

    searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase();
        searchSuggestions.innerHTML = '';

        if (query) {
            const filteredResults = booksAndAuthors.filter(item => 
                item.name.toLowerCase().includes(query)
            );

            filteredResults.forEach(result => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = `${result.type === 'autor' ? 'Autor' : 'Libro'}: ${result.name}`;
                suggestionItem.addEventListener('click', () => {
                    if (result.type === 'autor') {
                        window.location.href = `pages/autor.html?id_autor=${result.id}&autor_Libro=${result.name}`;
                    } else {
                        window.location.href = `pages/libro.html?id_libro=${result.id}&titulo_Libro=${result.name}&autor_Libro=${result.autor}`;
                    }
                });
                searchSuggestions.appendChild(suggestionItem);
            });
        }
    });

    searchButton.addEventListener('click', function () {
        const query = searchInput.value.toLowerCase();
        if (query) {
            window.location.href = `pages/search_results.html?query=${query}`;
        }
    });
});
