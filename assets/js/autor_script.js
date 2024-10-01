document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const authorName = urlParams.get('autor_Libro');

    const authorNameElement = document.getElementById('author-name');
    const authorNameSpanElement = document.getElementById('author-name-span');
    const authorImageElement = document.getElementById('author-image');
    const authorResume = document.getElementById('author-resume');

    authorNameElement.textContent = authorName;
    authorNameSpanElement.textContent = authorName;

    const authorImagePath = `../assets/img/autores/${authorName}.webp`;
    authorImageElement.src = authorImagePath;
    authorImageElement.alt = authorName;

    const filePath = `../data/descripciones/autores/${authorName}.txt`;
    fetch(filePath)
    .then(response => response.text())
    .then(data => {
        authorResume.textContent = data;
    })
    .catch(error => console.error("Error al cargar la descripción del autor:", error));

    Papa.parse('../data/bibliotecario.csv', {
        download: true,
        header: true,
        complete: function (results) {
            const data = results.data;
            const booksSection = document.querySelector('.books');

            let booksSet = new Set();
            let booksHTML = '';

            data.forEach(row => {
                if (row.autor_Libro === authorName && !booksSet.has(row.titulo_Libro)) {
                    booksSet.add(row.titulo_Libro);

                    const bookImgPath = `../assets/img/libros/${row.autor_Libro}-${row.titulo_Libro}.webp`;
                    
                    booksHTML += `
                        <div class="book">
                            <a href="libro.html?titulo_Libro=${encodeURIComponent(row.titulo_Libro)}&autor_Libro=${encodeURIComponent(row.autor_Libro)}">
                                <img src="${bookImgPath}" alt="${row.titulo_Libro}">
                                <h3>${row.titulo_Libro}</h3>
                                <p>${row.autor_Libro}</p>
                            </a>
                        </div>`;
                }
            });

            if (booksHTML === '') {
                booksHTML = '<p>No se encontraron libros para este autor.</p>';
            }

            booksSection.innerHTML = booksHTML;
        }
    });
});
