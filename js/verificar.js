async function mostrarApps(texto) {
  const grade = $('grade-apps');

  try {
    const { data } = await api.get('/apps', { params: { busca: texto } });
    grade.innerHTML = '';

    if (data.length === 0) {
      grade.innerHTML = '<p class="vazio">Nenhum aplicativo encontrado.</p>';
      return;
    }

    data.forEach(app => {
      const card = document.createElement('div');
      card.className = 'app-card';
      card.innerHTML = `
        <h3>${esc(app.nome)}</h3>
        <div class="chips">
          <span class="chip">💾 ${app.ram} GB RAM</span>
          <span class="chip">📦 ${app.espaco} GB</span>
          <span class="chip">🧠 ${app.cpu} núcleos</span>
        </div>`;
      card.onclick = () => comparar(app);
      grade.appendChild(card);
    });
  } catch (erro) {
    toast(mensagemDeErro(erro));
  }
}

async function comparar(app) {
  const meu = await lerDispositivo();

  const itens = [
    { nome: 'RAM', tenho: meu.ram, preciso: app.ram, un: 'GB' },
    { nome: 'Espaço', tenho: meu.espaco, preciso: app.espaco, un: 'GB' },
    { nome: 'CPU', tenho: meu.cpu, preciso: app.cpu, un: 'núcleos' }
  ];

  const compativel = itens.every(i => i.tenho >= i.preciso);

  $('resultado').hidden = false;
  $('resultado').className = 'card resultado ' + (compativel ? 'compativel' : 'incompativel');
  $('resultado').innerHTML = `
    <h2>${compativel ? '✔ Compatível' : '⚠ Incompatível'}</h2>
    <p>${compativel
      ? `Seu dispositivo roda <b>${esc(app.nome)}</b>.`
      : `Seu dispositivo não atende os requisitos de <b>${esc(app.nome)}</b>.`}</p>
    ${itens.map(i => `
      <div class="barra-item">
        ${i.nome}: você tem ${i.tenho} ${i.un}, precisa de ${i.preciso} ${i.un}
        <div class="barra"><div class="${i.tenho >= i.preciso ? 'ok' : 'ruim'}" data-largura="${Math.min(100, (i.tenho / i.preciso) * 100)}"></div></div>
      </div>`).join('')}`;

  setTimeout(() => {
    document.querySelectorAll('.barra div').forEach(b => b.style.width = b.dataset.largura + '%');
  }, 50);

  $('resultado').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    await api.post('/historico', { aplicativo_id: app.id, compativel });
  } catch (erro) {
    toast(mensagemDeErro(erro));
  }
}

$('busca').oninput = (e) => mostrarApps(e.target.value);

async function iniciar() {
  if (await exigirLogin()) exigirConsentimento(() => mostrarApps(''));
}

iniciar();
