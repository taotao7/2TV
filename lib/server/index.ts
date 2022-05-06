import * as express from "express";
import * as cors from "cors";
import Upnp from "../upnp";
import * as bodyParser from "body-parser";
import debug from "debug";
import * as fs from "fs";
import * as path from "path";

const console = debug("app:server");

const upnp = new Upnp();
const app = express();

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "../../public")));
app.use(cors());

// get discovery devices
app.get("/getdevices", async (_, res) => {
	try {
		const devices: string[] = await upnp.getDevicesList();
		console("devices list: ", devices);
		if (devices.length != 0) {
			return res.status(200).send({ msg: "ok", data: devices });
		}
		return res.send({ msg: "error", data: "no devices" });
	} catch (err) {
		console(err);
		return res.status(500).send({ msg: "error", err: "service error" });
	}
});

// get device info
app.post("/parse", async (req, res) => {
	const { device } = req.body;
	try {
		const deviceDesc = await upnp.parseDeviceServer(device);
		console("parse:", deviceDesc);
		return res.status(200).send(deviceDesc);
	} catch (err) {
		console(err);
		return res.status(500).send({ msg: "error", err: "service error" });
	}
});

// play video
app.post("/play", async (req, res) => {
	const { device, url } = req.body;
	console(device);
	try {
		const result = await upnp.play(device, url);
		console("play:", result);
		return res.status(200).send(result);
	} catch (err) {
		console(err);
		return res.status(500).send({ msg: "error", err: "service error" });
	}
});

app.post("/currentmedia", async (req, res) => {
	const { device } = req.body;
	try {
		const result = await upnp.getPlayInfo(device);
		return res.status(200).send(result);
	} catch (err) {
		console(err);
		return res.status(500).send({ msg: "error", err: "service error" });
	}
});

// check file exist
app.post("/checkfile", async (req, res) => {
	const { path } = req.body;
	fs.stat(path, (err, _) => {
		if (!err) {
			return res.status(200).send({ msg: "ok" });
		}
		return res.status(403).send({ msg: "error", err: "file not found" });
	});
});

// local file
app.get("/localmedia", (req, res) => {
	const { path } = req.query;
	if (typeof path === "string") {
		return res.status(200).sendFile(path);
	}
	return res.status(403).send({ msg: "error", err: "file not found" });
});

export default app;
