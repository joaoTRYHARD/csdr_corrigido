// Catálogo inicial de aplicativos
let apps = [
  { nome: 'Jogo Pesado 3D', espaco: 12, ram: 6, cpu: 8 },
  { nome: 'Rede Social Leve', espaco: 0.2, ram: 2, cpu: 4 },
  { nome: 'Editor de Vídeo', espaco: 3, ram: 4, cpu: 6 },
  { nome: 'App de Mensagens', espaco: 0.1, ram: 1, cpu: 2 }
];

const modal = document.getElementById('modal');
const areaApp = document.getElementById('area-app');
const aviso = document.getElementById('aviso');
const listaApps = document.getElementById('lista-apps');
const resultado = document.getElementById('resultado');

// ---------- Consentimento ----------
document.getElementById('btn-aceitar').onclick = () => {
  // guarda o aceite com data e hora
  localStorage.setItem('consentimento', new Date().toISOString());
  modal.classList.add('escondido');
  aviso.hidden = true;
  iniciar();
};

document.getElementById('btn-recusar').onclick = () => {
  modal.classList.add('escondido');
  areaApp.hidden = true;
  aviso.hidden = false;
};

document.getElementById('link-rever').onclick = (e) => {
  e.preventDefault();
  modal.classList.remove('escondido');
};

if (localStorage.getItem('consentimento')) {
  modal.classList.add('escondido');
  iniciar();
}

// ---------- Leitura do dispositivo ----------
async function iniciar() {
  areaApp.hidden = false;

  const cpu = navigator.hardwareConcurrency || 1;
  const ram = navigator.deviceMemory || 0; // nem todo navegador informa
  let espaco = 0;

  if (navigator.storage && navigator.storage.estimate) {
    const e = await navigator.storage.estimate();
    espaco = (e.quota - e.usage) / 1024 ** 3;
  }

  document.getElementById('cpu').value = cpu;
  document.getElementById('ram').value = ram;
  document.getElementById('espaco').value = espaco.toFixed(1);

  document.getElementById('info-dispositivo').innerHTML = `
    <li>Sistema: ${navigator.platform}</li>
    <li>Núcleos de CPU: ${cpu}</li>
    <li>RAM: ${ram ? ram + ' GB' : 'não informada pelo navegador'}</li>
    <li>Espaço livre (estimado): ${espaco.toFixed(1)} GB</li>
  `;

  mostrarApps('');
}

// ---------- Catálogo e busca ----------
function mostrarApps(texto) {
  listaApps.innerHTML = '';
  apps
    .filter(a => a.nome.toLowerCase().includes(texto.toLowerCase()))
    .forEach(a => {
      const li = document.createElement('li');
      li.textContent = a.nome;
      li.onclick = () => comparar(a);
      listaApps.appendChild(li);
    });
}

document.getElementById('busca').oninput = (e) => mostrarApps(e.target.value);

// ---------- Comparação ----------
function comparar(app) {
  const meu = {
    ram: Number(document.getElementById('ram').value),
    espaco: Number(document.getElementById('espaco').value),
    cpu: Number(document.getElementById('cpu').value)
  };

  const faltas = [];
  if (meu.ram < app.ram) faltas.push(`RAM: você tem ${meu.ram} GB, precisa de ${app.ram} GB`);
  if (meu.espaco < app.espaco) faltas.push(`Espaço: você tem ${meu.espaco} GB, precisa de ${app.espaco} GB`);
  if (meu.cpu < app.cpu) faltas.push(`CPU: você tem ${meu.cpu} núcleos, precisa de ${app.cpu}`);

  const ok = faltas.length === 0;

  resultado.hidden = false;
  resultado.className = 'card ' + (ok ? 'compativel' : 'incompativel');
  resultado.innerHTML = ok
    ? `<h2>✔ Compatível</h2><p>Seu dispositivo roda <b>${app.nome}</b>.</p>`
    : `<h2>⚠ Incompatível</h2>
       <p>Seu dispositivo não atende <b>${app.nome}</b>:</p>
       <ul>${faltas.map(f => `<li>${f}</li>`).join('')}</ul>`;
}

// ---------- Cadastro de app ----------
document.getElementById('form-app').onsubmit = (e) => {
  e.preventDefault();
  apps.push({
    nome: document.getElementById('n-nome').value,
    espaco: Number(document.getElementById('n-espaco').value),
    ram: Number(document.getElementById('n-ram').value),
    cpu: Number(document.getElementById('n-cpu').value)
  });
  e.target.reset();
  mostrarApps('');
  alert('Aplicativo cadastrado com sucesso');
};
