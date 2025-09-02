// ==========================
// CONFIG
// ==========================
let API_TOKEN = "";
const BASE_URL = "https://api.spacetraders.io/v2";

// ---------------------------
// TOKEN HANDLING
// ---------------------------
document.getElementById("tokenForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const tokenInput = document.getElementById("tokenInput").value.trim();
  const remember = document.getElementById("rememberToken").checked;

  if (tokenInput) {
    API_TOKEN = tokenInput;
    document.getElementById("auth").textContent = `Token set: ${API_TOKEN.slice(0, 10)}...`;
    if (remember) localStorage.setItem("spacetraders_token", API_TOKEN);
    else localStorage.removeItem("spacetraders_token");
  }
});

window.addEventListener("load", () => {
  const savedToken = localStorage.getItem("spacetraders_token");
  if (savedToken) {
    API_TOKEN = savedToken;
    document.getElementById("tokenInput").value = API_TOKEN;
    document.getElementById("rememberToken").checked = true;
    document.getElementById("auth").textContent = `Token loaded: ${API_TOKEN.slice(0, 10)}...`;
  }
});

// ---------------------------
// GENERIC API CALL
// ---------------------------
async function callAPI(endpoint, method = "GET", body = null) {
  if (!API_TOKEN) return { error: "No API token set!" };
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_TOKEN}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
}

// ---------------------------
// API FUNCTIONS
// ---------------------------
async function viewAgent() {
  const data = await callAPI("/my/agent");
  document.getElementById("agent").textContent = JSON.stringify(data, null, 2);
}

async function listShips() {
  const data = await callAPI("/my/ships");
  document.getElementById("ships").textContent = JSON.stringify(data, null, 2);
}

async function loadContracts() {
  const data = await callAPI("/my/contracts");
  document.getElementById("contracts").textContent = JSON.stringify(data, null, 2);
}

async function loadWaypoints(event) {
  event.preventDefault();
  const system = document.getElementById("systemInput").value;
  const data = await callAPI(`/systems/${system}/waypoints`);
  document.getElementById("waypoints").textContent = JSON.stringify(data, null, 2);
}

async function findShipyards(event) {
  event.preventDefault();
  const system = document.getElementById("shipyardSystemInput").value;
  const data = await callAPI(`/systems/${system}/shipyards`);
  document.getElementById("shipyards").textContent = JSON.stringify(data, null, 2);
}

async function loadShipyardDetail(event) {
  event.preventDefault();
  const system = document.getElementById("detailSystemInput").value;
  const waypoint = document.getElementById("detailWaypointInput").value;
  const data = await callAPI(`/systems/${system}/waypoints/${waypoint}/shipyard`);
  document.getElementById("shipyardDetail").textContent = JSON.stringify(data, null, 2);
}

async function checkCargoHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("cargoShipInput").value;
  const data = await callAPI(`/my/ships/${encodeURIComponent(ship)}/cargo`);
  document.getElementById("cargo").textContent = JSON.stringify(data, null, 2);
}

async function orbitShipHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("ctlShipOrbit").value;
  const data = await callAPI(`/my/ships/${encodeURIComponent(ship)}/orbit`, "POST");
  document.getElementById("shipControls").textContent = JSON.stringify(data, null, 2);
}

async function dockShipHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("ctlShipDock").value;
  const data = await callAPI(`/my/ships/${encodeURIComponent(ship)}/dock`, "POST");
  document.getElementById("shipControls").textContent = JSON.stringify(data, null, 2);
}

async function refuelShipHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("ctlShipRefuel").value;
  const data = await callAPI(`/my/ships/${encodeURIComponent(ship)}/refuel`, "POST");
  document.getElementById("shipControls").textContent = JSON.stringify(data, null, 2);
}

