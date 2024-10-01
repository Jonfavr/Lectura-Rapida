const selectAutor = document.getElementById("select-author");
const autorInput = document.getElementById('autor');
const tituloInput = document.getElementById('titulo');
const selectLibro = document.getElementById("select-libro");
const bookForm = document.getElementById('book-form');
const capitulosContainer = document.getElementById('capitulos-container');
let autores = {};
let capitulos = {}; 


function llenarSelectores() {
    fetch('../data/bibliotecario.csv')
        .then(response => response.text())
        .then(text => {
            const rows = text.split('\n').slice(1);
            autores = {};

            rows.forEach(row => {
                const [ida,idl,autor_Libro, titulo_Libro] = row.split(',');
                if (!autores[autor_Libro]) {
                    autores[autor_Libro] = [];
                }
                autores[autor_Libro].push(titulo_Libro);
            });
            console.log(autores)
            llenarSelectoresAutores();
        });
}

function llenarSelectoresAutores() {
    selectAutor.innerHTML = "<option value=''>Nuevo Autor</option>";
    Object.keys(autores).forEach(autor => {
        const option = document.createElement("option");
        option.value = autor;
        option.textContent = autor;
        selectAutor.appendChild(option);
    });

    selectAutor.addEventListener("change", function () {
        const selectedAutor = this.value;
        if (selectedAutor === "") {
            autorInput.style.display = 'block';
            resetForm();
        } else {
            autorInput.style.display = 'none';
            llenarSelectoresLibros(selectedAutor);
        }
    });
}

function llenarSelectoresLibros(autor) {
    selectLibro.innerHTML = "<option value=''>Nuevo Libro</option>";
    autores[autor].forEach(libro => {
        const option = document.createElement("option");
        option.value = libro;
        option.textContent = libro;
        selectLibro.appendChild(option);
    });

    selectLibro.addEventListener("change", function () {
        const selectedLibro = this.value;
        if (selectedLibro === "") {
            tituloInput.style.display = 'block';
            resetFormLibros();
        } else {
            tituloInput.style.display = 'none';
            cargarCapitulosExistentes(selectAutor.value, selectedLibro);
        }
    });
}

function cargarCapitulosExistentes(autor, libro) {
    fetch(`../data/biblioteca/${autor}-${libro}.csv`)
        .then(response => response.text())
        .then(text => {
            const rows = text.split('\n').slice(1);
            const capitulos = {};

            capitulosContainer.innerHTML = "";

            rows.forEach((row, index) => {
                const firstCommaIndex = row.indexOf(',');

                if (firstCommaIndex === -1) return;

                const nombreCapitulo = row.slice(0, firstCommaIndex);
                let contenidoCapitulo = row.slice(firstCommaIndex + 1);
                
                contenidoCapitulo = contenidoCapitulo.replace(/"/g, '');

                capitulos[`capitulo_${index + 1}`] = {
                    nombre: nombreCapitulo,
                    contenido: contenidoCapitulo
                };

                agregarCapitulo(nombreCapitulo, contenidoCapitulo);
            });

            agregarCapitulo("", "");
        });
}


function agregarCapitulo(nombre = "", contenido = "") {
    const capituloSection = document.createElement('div');
    capituloSection.classList.add('capitulo-section');

    capituloSection.innerHTML = `
        <label for="capitulo">Capítulo:</label>
        <input type="text" name="capitulo" value="${nombre}">
        <label for="contenido">Contenido:</label>
        <textarea name="contenido" rows="5">${contenido}</textarea>
    `;

    capitulosContainer.appendChild(capituloSection);
}

document.getElementById('agregar-capitulo-btn').addEventListener('click', function () {
    agregarCapitulo("", "");
});

function resetForm() {
    autorInput.style.display = 'block';
    tituloInput.style.display = 'block';
    capitulosContainer.innerHTML = '';
}

function resetFormLibros() { libro
    tituloInput.style.display = 'block';
    capitulosContainer.innerHTML = '';
}

bookForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const autor = selectAutor.value || autorInput.value;
    const titulo = selectLibro.value || tituloInput.value;

    let csvContent = `Chapter_Name,Chapter_Content\n`;

    const capitulosList = capitulosContainer.querySelectorAll('.capitulo-section');
    capitulosList.forEach(capSection => {
        const nombreCapitulo = capSection.querySelector('input[name="capitulo"]').value;
        const contenidoCapitulo = capSection.querySelector('textarea[name="contenido"]').value.replace(/\n/g, ' ');
        csvContent += `${nombreCapitulo},"${contenidoCapitulo}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${autor}-${titulo}.csv`);
    document.body.appendChild(link);

    link.click();
});

document.addEventListener("DOMContentLoaded", function () {
    llenarSelectores();
});
