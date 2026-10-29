// Código compartilhado por todas as páginas

const $ = (id) => document.getElementById(id);
const ler = (chave, padrao) => JSON.parse(localStorage.getItem(chave)) || padrao;
const salvar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));

// Axios: toda requisição já sai com o endereço do servidor e o token de login
const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

let usuarioAtual = null;

// ---------- Utilidades ----------
function mensagemDeErro(erro) {
  return erro.response?.data?.erro || 'Não foi possível conectar ao servidor.';
}

function esc(texto) {
  const d = document.createElement('div');
  d.textContent = texto;
  return d.innerHTML;
}

function toast(msg) {
  let t = $('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  setTimeout(() => t.classList.add('mostrar'), 20);
  setTimeout(() => t.classList.remove('mostrar'), 2500);
}

// ---------- Sessão ----------
async function exigirLogin() {
  try {
    const { data } = await api.get('/me');
    usuarioAtual = data;
  } catch {
    sessionStorage.removeItem('token');
    location.href = 'index.html';
    return false;
  }
  montarTopo();
  return true;
}

function exigirAdmin() {
  if (usuarioAtual.perfil === 'admin') return true;
  location.href = 'dispositivo.html';
  return false;
}

function montarTopo() {
  const pagina = location.pathname.split('/').pop();
  const links = [
    ['dispositivo.html', 'Meu dispositivo'],
    ['verificar.html', 'Verificar app'],
    ['historico.html', 'Histórico']
  ];
  if (usuarioAtual.perfil === 'admin') links.push(['admin.html', 'Admin']);

  $('topo').innerHTML = `
    <div class="logo">⚡ CSDR</div>
    <nav>
      ${links.map(([url, nome]) =>
        `<a href="${url}" class="${pagina === url ? 'ativo' : ''}">${nome}</a>`).join('')}
    </nav>
    <div class="usuario">
      <span>👤 ${esc(usuarioAtual.nome)}</span>
      <button id="btn-sair" class="fantasma">Sair</button>
    </div>`;

  $('btn-sair').onclick = () => {
    sessionStorage.removeItem('token');
    location.href = 'index.html';
  };
}

// ---------- Consentimento (LGPD) ----------
function abrirModal(aoAceitar) {
  if (!$('modal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="modal" class="modal">
        <div class="modal-box">
          <h2>🛡️ Termo de Privacidade</h2>
          <p>Para verificar a compatibilidade, vamos ler dados técnicos do seu dispositivo (CPU, RAM, armazenamento e sistema). Nenhum dado pessoal, como contatos, fotos ou mensagens, é lido.</p>
          <div class="botoes">
            <button id="btn-aceitar">Aceitar e Continuar</button>
            <button id="btn-recusar" class="fantasma">Recusar</button>
          </div>
        </div>
      </div>`);
  }

  $('modal').classList.add('aberto');

  $('btn-aceitar').onclick = async () => {
    try {
      await api.post('/consentimento', { versao: '1.0' });
      usuarioAtual.consentimento = true;
      $('modal').classList.remove('aberto');
      aoAceitar();
    } catch (erro) {
      toast(mensagemDeErro(erro));
    }
  };

  $('btn-recusar').onclick = () => {
    $('modal').classList.remove('aberto');
    if (!location.pathname.endsWith('bloqueio.html')) location.href = 'bloqueio.html';
  };
}

function exigirConsentimento(aoLiberar) {
  if (usuarioAtual.consentimento) aoLiberar();
  else abrirModal(aoLiberar);
}

// ---------- Dados do dispositivo ----------
async function lerDispositivo() {
  const ajustado = ler('dispositivo', null);
  if (ajustado) return ajustado;

  const cpu = navigator.hardwareConcurrency || 1;
  const ram = navigator.deviceMemory || 0;
  let espaco = 0;

  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    espaco = (est.quota - est.usage) / 1024 ** 3;
  }

  return { cpu, ram, espaco: Number(espaco.toFixed(1)) };
}