async function navigateShipHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("ctlShipNavSymbol").value;
  const waypoint = document.getElementById("ctlShipNavWaypoint").value;
  const data = await callAPI(`/my/ships/${encodeURIComponent(ship)}/navigate`, "POST", { waypointSymbol: waypoint });
  document.getElementById("shipControls").textContent = JSON.stringify(data, null, 2);
}

async function buyShipHandler(event) {
  event.preventDefault();
  const type = document.getElementById("buyShipType").value;
  const waypoint = document.getElementById("buyWaypoint").value;
  const data = await callAPI(`/my/shipyards/${waypoint}/purchase`, "POST", { type });
  document.getElementById("buyOutput").textContent = JSON.stringify(data, null, 2);
}

async function negotiateContractHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("negShipInput").value;
  const data = await callAPI(`/my/ships/${encodeURIComponent(ship)}/contracts/negotiate`, "POST");
  document.getElementById("negotiation").textContent = JSON.stringify(data, null, 2);
}

async function acceptContractHandler(event) {
  event.preventDefault();
  const contract = document.getElementById("contractIdInput").value;
  const data = await callAPI(`/my/contracts/${encodeURIComponent(contract)}/accept`, "POST");
  document.getElementById("contracts").textContent = JSON.stringify(data, null, 2);
}

async function miningQuickstartHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("miningShipInput").value;

  const asteroids = await callAPI("/systems/X1-XD16/waypoints?type=ENGINEERED_ASTEROID");
  const asteroid = asteroids.data?.[0]?.symbol;
  if (!asteroid) return alert("No asteroid found");

  await callAPI(`/my/ships/${encodeURIComponent(ship)}/orbit`, "POST");
  await callAPI(`/my/ships/${encodeURIComponent(ship)}/navigate`, "POST", { waypointSymbol: asteroid });
  await callAPI(`/my/ships/${encodeURIComponent(ship)}/dock`, "POST");
  await callAPI(`/my/ships/${encodeURIComponent(ship)}/refuel`, "POST");
  await callAPI(`/my/ships/${encodeURIComponent(ship)}/orbit`, "POST");
  const extracted = await callAPI(`/my/ships/${encodeURIComponent(ship)}/extract`, "POST");
  const cargo = await callAPI(`/my/ships/${encodeURIComponent(ship)}/cargo`);
  document.getElementById("miningOutput").textContent = JSON.stringify({ extracted, cargo }, null, 2);
}

async function contractDeliveryHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("deliveryShipInput").value;
  const contract = document.getElementById("deliveryContractInput").value;
  const waypoint = document.getElementById("deliveryWaypointInput").value;
  const good = document.getElementById("deliveryGoodInput").value;
  const units = Number(document.getElementById("deliveryUnitsInput").value);

  await callAPI(`/my/ships/${encodeURIComponent(ship)}/navigate`, "POST", { waypointSymbol: waypoint });
  await callAPI(`/my/contracts/${encodeURIComponent(contract)}/deliver`, "POST", { shipSymbol: ship, tradeSymbol: good, units });
  await callAPI(`/my/contracts/${encodeURIComponent(contract)}/fulfill`, "POST");
  document.getElementById("deliveryOutput").textContent = `Contract ${contract} delivered.`;
}

async function viewMarketHandler(event) {
  event.preventDefault();
  const system = document.getElementById("marketSystemInput").value;
  const waypoint = document.getElementById("marketWaypointInput").value;
  const data = await callAPI(`/systems/${system}/waypoints/${waypoint}/market`);
  document.getElementById("marketOutput").textContent = JSON.stringify(data, null, 2);
}

async function sellGoodsHandler(event) {
  event.preventDefault();
  const ship = document.getElementById("sellShipInput").value;
  const good = document.getElementById("sellGoodInput").value;
  const units = Number(document.getElementById("sellUnitsInput").value);
  const data = await callAPI(`/my/ships/${encodeURIComponent(ship)}/sell`, "POST", { symbol: good, units });
  document.getElementById("sellOutput").textContent = JSON.stringify(data, null, 2);
}
