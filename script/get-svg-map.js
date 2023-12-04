#!/usr/bin/env node

const https = require('https');
const querystring = require('querystring');

const mapshaper = require('mapshaper');
const osmtogeojson = require('osmtogeojson');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers')


function getUrl(url, callback){
  const options = {
    headers: {
      'User-Agent': 'User-Agent Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
    }
  }

  https.get(url, options, (res) => {
    let rawData = '';
  
    res.on('data', (chunk) => {
      rawData += chunk; 
    });
  
    res.on('end', () => {
      callback(rawData);
    });
  });
};

function parseJsonOrExit(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

function getLatLon(argv, callback) {
  if ( argv.lat && argv.lon ) {
    callback(parseFloat(argv.lat), parseFloat(argv.lon));
  } else {
    const baseURL = 'https://nominatim.openstreetmap.org/search';
    const queryParams = {
      q: argv.place,
      format: 'json',
      addressdetails: 0
    };
    const nominatimUrl = `${baseURL}?${querystring.stringify(queryParams)}`;
    getUrl(nominatimUrl, (nominatimJson) => {
      const json = parseJsonOrExit(nominatimJson);
      callback(parseFloat(json[0]["lat"]), parseFloat(json[0]["lon"]));
    });
  }
}

function getBoundsFromLatLon(lat, lon){
  const size_x = 0.01 / 2;
  const size_y = 0.006 / 2;

  const left = lon - size_x;
  const right = lon + size_x;
  const bottom = lat - size_y;
  const top = lat + size_y;

  return { left, bottom, right, top };
};

function slugify(string){
  return string.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '');
};


const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('p', {
    alias: 'place',
    demandOption: true,
    describe: 'Placename, used to find coordinates if --lat and --lon are omitted, and to name the output SVG',
    type: 'string'
  })
  .option('lat', {
    describe: 'Optional latitude to use instead of geocoding --place',
    type: 'number'
  })
  .option('lon', {
    describe: 'Optional longitude to use instead of geocoding --place',
    type: 'number'
  })
  .help('h')
  .alias('h', 'help')
  .example('$0 --place "68 Kempston Street, L3 8HL"')
  .example('$0 --place "Williamson Art Gallery, CH43 4UE" --lat "53.384872" --lon "-3.040170"')
  .argv;


getLatLon(argv, (lat, lon) => {
  const { left, bottom, right, top } = getBoundsFromLatLon(lat, lon);
  const osmUrl = `https://api.openstreetmap.org/api/0.6/map.json?bbox=${left},${bottom},${right},${top}`;
  console.log(osmUrl);

  getUrl(osmUrl, (osmJson) => {
    const osmData = parseJsonOrExit(osmJson);

    const files = {
      'map.geojson': osmtogeojson(osmData)
    };

    const commands = [
      '-i map.geojson',
      `-clip bbox=${left},${bottom},${right},${top}`,
      '-proj webmercator',
      '-style fill=none stroke=black stroke-width=1',
      `-o ${slugify(argv.place)}.svg`,
    ];

    mapshaper.runCommands(commands.join(" "), files);

    console.log(argv.place);
    console.log(lat.toFixed(5), lon.toFixed(5));
    console.log('->', `${slugify(argv.place)}.svg`)
  });
});
