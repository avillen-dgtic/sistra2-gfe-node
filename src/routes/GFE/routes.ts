/**
 * gfe
 * Copyright(c) 2021 Alejandro Villén
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import * as express from "express";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 0 });
// Database instance
import { Pool } from "pg";

const config = {
	user: process.env.POSTGRES_USER,
	host: process.env.POSTGRES_HOST,
	password: process.env.POSTGRES_PASS,
	database: process.env.POSTGRES_DATABASE,
};
const pool = new Pool(config);
const api = express.Router();

/**
 * Public routes
 */

/**
 * GFE - Gestors de formularis externs
 */
api.get("/resultado/:id", async function (req: express.Request, res) {
	const idSesion = req.params.id.split(":")[0];
	console.log(idSesion);
	const dataRecovered: any = cache.get(idSesion);
	console.log(dataRecovered);
	console.log(dataRecovered.xml);

	const xmlBase64 = Buffer.from(dataRecovered.xml, "utf-8").toString("base64");
	console.log(xmlBase64);
	const fs = require("fs").promises;
	const contents = await fs.readFile("./GFE.pdf", { encoding: "base64" });


	const result = {
		idSesionFormulario: idSesion,
		cancelado: false,
		xml: xmlBase64,
		pdf: contents
	};
	return res.send(result);
});

api.post("/resultado/:id", async function (req: express.Request, res) {
	const idSesion = req.params.id;
	console.log(idSesion);
	console.log(req.body.xml);

	cache.set(idSesion, Object.assign({}, { xml: req.body.xml }));

	const url = "https://dev.caib.es/sistramitfront/asistente/retornoGestorFormularioExterno.html?ticket=";
	return res.send({ url: `${url}${idSesion}:${new Date().getTime()}` });

});


api.get("/rellenar/:IdSesion", async function (req: express.Request, res) {
	const request: express.Request = req;
	console.log("Page GFE - Formulario GET");
	const idSesion = req.params.IdSesion;
	console.log(idSesion);

	return res.render("GFE/base", { sesion: idSesion });
});

api.post("/formulario", async function (req: express.Request, res) {
	const request: express.Request = req;
	console.log("Page GFE - Formulario POST");
	cache.set(req.body.idSesionFormulario, Object.assign({}, req.body));
	console.log(req.body.idSesionFormulario);
	// console.log(cache.get(req.body.idSesionFormulario));
	return res.status(200).send(`http://epreinf147:3000/gfe/rellenar/${req.body.idSesionFormulario}`);
});

export = api;
