const fs = require('fs');

const axios = require("axios");

class Busquedas {
  historial = [];
  dbPath= './db/database.json';

  constructor() {

    this.leerDB();
  }

  get historialCapitalizado(){


     return this.historial.map(lugar =>{
        let palabras = lugar.split(' ')
        palabras = palabras.map(p =>p[0].toUpperCase() + p.substring(1))

        return palabras.join(' ')
     })
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });
      const resp = await instance.get();

      //forma facil de haceerki sin axion pero no es legible y soportable
      //const resp = await axios.get("https://api.mapbox.com/geocoding/v5/mapbox.places/bogota.json?proximity=ip&access_token=pk.eyJ1IjoiYnJheWFuMDgiLCJhIjoiY2xrazM1N2d6MGI1MDNrbzgxeTI0djJiNCJ9.TBxNsQcN9-6y4BhnKx8xqg&limit=5&language=es");

      //({}) se regresa un arreglo de forma implicita
      return resp.data.features.map( lugar => ({
        id: lugar.id,
        nombre: lugar.place_name,
        //se trae la longitud de un arreglo escoginedo el primer lugar [0]
        lng: lugar.center[0],
        //se trae la latitud de un arreglo escoginedo el primer lugar [1]
        lat: lugar.center[1]
      }));

    } catch (error) {
      return [];
    }
  }

  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER,
      units: 'metric',
      lang: 'es'
    };
  }

  async climaLugar( lat, lon ){
    try {

        //instance axios.create()
        const instance = axios.create({
            baseURL: `https://api.openweathermap.org/data/2.5/weather`,
            //se desestructura los parametros
            params: {...this.paramsWeather, lat, lon}
        })
        const resp = await instance.get();
        const { weather, main } = resp.data;

        return {
            desc: weather[0].description,
            min: main.temp_min,
            max: main.temp_max,
            temp: main.temp
        }
        
    } catch (error) {
        console.log(error)
    }
  }

  agregarHistorial(lugar ='') {


    if( this.historial.includes(lugar.toLocaleLowerCase)){
        return;
    }
    //se obtine solo los primeros 5 
    this.historial = this.historial.splice(0,5)

    //evitar duplicados


    this.historial.unshift(lugar.toLocaleLowerCase());

    //grabar en un archivo
    this.guardarBD()

  }

  guardarBD () {
    const payload = {
        historial: this.historial
    }

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB(){
    if(!fs.existsSync(this.dbPath)) return null;

    const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
    const data = JSON.parse(info);

    this.historial = data.historial;
  }

}

module.exports = Busquedas;
