import * as dgram from "dgram";
import axios from "axios";
import * as parser from "xml2json";
import { uniq } from "lodash";

type controlServerDevices = {
	root?: {
		xmlns?: string;
		specVersion?: { marjor?: number; minor?: number };
		device?: {
			deviceType?: string;
			presentationURL?: string;
			friendlyName?: string;
			UDN?: string;
			serviceList?: [];
			manufacturer?: string;
			manufacturerURL?: string;
			modelDescription?: string;
			modelName?: string;
			modelURL?: string;
		};
		URLBase?: string;
	};
};

class Upnp {
	client: dgram.Socket;
	devices: string[] = [];
	controlServerDevicesList: controlServerDevices[] = [];

	constructor() {
		this.client = dgram.createSocket("udp4");
	}

	private discover() {
		this.client.bind(1900, () => {
			this.client.addMembership("239.255.255.250");
		});

		this.client.on("message", (msg, _) => {
			const data = msg.toString();
			if (data.includes("LOCATION")) {
				const device = data.match(/LOCATION: (.*)\r\n/);
				if (device) {
					this.devices.push(device[1]);
				}
			}
		});
	}

	public start() {
		this.discover();
		setTimeout(() => {
			this.client.close();
			this.devices = uniq(this.devices);
			this.request();
		}, 5000);
	}

	// TODO queue request devices description xml
	private request() {
		this.devices.forEach(async (device) => {
			const { data } = await axios.get(device);
			const json: controlServerDevices = JSON.parse(parser.toJson(data));
			this.controlServerDevicesList.push(json);
		});
	}
}

const instance = new Upnp();
instance.start();
