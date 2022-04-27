import * as dgram from "dgram";

class Upnp {
	client: dgram.Socket;

	constructor() {
		this.client = dgram.createSocket("udp4");
	}
}

const instance = new Upnp();
