require("dotenv").config();

const {
  inquirerMenu,
  pausa,
  leerInput,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
  console.clear();

  const busquedas = new Busquedas();

  let opt;
  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        //mostrar mensaje
        const termino = await leerInput("Ciudad: ");

        //buscar lugares
        const lugares = await busquedas.ciudad(termino);

        //seleccionar lugares
        const id = await listarLugares(lugares);

      if( id === '0' ) continue;


     
        const lugarSel = lugares.find((l) => l.id === id);

         //guardar en DB
         busquedas.agregarHistorial( lugarSel.nombre);
        
         //clima
        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);

        //mostra resultados
        console.clear();
        console.log("\nInformación de la ciudad\n".green);
        console.log("Ciudad:", lugarSel.nombre);
        console.log("Lat:", lugarSel.lat);
        console.log("Lng:", lugarSel.lng);
        console.log("Temperatura:", clima.temp);
        console.log("Mínima:", clima.max);
        console.log("Máxima:", clima.max);
        console.log("Como está el clima:", clima.desc.green);
        break;
      case 2:
            busquedas.historialCapitalizado.forEach((lugar, i) => {
              const idx = `${ i + 1}.`.green;
              console.log(`${idx} ${lugar}` )

            })
        break;
      case 0:
        break;
    }

    await pausa();
  } while (opt !== 0);
};

main();
