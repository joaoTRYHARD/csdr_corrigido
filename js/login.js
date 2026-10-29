const aviso = sessionStorage.getItem('aviso');
if (aviso) {
  toast(aviso);
  sessionStorage.removeItem('aviso');
}

$('form-login').onsubmit = async (e) => {
  e.preventDefault();
  try {
    const { data } = await api.post('/login', {
      email: $('l-email').value,
      senha: $('l-senha').value
    });
    sessionStorage.setItem('token', data.token);
    location.href = 'dispositivo.html';
  } catch (erro) {
    $('l-erro').textContent = mensagemDeErro(erro);
  }
};
