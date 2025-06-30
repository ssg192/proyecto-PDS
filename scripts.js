function mostrarSeccion(id){
    document.querySelectorAll('main > section').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if(id === 'donar') setTimeout(iniciarMapaDonar, 150);
    if(id === 'grafica') setTimeout(actualizarGrafica, 120);
    if(id === 'catalogo') setTimeout(renderCatalogo, 80);
}

let donaciones = JSON.parse(localStorage.getItem("donaciones") || "[]");

document.getElementById("formDonar").onsubmit = async function(e){
    e.preventDefault();
    
    const lat = Number(this.lat.value);
    const lng = Number(this.lng.value);
    let direccion = "Zona no disponible";
    
    try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        if(resp.ok){
            const data = await resp.json();
            if(data.display_name) direccion = data.display_name;
        }
    } catch(err) {}
    
    const nueva = {
        nombre: this.nombre.value.trim(),
        contacto: this.contacto.value.trim(),
        articulo: this.articulo.value.trim(),
        descripcion: this.descripcion.value.trim(),
        lat, lng, direccion,
        entregada: false
    };
    
    donaciones.push(nueva);
    localStorage.setItem("donaciones", JSON.stringify(donaciones));
    this.reset();
    document.getElementById("dirAprox").textContent = "";
    actualizarGrafica();
    if(window.__mapaDonar) window.__mapaDonar.setView([21, -101], 7);

    const div = document.getElementById("mensajeDonar");
    div.textContent = "¡Petición enviada! Gracias por tu donación.";
    div.style.display = "block";
    setTimeout(() => { div.style.display = "none"; }, 3500);
};

function marcarEntregado(idx){
    if(confirm("¿Seguro que deseas marcar como entregada?")){
        donaciones[idx].entregada = true;
        localStorage.setItem("donaciones", JSON.stringify(donaciones));
        renderCatalogo();
        actualizarGrafica();
    }
}

function renderCatalogo(){
    let filtro = document.getElementById("filtroEstado").value;
    let filtered = donaciones.filter(d => {
        if(filtro === "pendientes") return !d.entregada;
        if(filtro === "entregadas") return d.entregada;
        return true;
    });
    
    const lista = document.getElementById("catalogoLista");
    if(!filtered.length){
        lista.innerHTML = "<em>No hay donaciones para mostrar.</em>";
        return;
    }

    lista.innerHTML = filtered.map((d, idx) => `
        <div class="card${d.entregada ? ' entregada' : ''}">
            <strong>${d.articulo}</strong> — ${d.descripcion}<br>
            <span style="font-size:0.93em">Donador: ${d.nombre} <br>Contacto: ${d.contacto}</span>
            ${d.direccion ? `<div style="font-size:0.93em;color:#666;margin-bottom:4px;"><b>Zona:</b> ${d.direccion}</div>` : ''}
            <div class="mapa-peq" id="catmapa${idx}"></div>
            ${!d.entregada ? "<span style='color:#b91c1c'>Pendiente</span>" : "✔️ Entregada"}
            ${!d.entregada ? `<button onclick="marcarEntregado(${donaciones.findIndex(x => x === d)})" style="margin-top:8px">Marcar como entregada</button>` : ""}
        </div>
    `).join("");

    filtered.forEach((d, i) => {
        let id = "catmapa" + i;
        let el = document.getElementById(id);
        if(el){
            let m = L.map(el, { attributionControl: false, zoomControl: false, dragging: false, scrollWheelZoom: false });
            m.setView([d.lat, d.lng], 13);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
            L.marker([d.lat, d.lng]).addTo(m);
            setTimeout(() => { m.invalidateSize(); }, 180);
        }
    });
}

let testimonios = JSON.parse(localStorage.getItem("testimonios") || "[]");

function renderTestimonios(){
    const cont = document.getElementById("testimoniosLista");
    cont.innerHTML = testimonios.length
        ? testimonios.map(t => `
            <div class="testimonio">
                <div class="testimonio-nombre">${t.nombre}</div>
                <div>${t.texto}</div>
            </div>
        `).join("")
        : "<em>Sé el primero en dejar un testimonio.</em>";
}

document.getElementById("formTestimonio").onsubmit = function(e){
    e.preventDefault();
    testimonios.push({ nombre: this.testimonioNombre.value.trim(), texto: this.testimonioTexto.value.trim() });
    localStorage.setItem("testimonios", JSON.stringify(testimonios));
    this.reset();
    renderTestimonios();
};

let grafica;

function actualizarGrafica(){
  const totalEntregadas = donaciones.filter(d => d.entregada).length;
  document.getElementById("totalEntregadas")
          .textContent = "Total entregadas: " + totalEntregadas;

  const ctx = document.getElementById('graficaDonaciones').getContext('2d');
  if (grafica) grafica.destroy();

  grafica = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entregadas", "Pendientes"],
      datasets: [{
        data: [totalEntregadas, donaciones.length - totalEntregadas],
        backgroundColor: ["#10b981", "#facc15"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

window.addEventListener("load", function () {
  const loader = document.getElementById("page-loader");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 2000);
  }
});
// después de renderCatalogo()
document.querySelectorAll('.card').forEach((c, i) => {
  c.style.animationDelay = (i * 0.1) + 's'; // retrasa la animación para efecto escalonado
  c.classList.add('fadeInUp');
});
function actualizarGrafica(){
  const totalEntregadas = donaciones.filter(d => d.entregada).length;
  document.getElementById("totalEntregadas")
          .textContent = "Total entregadas: " + totalEntregadas;

  const ctx = document.getElementById('graficaDonaciones').getContext('2d');
  if (grafica) grafica.destroy();

  grafica = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entregadas", "Pendientes"],
      datasets: [{
        data: [totalEntregadas, donaciones.length - totalEntregadas],
        backgroundColor: ["#10b981", "#facc15"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  actualizarProgreso(100);
}
function actualizarProgreso(meta) {
  const totalActual = donaciones.filter(d => d.entregada).length;
  const porcentaje = Math.min((totalActual / meta) * 100, 100);

  const barra = document.querySelector('.barra-llenada');
  const numActual = document.getElementById('numActual');
  const metaTotal = document.getElementById('metaTotal');

  if (barra && numActual && metaTotal) {
    barra.style.width = porcentaje + '%';
    numActual.textContent = totalActual;
    metaTotal.textContent = meta;
  }
}
function toggleFAQ(card) {
  card.classList.toggle('open');
}
