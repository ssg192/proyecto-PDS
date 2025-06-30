function iniciarMapaDonar(){
    if(window.__mapaDonar) return;
    window.__mapaDonar = L.map('mapaDonar').setView([21,-101], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(window.__mapaDonar);
    
    let marker = window.__mapMarker = L.marker([21,-101], { draggable: true }).addTo(window.__mapaDonar);

    async function updateLatLng(){
        const lat = marker.getLatLng().lat.toFixed(6);
        const lng = marker.getLatLng().lng.toFixed(6);

        document.getElementById("lat").value = lat;
        document.getElementById("lng").value = lng;
        await buscarDireccion(lat, lng);
    }
    marker.on('dragend', updateLatLng);
    window.__mapaDonar.on('click', function(e){
        marker.setLatLng(e.latlng);
        updateLatLng();
    });
    updateLatLng();
}

async function buscarDireccion(lat, lng){
    const span = document.getElementById("dirAprox");
    span.textContent = "Buscando zona...";
    try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        if(resp.ok){
            const data = await resp.json();
            span.textContent = "Zona: " + (data.display_name || "aproximada");
        } else {
            span.textContent = "No disponible";
        }
    } catch(e){
        span.textContent = "No disponible";
    }
}
