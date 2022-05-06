"use strict";
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const upnp_1 = require("../upnp");
const bodyParser = require("body-parser");
const debug_1 = require("debug");
const fs = require("fs");
const path = require("path");
const console = (0, debug_1.default)("app:server");
const upnp = new upnp_1.default();
const app = express();
// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "../../public")));
app.use(cors());
// get discovery devices
app.get("/getdevices", (_, res) =>
	__awaiter(void 0, void 0, void 0, function* () {
		try {
			const devices = yield upnp.getDevicesList();
			console("devices list: ", devices);
			if (devices.length != 0) {
				return res.status(200).send({ msg: "ok", data: devices });
			}
			return res.send({ msg: "error", data: "no devices" });
		} catch (err) {
			console(err);
			return res.status(500).send({ msg: "error", err: "service error" });
		}
	})
);
// get device info
app.post("/parse", (req, res) =>
	__awaiter(void 0, void 0, void 0, function* () {
		const { device } = req.body;
		try {
			const deviceDesc = yield upnp.parseDeviceServer(device);
			console("parse:", deviceDesc);
			return res.status(200).send(deviceDesc);
		} catch (err) {
			console(err);
			return res.status(500).send({ msg: "error", err: "service error" });
		}
	})
);
// play video
app.post("/play", (req, res) =>
	__awaiter(void 0, void 0, void 0, function* () {
		const { device, url } = req.body;
		console(device);
		try {
			const result = yield upnp.play(device, url);
			console("play:", result);
			return res.status(200).send(result);
		} catch (err) {
			console(err);
			return res.status(500).send({ msg: "error", err: "service error" });
		}
	})
);
app.post("/currentmedia", (req, res) =>
	__awaiter(void 0, void 0, void 0, function* () {
		const { device } = req.body;
		try {
			const result = yield upnp.getPlayInfo(device);
			return res.status(200).send(result);
		} catch (err) {
			console(err);
			return res.status(500).send({ msg: "error", err: "service error" });
		}
	})
);
// check file exist
app.post("/checkfile", (req, res) =>
	__awaiter(void 0, void 0, void 0, function* () {
		const { path } = req.body;
		fs.stat(path, (err, _) => {
			if (!err) {
				return res.status(200).send({ msg: "ok" });
			}
			return res.status(403).send({ msg: "error", err: "file not found" });
		});
	})
);
// local file
app.get("/localmedia", (req, res) => {
	const { path } = req.query;
	if (typeof path === "string") {
		return res.status(200).sendFile(path);
	}
	return res.status(403).send({ msg: "error", err: "file not found" });
});
exports.default = app;
