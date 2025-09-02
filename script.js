// ==========================
// CONFIG
// ==========================

// API token will be set from the index input
let API_TOKEN = "";

// Base API endpoint
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

// Load token from storage if remembered
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
  if (!API_TOKEN) {
    console.error("No API token set!");
    return { error: "No API token set!" };
  }

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
    const data = await response.json();
    console.log(`[${method}] ${endpoint}`, data);
    return data;
  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
}

// ---------------------------
// MINING FUNCTIONS
// ---------------------------

async function findAsteroid() {
  return await callAPI("/systems/X1-XD16/waypoints?type=ENGINEERED_ASTEROID");
}

async function orbitShip(shipSymbol) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/orbit`, "POST");
}

async function navigateToAsteroid(shipSymbol, asteroidSymbol) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/navigate`, "POST", {
    waypointSymbol: asteroidSymbol,
  });
}

async function dockShip(shipSymbol) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/dock`, "POST");
}

async function refuelShip(shipSymbol) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/refuel`, "POST");
}

async function extractOres(shipSymbol) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/extract`, "POST");
}

async function checkCargo(shipSymbol) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/cargo`);
}

async function jettisonCargo(shipSymbol, cargoSymbol, units = 1) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/jettison`, "POST", {
    symbol: cargoSymbol,
    units,
  });
}

// ---------------------------
// MARKET FUNCTIONS
// ---------------------------

async function viewMarket(systemSymbol, waypointSymbol) {
  return await callAPI(`/systems/${systemSymbol}/waypoints/${waypointSymbol}/market`);
}

async function sellCargo(shipSymbol, goodSymbol, units) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/sell`, "POST", {
    symbol: goodSymbol,
    units,
  });
}

// ---------------------------
// CONTRACT FUNCTIONS
// ---------------------------

async function navigateToWaypoint(shipSymbol, waypointSymbol) {
  return await callAPI(`/my/ships/${encodeURIComponent(shipSymbol)}/navigate`, "POST", {
    waypointSymbol,
  });
}

async function deliverContractGoods(contractId, shipSymbol, goodSymbol, units) {
  return await callAPI(`/my/contracts/${encodeURIComponent(contractId)}/deliver`, "POST", {
    shipSymbol,
    tradeSymbol: goodSymbol,
    units,
  });
}

async function fulfillContract(contractId) {
  return await callAPI(`/my/contracts/${encodeURIComponent(contractId)}/fulfill`, "POST");
}

// ---------------------------
// DEMO FLOWS
// ---------------------------

async function miningQuickstart(shipSymbol) {
  console.log("🚀 Starting Mining Quickstart...");

  const asteroidData = await findAsteroid();
  const asteroidSymbol = asteroidData.data?.[0]?.symbol || null;
  console.log("🪨 Found asteroid:", asteroidSymbol);

  if (!asteroidSymbol) return;

  await orbitShip(shipSymbol);
  await navigateToAsteroid(shipSymbol, asteroidSymbol);
  await dockShip(shipSymbol);
  await refuelShip(shipSymbol);
  await orbitShip(shipSymbol);
  await extractOres(shipSymbol);
  const cargo = await checkCargo(shipSymbol);
  console.log("📦 Cargo:", cargo);

  console.log("✅ Mining cycle complete!");
}

async function contractDeliveryFlow(shipSymbol, contractId, deliveryWaypoint, goodSymbol, units) {
  console.log("📦 Starting Contract Delivery...");

  await navigateToWaypoint(shipSymbol, deliveryWaypoint);
  await deliverContractGoods(contractId, shipSymbol, goodSymbol, units);
  await fulfillContract(contractId);

  console.log("✅ Contract delivery complete!");
}
