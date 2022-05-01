import * as express from "express";
import Upnp from "../upnp";
import debug from "debug";

const console = debug("app:server");

const app = express();
const upnp = new Upnp();

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
		return res.send({ msg: "error", data: "service error" });
	}
});

app.post("/parse", (req, res) => {
	const { device } = req.body;
	console("parse:", device);
	res.send({ msg: "ok", data: "parse" });
});

// listen on 3000 port
app.listen(3000, () => {
	console("Listening on port 3000");
});
