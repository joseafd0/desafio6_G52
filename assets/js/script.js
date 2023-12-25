const api_url = "https://mindicador.cl/api/";
let myChart = null;

async function getCoins(url) {
  try {
    const monedas = await fetch(url);
    const { dolar, ivp, euro, uf, utm } = await monedas.json();
    return [dolar, ivp, euro, uf, utm];
  } catch (error) {
    throw new Error(error);
  }
}

async function renderCoinOptions(url) {
  try {
    const select_container = document.getElementById("select_coin");
    const coins = await getCoins(url);

    coins.forEach((coin_info) => {
      const option = document.createElement("option");
      option.value = coin_info["codigo"];
      option.innerText = coin_info["nombre"];

      select_container.appendChild(option);

      console.log(coin_info);
    });
  } catch (error) {
    throw new Error(error);
  }
}

async function getCoinDetails(url, coinID) {
  try {
    if (coinID) {
      const coin = await fetch(`${url}${coinID}`);
      const { serie } = await coin.json();
      const [{ valor: coinValue }] = serie;

      return coinValue;
    } else {
      alert("Seleciona una moneda");
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function getAndCreateDataToChart(url, coinID) {
  const coin = await fetch(`${url}${coinID}`);
  const { serie } = await coin.json();

  const lastTenDaysData = serie.slice(-10);

  const labels = lastTenDaysData.map(({ fecha }) => {
    return fecha;
  });

  const data = lastTenDaysData.map(({ valor }) => {
    return valor;
  });

  const datasets = [
    {
      label: "Precio últimos 10 días",
      backgroundColor: "#30CDEC",
      borderColor: "#30CDEC",
      data,
    },
  ];

  return { labels, datasets };
}

async function renderGrafica() {
  const option_selected = document.getElementById("select_coin").value;

  const data = await getAndCreateDataToChart(api_url, option_selected);
  console.log(data);
  const config = {
    type: "line",
    data,
  };

  const canvas = document.getElementById("chart");
  canvas.style.backgroundColor = "white";

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(canvas, config);
}

document.getElementById("search").addEventListener("click", async (event) => {
  const option_selected = document.getElementById("select_coin").value;

  const coinValue = await getCoinDetails(api_url, option_selected);

  const inputPesos = document.getElementById("montoPesos").value;

  const convertion = (inputPesos / coinValue).toFixed(2);

  const resultado = document.getElementById("resultado");

  resultado.innerHTML = convertion;

  renderGrafica();
});

renderCoinOptions(api_url);
