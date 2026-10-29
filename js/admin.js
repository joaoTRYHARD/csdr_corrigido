async function mostrarAdmin() {
  try {
    const { data } = await api.get('/apps');

    $('lista-admin').innerHTML = data.map(a => `
      <div class="item-lista">
        <div class="info"><b>${esc(a.nome)}</b><small>${a.ram} GB RAM · ${a.espaco} GB · ${a.cpu} núcleos</small></div>
        <button class="perigo" data-remover="${a.id}">Remover</button>
      </div>`).join('');

    document.querySelectorAll('[data-remover]').forEach(b => b.onclick = async () => {
      try {
        await api.delete('/apps/' + b.dataset.remover);
        mostrarAdmin();
      } catch (erro) {
        toast(mensagemDeErro(erro));
      }
    });
  } catch (erro) {
    toast(mensagemDeErro(erro));
  }
}

$('form-app').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post('/apps', {
      nome: $('n-nome').value.trim(),
      espaco: Number($('n-espaco').value),
      ram: Number($('n-ram').value),
      cpu: Number($('n-cpu').value)
    });
    e.target.reset();
    mostrarAdmin();
    toast('Aplicativo cadastrado com sucesso');
  } catch (erro) {
    toast(mensagemDeErro(erro));
  }
};

async function iniciar() {
  if (await exigirLogin() && exigirAdmin()) mostrarAdmin();
}

iniciar();
