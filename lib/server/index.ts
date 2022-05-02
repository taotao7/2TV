import * as express from "express";
import Upnp from "../upnp";
import * as bodyParser from "body-parser";
import debug from "debug";

const console = debug("app:server");

const upnp = new Upnp();
const app = express();

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// get discovery devices
app.get("/getdevices", async (_, res) => {
	try {
		const devices: string[] = await upnp.getDevicesList();
		res.status(200);
		console("devices list: ", devices);
		if (devices.length != 0) {
			return res.send({ msg: "ok", data: devices });
		}
		return res.send({ msg: "error", data: "no devices" });
	} catch (err) {
		console(err);
		res.status(500);
		return res.send({ msg: "error", err: "service error" });
	}
});

// get device info
app.post("/parse", async (req, res) => {
	const { device } = req.body;
	try {
		const deviceDesc = await upnp.parseDeviceServer(device);
		console("parse:", deviceDesc);
		res.status(200);
		return res.send(deviceDesc);
	} catch (err) {
		console(err);
		res.status(500);
		return res.send({ msg: "error", err: "service error" });
	}
});

// play video
app.post("/play", async (req, res) => {
	const { device, url } = req.body;
	console(device);
	try {
		const result = await upnp.play(device, url);
		console("play:", result);
		res.status(200);
		return res.send(result);
	} catch (err) {
		console(err);
		res.status(500);
		return res.send({ msg: "error", err: "service error" });
	}
});

app.post("/currentmedia", async (req, res) => {
	const { device } = req.body;
	try {
		const result = await upnp.getPlayInfo(device);
		res.status(200);
		return res.send(result);
	} catch (err) {
		console(err);
		res.status(500);
		return res.send({ msg: "error", err: "service error" });
	}
});

export default app;
