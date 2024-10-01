document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('titulo_Libro');
    const bookAuthor = urlParams.get('autor_Libro');

    const bookTitleElement = document.getElementById('book-title');
    const bookAuthorElement = document.getElementById('book-author');
    const bookAuthorLink = document.getElementById('author-link');
    const bookCoverElement = document.getElementById('book-cover');
    const bookResume = document.getElementById('book-resume');
    const chaptersSection = document.querySelector('.chapters');

    bookTitleElement.textContent = bookTitle;
    bookAuthorElement.innerHTML = `<a id="author-link" href="autor.html?autor_Libro=${bookAuthor}">${bookAuthor}</a>`;

    const bookCoverPath = `../assets/img/libros/${bookAuthor}-${bookTitle}.webp`;
    bookCoverElement.src = bookCoverPath;
    bookCoverElement.alt = bookTitle;

    const filePath = `../data/descripciones/libros/${bookAuthor}-${bookTitle}.txt`;
    fetch(filePath)
    .then(response => response.text())
    .then(data => {
        bookResume.textContent = data;
    })
    .catch(error => console.error("Error al cargar la descripción del libro:", error));

    const csvFilePath = `../data/biblioteca/${bookAuthor}-${bookTitle}.csv`;

    Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: function (results) {
            const data = results.data;

            if (data.length === 0) {
                chaptersSection.innerHTML = '<p>No se encontraron capítulos para este libro.</p>';
                return;
            }

            const totalChapters = data.length;

            let chaptersHTML = '';
            data.forEach((row, index) => {
                const chapterName = row.Chapter_Name;
                const chapterNumber = index + 1;

                chaptersHTML += `
                    <div class="chapter">
                        <a href="../pages/lectura.html?titulo_Libro=${encodeURIComponent(bookTitle)}&autor_Libro=${encodeURIComponent(bookAuthor)}&capitulo_Num=${chapterNumber}&cantCapitulos=${totalChapters}">
                            <h3>${chapterName}</h3>
                        </a>
                    </div>`;
            });

            chaptersSection.innerHTML = chaptersHTML;
        },
        error: function (error) {
            console.error("Error al cargar los capítulos:", error);
            chaptersSection.innerHTML = '<p>No se pudieron cargar los capítulos del libro.</p>';
        }
    });
});
