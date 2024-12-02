import dotenv from "dotenv";
dotenv.config();

const config = {
  backendPort: 3000,
};

let ServerBase_Url;
let AdminPanelBase_Url;

const isProduction = process.env.IS_PRODUCTION;
if (isProduction == "true") {
  ServerBase_Url = "http://node.eventingclub.in";
} else {
  ServerBase_Url = `http://localhost:${config.backendPort}`;
}

export { config, ServerBase_Url, AdminPanelBase_Url, isProduction };
