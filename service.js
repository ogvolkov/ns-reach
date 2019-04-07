
const BASE_API_URL = "https://ns-reach-api.azurewebsites.net/api";

function getStations() {
  return fetch(`${BASE_API_URL}/Stations`)
    .then(response => response.json());
}

function getTimes(from) {
  return fetch(`${BASE_API_URL}/Reach?from=${from}`)
    .then(response => response.json());
}