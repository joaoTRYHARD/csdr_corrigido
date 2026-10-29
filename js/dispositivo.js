async function carregar() {
  const d = await lerDispositivo();
  $('cpu').value = d.cpu;
  $('ram').value = d.ram;
  $('espaco').value = d.espaco;
  atualizarStats();
}

function atualizarStats() {
  $('s-cpu').textContent = $('cpu').value + ' núcleos';
  $('s-ram').textContent = Number($('ram').value) > 0 ? $('ram').value + ' GB' : 'não informada';
  $('s-espaco').textContent = $('espaco').value + ' GB';
  $('s-so').textContent = navigator.platform;
}

['cpu', 'ram', 'espaco'].forEach(id => {
  $(id).oninput = () => {
    salvar('dispositivo', {
      cpu: Number($('cpu').value),
      ram: Number($('ram').value),
      espaco: Number($('espaco').value)
    });
    atualizarStats();
  };
});

$('btn-restaurar').onclick = () => {
  localStorage.removeItem('dispositivo');
  carregar();
  toast('Leitura automática restaurada');
};

async function iniciar() {
  if (await exigirLogin()) exigirConsentimento(carregar);
}

iniciar();
