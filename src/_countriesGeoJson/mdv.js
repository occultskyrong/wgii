const fs = require('fs');
const path = require('path');

const CountryCode3 = 'MDV';

const dirpath = path.join(__dirname, '../../dist/MDV');
const resourceFilepath = path.join(dirpath, 'country.resource.geo.json');
const targetFilepath = path.join(dirpath, 'country.wgs84.geo.json');

const resource = require(resourceFilepath);
const { features } = resource;

const coordinatesArray = features.map((feature) => {
  const { geometry: { coordinates } } = feature;
  return coordinates;
});

const geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    id: CountryCode3,
    geometry: { type: 'MultiPolygon', coordinates: coordinatesArray },
    properties: { name: 'Maldives', code: CountryCode3, coordinatesSystem: 'WGS84' },
  }],
};

fs.writeFileSync(targetFilepath, JSON.stringify(geojson));
