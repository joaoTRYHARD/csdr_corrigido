$('form-cadastro').onsubmit = async (e) => {
  e.preventDefault();

  if ($('c-senha').value !== $('c-senha2').value) {
    $('c-erro').textContent = 'As senhas não conferem.';
    return;
  }

  try {
    await api.post('/cadastro', {
      nome: $('c-nome').value.trim(),
      email: $('c-email').value,
      senha: $('c-senha').value
    });
    sessionStorage.setItem('aviso', 'Conta criada! Faça login.');
    location.href = 'index.html';
  } catch (erro) {
    $('c-erro').textContent = mensagemDeErro(erro);
  }
};
