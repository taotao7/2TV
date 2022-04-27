import * as dgram from "dgram";

class Upnp {
	client: dgram.Socket;
	constructor() {
		this.client = dgram.createSocket("udp4");
	}

	public test() {
		console.log("test");
	}
}

const instance = new Upnp();
instance.test;
