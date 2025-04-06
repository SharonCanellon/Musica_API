// Funcion para obtener el token de acceso de Spotify automaticamente
function obtenerToken() {
    const clientID = 'b50a5bc1560242168adaf6facb07682f';  
    const clientSecret = '19f196dbb08c45f18b7453098d9776f4'; 

    const authHeader = 'Basic ' + btoa(clientID + ':' + clientSecret);

    return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Devuelve el token de acceso
        return data.access_token;  
    })
    .catch(error => {
        console.error('Error al obtener el token:', error);
        throw new Error('No se pudo obtener el token de acceso');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchButton').addEventListener('click', buscarArtista);
});

// Funcion para buscar el artista
document.addEventListener('DOMContentLoaded', function() {
    // Añade el listener al boton de busqueda
    document.getElementById('searchButton').addEventListener('click', buscarArtista);
});

function buscarArtista() {
    const artistaNombre = document.getElementById("artistaBuscar").value.trim();

    // Verifica si el campo de búsqueda está vacio
    if (!artistaNombre) {
        alert("Por favor, ingresa un nombre de artista.");
        return;
    }

    // Llama la funcion para obtener el token de acceso de Spotify
    obtenerToken().then(token => {
        // Se crea la URL de la solicitud de búsqueda de artistas en Spotify
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistaNombre)}&type=artist&limit=10`;

        // Realiza la solicitud a la API de Spotify
        fetch(url, {
            method: "GET",
            headers: {
                // Usa el token de acceso
                "Authorization": `Bearer ${token}` 
            }
        })
        .then(response => {
            // Verifica si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error("Error al obtener los datos de la API de Spotify");
            }
            return response.json();
        })
        .then(data => {
            // Limpia la tabla antes de mostrar los nuevos resultados
            const tbody = document.getElementById("bodyTable");
            tbody.innerHTML = '';

            // Verifica si no se encontraron artistas
            if (!data.artists.items || data.artists.items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">No se encontraron artistas.</td></tr>';
                return;
            }

            // Muestra los artistas encontrados en la tabla
            data.artists.items.forEach(artista => {
                const fila = document.createElement("tr");

                // Columna con el nombre del artista y un enlace a su perfil en Spotify
                const columnaName = document.createElement("td");
                const linkArtista = document.createElement("a");
                linkArtista.href = artista.external_urls.spotify;
                linkArtista.target = "_blank";
                // Para abrir en nueva pestaña
                linkArtista.textContent = artista.name;
                columnaName.appendChild(linkArtista);
                fila.appendChild(columnaName);

                // Columna con el genero del artista
                const columnaGenero = document.createElement("td");
                columnaGenero.textContent = artista.genres.length > 0 ? artista.genres[0] : "Desconocido";
                fila.appendChild(columnaGenero);

                // Columna con la imagen del artista
                const columnaImagen = document.createElement("td");
                const imagen = document.createElement("img");
                imagen.src = artista.images.length > 0 ? artista.images[0].url : "https://via.placeholder.com/100";
                imagen.width = 100;
                columnaImagen.appendChild(imagen);
                fila.appendChild(columnaImagen);

                // **Nueva columna: Muestra los nombres de los albumes del artista**
                const columnaAlbumes = document.createElement("td");
                // Realizar una solicitud adicional para obtener los álbumes del artista
                fetch(`https://api.spotify.com/v1/artists/${artista.id}/albums?limit=10`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                .then(albumesResponse => albumesResponse.json())
                .then(albumesData => {
                    // Muestra los nombres de los albumes
                    if (albumesData.items && albumesData.items.length > 0) {
                        const nombresAlbumes = albumesData.items.map(album => album.name).join(', ');
                        columnaAlbumes.textContent = nombresAlbumes;
                    } else {
                        columnaAlbumes.textContent = "No se encontraron albumes";
                    }
                    fila.appendChild(columnaAlbumes);
                })
                .catch(error => {
                    console.error("Error al obtener los albumes del artista:", error);
                    columnaAlbumes.textContent = "Error al obtener los albumes";
                    fila.appendChild(columnaAlbumes);
                });

                // Agregar la fila a la tabla
                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error al obtener los artistas:", error);
            const tbody = document.getElementById("bodyTable");
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Error al obtener los artistas.</td></tr>';
            }
        });
    }).catch(error => {
        console.error('No se pudo obtener el token de acceso:', error);
        alert('No se pudo obtener el token de acceso');
    });
}