import * as dgram from "dgram";

class Upnp {
	client: dgram.Socket;
	devices: string[] = [];

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
		}, 5000);
	}
}

const instance = new Upnp();
instance.start();
