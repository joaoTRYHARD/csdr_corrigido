async function mostrarHistorico() {
  const lista = $('lista-historico');

  try {
    const { data } = await api.get('/historico');

    if (data.length === 0) {
      lista.innerHTML = '<p class="vazio">Nenhuma verificação feita ainda.</p>';
      return;
    }

    lista.innerHTML = data.map(item => `
      <div class="item-lista">
        <div class="info">
          <b>${esc(item.nome)}</b>
          <small>${new Date(item.feito_em).toLocaleString('pt-BR')}</small>
        </div>
        <span class="selo ${item.compativel ? 'ok' : 'ruim'}">${item.compativel ? 'Compatível' : 'Incompatível'}</span>
      </div>`).join('');
  } catch (erro) {
    toast(mensagemDeErro(erro));
  }
}

$('btn-limpar').onclick = async () => {
  try {
    await api.delete('/historico');
    mostrarHistorico();
    toast('Histórico limpo');
  } catch (erro) {
    toast(mensagemDeErro(erro));
  }
};

async function iniciar() {
  if (await exigirLogin()) mostrarHistorico();
}

iniciar();
