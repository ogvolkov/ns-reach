const normalStationColor = "black";
const currentStationColor = "lime";

class NsMap {
  constructor(rootElement, stations) {
    this.rootElement = rootElement;
    this.stations = stations;

    this.map = null;
    this.codeToStation = new Map();
    this.currentStationMarker = null;
    this.currentDistanceMap = [];

    this.stations.forEach(station => this.codeToStation.set(station.code, station));
  }
  
  render() {
    this.map = new google.maps.Map(this.rootElement, {
      zoom: 10,
      center: { lat: 52.0888900756836, lng: 5.11027765274048 }
    });

    this.stations.forEach(station => this.renderStation(station));
  }

  renderStation(station) {
    const circle = this.drawCircle(station, 500, normalStationColor, 1);

    circle.addListener("click", () => this.setCurrentStation(station));
    this.addTooltip(circle, station.name);
  }

  setCurrentStation(station) {
    if (this.currentStationMarker) {
      this.currentStationMarker.setMap(null);
    }

    this.currentStationMarker = this.drawCircle(station, 800, currentStationColor, 1);

    getTimes(station.code)
      .then(filteredDistances => this.updateDistanceMap(station, filteredDistances));
  }

  
  updateDistanceMap(station, filteredDistances) {
    this.currentDistanceMap.forEach(circle => circle.setMap(null));
    this.currentDistanceMap = [];

    filteredDistances.forEach(row => {
        const time = row.time / 60;

        const destination = this.codeToStation.get(row.code);

        const color = timeToColor(time);

        const circle = this.drawCircle(destination, 2000, color, 0.3);
        this.currentDistanceMap.push(circle);

        circle.addListener("click", () => this.setCurrentStation(destination));
        const humanReadableTime = this.formatTime(row.time);
        const title = `${destination.name} - ${humanReadableTime} from ${station.name}`;
        this.addTooltip(circle, title);
    });
  }

  formatTime(time) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    let paddedMinutes = minutes.toString();
    if (minutes < 10) {
      paddedMinutes = "0" + paddedMinutes;
    }
    return `${hours}:${paddedMinutes}`;
  }

  drawCircle(station, radius, color, opacity) {
    const point =  { lat: station.latitude, lng: station.longitude };

    return new google.maps.Circle({
      center: point,
      map: this.map,
      radius: radius,
      strokeColor: color,
      strokeOpacity: opacity,
      fillColor: color,
      fillOpacity: opacity
    });
  }

  addTooltip(shape, title) {
    shape.addListener("mouseover", () => this.map.getDiv().setAttribute("title", title));
    shape.addListener("mouseout", () => this.map.getDiv().removeAttribute("title"));
  }
}

function timeToColor(time) {
  const startColor = [0, 255, 0];
  const endColor = [255, 0, 0];

  let colorString = "#";
  for (let i = 0; i < 3; i++) {
    const colorFragment = interpolate(time, startColor[i], endColor[i]);
    let colorFragmentString = Math.round(colorFragment).toString(16);
    if (colorFragmentString.length < 2) {
      colorFragmentString = "0" + colorFragmentString;
    }
    colorString += colorFragmentString;
  }

  return colorString;
}

function interpolate(value, start, end) {
  const a = 1 / (1 + 1.5 * value * value);
  return  a * start + (1-a) * end;
}