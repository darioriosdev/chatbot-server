/**
 * express is node js freamwork using express you can create nodejs server
 * */
const express = require("express");
const path = require("path");
/**
 * this is node js dialogflow npm package using this we can get the request & response
 * */
const { WebhookClient } = require("dialogflow-fulfillment");
const {
  Text,
  Card,
  Image,
  Suggestion,
  Payload,
} = require("dialogflow-fulfillment");
const { List } = require("actions-on-google");
const basicCardUtils = require("./google/basicCardUtils");

const app = express();
/**
 * this is convert request body to JSON express.json()
 * */
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
global.charactersList = require("./characters.json");
global.images = "https://9e82-201-207-239-14.ngrok.io/images/";
/**
 *
 * this is create GET route for checking our node server is working or not
 * */
app.get("/", (req, res) => {
  res.send("Server Is Working......");
});

/**
 * on this route dialogflow send the webhook request
 * For the dialogflow we need POST Route.
 * */
app.post("/webhook", (req, res) => {
  // get agent from request
  let agent = new WebhookClient({ request: req, response: res });

  const intentName = req.body.queryResult.intent.displayName;
  console.log("Parameters", agent.parameters);
  console.log("Intent Name", intentName);
  console.log("Source", agent.requestSource);

  // create intentMap for handle intent
  let intentMap = new Map();

  // add intent map 2nd parameter pass function
  intentMap.set("Bienvenida", welcome);
  if (agent.requestSource == "TELEGRAM") {
    intentMap.set("Menu", menuTelegram);
  } else {
    intentMap.set("Menu", menuDefault);
  }

  intentMap.set("personajes", handleCharacters);
  intentMap.set("personajes - buscarPersonaje", getBasicCard);

  // now agent is handle request and pass intent map
  agent.handleRequest(intentMap);
});

/**
 *  handleWebHookIntent function call when webhook-demo intent call.....
 *  from then function we are send the response to dialogflow so we are use agent.add(string) function
 *  you can see more example here https://github.com/dialogflow/fulfillment-actions-library-nodejs
 * */
function welcome(agent) {
  agent.add("Hola te saludo desde el webhook...");
}

function handleCharacters(agent) {
  let arrCharacters = Object.keys(global.charactersList).slice();
  agent.add("Te puedo sugerir los siguientes personajes:");
  arrCharacters.forEach((suggestion) => {
    agent.add(new Suggestion(suggestion));
  });
  agent.add(new Suggestion("Menú"));
}

const getBasicCard = (agent) => {
  personaje = agent.parameters.person.name;
  console.log("personaje", personaje);
  if (global.charactersList[personaje]) {
    textoEnviar = global.charactersList[personaje];
    let imagen = encodeURI(global.images + personaje + ".jpg");
    console.log("imagen", imagen);
    let url = "https://www.google.com/search?q=" + personaje;
    agent.add(`Me encanta ${personaje}`);
    agent.add(
      basicCardUtils.addBasicCard(
        personaje,
        "",
        textoEnviar,
        imagen,
        personaje,
        personaje,
        url
      )
    );
  } else {
    // Si el presonaje recibido no está en la base de datos listaPersonajes
    agent.add(
      `Lo siento, todavía no he aprendido nada de ${personaje}. Seguiré estudiando.`
    );
  }
};

const menuDefault = (agent) => {
  agent.add("Estas son mis opciones:");
  agent.add(new Suggestion("Personajes"));
  agent.add(new Suggestion("Matrícula"));
  agent.add(new Suggestion("Salir"));
};

const menuTelegram = (agent) => {
  menu = require("./telegram/menu.json");
  agent.add(
    new Payload(agent.TELEGRAM, menu, {
      rawPayload: false,
      sendAsMessage: true,
    })
  );
};

/**
 * now listing the server on port number 3002 :)
 * use port 8080 for app engine
 * */
app.listen(3002, () => {
  console.log("Server is Running on port 3002");
});
