document.addEventListener("DOMContentLoaded", function() {
    const wordDisplay = document.getElementById("word-display");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const backBtn = document.getElementById("back-btn");
    const forwardBtn = document.getElementById("forward-btn");
    const speedControl = document.getElementById("speed-control");
    const palabrasPorMinuto = document.getElementById("palabras");
    const indexPalabra = document.getElementById("word-index");
    const totalWords = document.getElementById("total-words");
    const bookTitleLink = document.getElementById("book-title-link");
    const authorLink = document.getElementById("author-link");
    const currentChapter = document.getElementById("current-chapter");
    const totalChapters = document.getElementById("total-chapters");
    const focusBtn = document.getElementById("focus");
    const statusBtn = document.getElementById("status");
    const footer = document.getElementById("buttons");
    const regularBackBtn = document.createElement("button");
    const regularForwardBtn = document.createElement("button");

    regularBackBtn.id = "regular-back-btn";
    regularBackBtn.className = "control-btn";
    regularBackBtn.innerHTML = '<img src="../assets/img/icons/previous.png" alt="Previo">';
    regularForwardBtn.id = "regular-forward-btn";
    regularForwardBtn.className = "control-btn";
    regularForwardBtn.innerHTML = '<img src="../assets/img/icons/next.png" alt="Siguiente">';
    regularBackBtn.style.display = "none";
    regularForwardBtn.style.display = "none";

    footer.appendChild(regularBackBtn);
    footer.appendChild(regularForwardBtn);

    let intervalId;
    let index = 0;
    let paused = false;
    let contenidoCapitulo;
    let palabras = [];
    let focusEnabled = true;
    let modoRapido = true;
    

    const urlParams = new URLSearchParams(window.location.search);
    const autor = urlParams.get('autor_Libro');
    const libro = urlParams.get('titulo_Libro');
    let capituloId = urlParams.get('capitulo_Num');
    const cantCapitulos = urlParams.get('cantCapitulos') || 10;

    function focoVisual(palabra) {
        if (!focusEnabled) return palabra; 
        const longitud = palabra.length;
        let indiceCentral = longitud % 2 === 0 ? longitud / 2 : Math.floor(longitud / 2);
        const letras = palabra.split('');
        letras[indiceCentral] = `<span style="color: #0f0">${letras[indiceCentral]}</span>`;
        return letras.join('');
    }

    function obtenerDatosDelLibro(autor, libro, capituloId) {
        return fetch(`../data/biblioteca/${autor}-${libro}.csv`)
            .then(response => response.text())
            .then(text => {
                const lineas = text.split('\n');
                const datosCapitulo = lineas[capituloId].split(',');
                const nombreCapitulo = datosCapitulo[0];
                contenidoCapitulo = datosCapitulo.slice(1).join(' ').replace(/"/g, '');
                palabras = contenidoCapitulo.split(/\s+/);
                return { nombreCapitulo, contenidoCapitulo, palabras };
            });
    }

    function actualizarElementosHTML(autor, libro, capitulo, tituloCapitulo, contenidoCapitulo, palabras, cantCapitulos, currentCapitulo) {
        const encodedAutor = encodeURIComponent(autor);
        const encodedLibro = encodeURIComponent(libro);

        bookTitleLink.textContent = libro;
        authorLink.textContent = autor;
        document.getElementById("chapter_title").textContent = tituloCapitulo;
        palabrasPorMinuto.textContent = speedControl.value + " Palabras / min";
        indexPalabra.textContent = index;
        totalWords.textContent = palabras.length;
        totalChapters.textContent = cantCapitulos;
        currentChapter.textContent = currentCapitulo;

        const wordContainer = document.getElementById("word-container");
        wordContainer.style.width = "80vw";

        if (modoRapido) {
            wordDisplay.innerHTML = focoVisual(palabras[index]);
        } else {
            const wordsToDisplay = palabras.slice(index, index + 50).join(' ');
            wordDisplay.innerHTML = wordsToDisplay;
            wordDisplay.style.fontSize = "2rem";
        }

        bookTitleLink.href = `libro.html?titulo_Libro=${encodedLibro}&autor_Libro=${encodedAutor}`;
        authorLink.href = `autor.html?autor_Libro=${encodedAutor}`;
    }

    function avanzarCapitulo() {
        if (capituloId < cantCapitulos) {
            capituloId++;
            obtenerDatosDelLibro(autor, libro, capituloId).then(datosCapitulo => {
                index = 0;
                actualizarElementosHTML(autor, libro, capituloId, datosCapitulo.nombreCapitulo, datosCapitulo.contenidoCapitulo, datosCapitulo.palabras, cantCapitulos, capituloId);

                recuperarProgreso();
            });
        }
    }

    function retrocederCapitulo() {
        if (capituloId > 1) {
            capituloId--;
            obtenerDatosDelLibro(autor, libro, capituloId).then(datosCapitulo => {
                index = 0;
                actualizarElementosHTML(autor, libro, capituloId, datosCapitulo.nombreCapitulo, datosCapitulo.contenidoCapitulo, datosCapitulo.palabras, cantCapitulos, capituloId);

                recuperarProgreso();
            });
        }
    }

    function guardarProgreso() {
        const lecturasPendientes = JSON.parse(localStorage.getItem('lecturasPendientes')) || {};
        

        const claveProgreso = `${autor}-${libro}-${capituloId}`;
    
        lecturasPendientes[claveProgreso] = index;
    
        localStorage.setItem('lecturasPendientes', JSON.stringify(lecturasPendientes));
    }

    function recuperarProgreso() {
        const lecturasPendientes = JSON.parse(localStorage.getItem('lecturasPendientes')) || {};
        
        const claveProgreso = `${autor}-${libro}-${capituloId}`;
    
        if (lecturasPendientes[claveProgreso] !== undefined) {
            index = lecturasPendientes[claveProgreso];
            
            if (modoRapido) {
                wordDisplay.innerHTML = focoVisual(palabras[index]);
            } else {
                const wordsToDisplay = palabras.slice(index, index + 50).join(' ');
                wordDisplay.innerHTML = wordsToDisplay;
                wordDisplay.style.fontSize = "2rem";
            }
    
            indexPalabra.textContent = index + 1;
        }
    }

    function eliminarProgreso() {
        const lecturasPendientes = JSON.parse(localStorage.getItem('lecturasPendientes')) || {};
        
        const claveProgreso = `${autor}-${libro}-${capituloId}`;
    
        delete lecturasPendientes[claveProgreso];
    
        localStorage.setItem('lecturasPendientes', JSON.stringify(lecturasPendientes));
    }

    function reproducir() {
        paused = false
        const velocidad = parseInt(speedControl.value);

        intervalId = setInterval(() => {
            if (!paused) {
                if (modoRapido) {
                    wordDisplay.innerHTML = focoVisual(palabras[index]);
                } else {
                    const wordsToDisplay = palabras.slice(index, index + 50).join(' ');
                    wordDisplay.innerHTML = wordsToDisplay;
                    wordDisplay.style.fontSize = "2rem";
                }
                indexPalabra.textContent = index + 1;
                totalWords.textContent = palabras.length;
                guardarProgreso(capituloId);
                index++;
                if (index >= palabras.length) {
                    index = 0;
                    clearInterval(intervalId);
                    eliminarProgreso(capituloId);
                }
            }
        }, 60000 / velocidad);
    }

    function pausar() {
        paused = true;
        clearInterval(intervalId);
    }

    function avanzar10Palabras() {
        let newIndex = index + 10;
        if (newIndex >= palabras.length) {
            newIndex = palabras.length - 1;
        }
        index = newIndex;
        if (modoRapido) {
            wordDisplay.innerHTML = focoVisual(palabras[index]);
        } else {
            const wordsToDisplay = palabras.slice(index, index + 50).join(' ');
            wordDisplay.innerHTML = wordsToDisplay;
            wordDisplay.style.fontSize = "2rem";
        }
        indexPalabra.textContent = index + 1;
        totalWords.textContent = palabras.length;
        guardarProgreso();
    }

    function retroceder10Palabras() {
        let newIndex = index - 10;
        if (newIndex < 0) {
            newIndex = 0;
        }
        index = newIndex;
        if (modoRapido) {
            wordDisplay.innerHTML = focoVisual(palabras[index]);
        } else {
            const wordsToDisplay = palabras.slice(index, index + 50).join(' ');
            wordDisplay.innerHTML = wordsToDisplay;
            wordDisplay.style.fontSize = "2rem";
        }
        indexPalabra.textContent = index + 1;
        totalWords.textContent = palabras.length;
        guardarProgreso();
    }

    function avanzar50Palabras() {
        let newIndex = index + 50;
        if (newIndex >= palabras.length) {
            newIndex = palabras.length - 1;
        }
        index = newIndex;
        const wordsToDisplay = palabras.slice(index, index + 50).join(' ');
        wordDisplay.innerHTML = wordsToDisplay;
        wordDisplay.style.fontSize = "5vmin";
        indexPalabra.textContent = index + 1;
        totalWords.textContent = palabras.length;
        guardarProgreso();
    }

    function retroceder50Palabras() {
        let newIndex = index - 50;
        if (newIndex < 0) {
            newIndex = 0;
        }
        index = newIndex;
        const wordsToDisplay = palabras.slice(index, index + 50).join(' ');
        wordDisplay.innerHTML = wordsToDisplay;
        wordDisplay.style.fontSize = "5vmin";
        indexPalabra.textContent = index + 1;
        totalWords.textContent = palabras.length;
        guardarProgreso();
    }

    playPauseBtn.addEventListener("click", function() {
        if (!intervalId) {
            reproducir();
            playPauseBtn.innerHTML = '<img src="../assets/img/icons/pause.png" alt="Pause">';
        } else {
            if (!paused) {
                pausar();
                playPauseBtn.innerHTML = '<img src="../assets/img/icons/play.png" alt="Play">';
            } else {
                paused = false;
                reproducir();
                playPauseBtn.innerHTML = '<img src="../assets/img/icons/pause.png" alt="Pause">';
            }
        }
    });

    focusBtn.addEventListener("click", function() {
        focusEnabled = !focusEnabled;
        if (modoRapido) {
            wordDisplay.innerHTML = focoVisual(palabras[index]);
        }
    });

    statusBtn.addEventListener("click", function() {
        modoRapido = !modoRapido;
        if (modoRapido) {
            // Remover la clase slow-mode cuando regrese a modo rápido
            wordDisplay.classList.remove("slow-mode");
            wordDisplay.innerHTML = focoVisual(palabras[index]);
            wordDisplay.style.fontSize = "";
            playPauseBtn.style.display = "";
            backBtn.style.display = "";
            forwardBtn.style.display = "";
            speedControl.style.display = "";
            regularBackBtn.style.display = "none";
            regularForwardBtn.style.display = "none";
            palabrasPorMinuto.style.display = "";
            statusBtn.innerHTML = '<img src="../assets/img/icons/multiple.png" alt="Multiple">';
        } else {
            // Agregar la clase slow-mode cuando cambie a modo lento
            wordDisplay.classList.add("slow-mode");
            const wordsToDisplay = palabras.slice(index, index + 50).join(' ');
            wordDisplay.innerHTML = wordsToDisplay;
            wordDisplay.style.fontSize = "5vmin";
            wordDisplay.style.width = "calc(80vw-20px)";
            playPauseBtn.style.display = "none";
            backBtn.style.display = "none";
            forwardBtn.style.display = "none";
            speedControl.style.display = "none"
            regularBackBtn.style.display = "";
            regularForwardBtn.style.display = "";
            footer.style.display = "flex";
            palabrasPorMinuto.style.display = "none";
            statusBtn.innerHTML = '<img src="../assets/img/icons/single.png" alt="Single">';
        }
    });

    forwardBtn.addEventListener("click", avanzar10Palabras);

    backBtn.addEventListener("click", retroceder10Palabras);

    regularForwardBtn.addEventListener("click", avanzar50Palabras);

    regularBackBtn.addEventListener("click", retroceder50Palabras);

    speedControl.addEventListener("mousemove", function() {
        palabrasPorMinuto.textContent = speedControl.value + " Palabras / min";
    });

    speedControl.addEventListener("change", function() {
        palabrasPorMinuto.textContent = speedControl.value + " Palabras / min";
    });

    document.getElementById('siguiente').addEventListener('click', avanzarCapitulo);
    document.getElementById('anterior').addEventListener('click', retrocederCapitulo);

    obtenerDatosDelLibro(autor, libro, capituloId).then(datosCapitulo => {
        actualizarElementosHTML(autor, libro, capituloId, datosCapitulo.nombreCapitulo, datosCapitulo.contenidoCapitulo, datosCapitulo.palabras, cantCapitulos, capituloId);
        recuperarProgreso();
    });
});
