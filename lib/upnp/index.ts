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

type options = {
	discoverTime: number;
};

class Upnp {
	client: dgram.Socket;
	devices: string[] = [];
	discoverTime: number;

	constructor(options: options = { discoverTime: 5000 }) {
		const opts: options = Object.assign({}, options);
		this.client = dgram.createSocket("udp4");
		this.discoverTime = opts.discoverTime;

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

	// Close the listener after some time to get the data obtained during the listening period
	public getDevicesList() {
		return new Promise<string[]>((resolve, _) => {
			setTimeout(() => {
				// this.client.close();
				resolve(uniq(this.devices));
			}, this.discoverTime);
		});
	}

	public async parseDeviceServer(device: string) {
		try {
			const { data } = await axios.get(device);
			const json: controlServerDevices = JSON.parse(parser.toJson(data));
			return { msg: "ok", data: json };
		} catch (e) {
			return { msg: "fail", err: e };
		}
	}

	public async play(targetUrl: string, mediaUrl: string) {
		const content = `<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
    <s:Body>
        <u:SetAVTransportURI>
            <InstanceID>0</InstanceID>
            <CurrentURI>${mediaUrl}</CurrentURI>
            <CurrentURIMetaData>&lt;DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:sec="http://www.sec.co.kr/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"&gt;&lt;item id="f-0" parentID="0" restricted="0"&gt;&lt;dc:title&gt;Video&lt;/dc:title&gt;&lt;dc:creator&gt;Anonymous&lt;/dc:creator&gt;&lt;upnp:class&gt;object.item.videoItem&lt;/upnp:class&gt;&lt;res protocolInfo="http-get:*:video/*:DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000" sec:URIType="public"&gt;%@&lt;/res&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</CurrentURIMetaData>
        </u:SetAVTransportURI>
    </s:Body>
</s:Envelope>`;

		try {
			const result = await axios.post(targetUrl, content, {
				headers: {
					"Content-Type": "text/xml;charset=*utf-8*",
					SOAPACTION:
						'"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
				},
			});
			if (result.status === 200) {
				return { msg: "ok" };
			} else {
				return { msg: "other", data: result };
			}
		} catch (e) {
			return { msg: "fail", err: e };
		}
	}

	public async getPlayInfo(targetUrl: string) {
		const content = `<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
    <s:Body>
        <u:GetMediaInfo>
            <InstanceID>0</InstanceID>
        </u:GetMediaInfo>
    </s:Body>
</s:Envelope>
`;
		try {
			const res = await axios.post(targetUrl, content, {
				headers: {
					"Content-Type": "text/xml;charset=*utf-8*",
					SOAPACTION:
						'"urn:schemas-upnp-org:service:AVTransport:1#GetMediaInfo"',
				},
			});
			return { msg: "ok", data: res };
		} catch {
			return { msg: "not have info" };
		}
	}
}

export default Upnp;

// instance
// 	.play(
// 		"http://192.168.31.200:49152/_urn:schemas-upnp-org:service:AVTransport_control",
// 		"http://192.168.31.169:8080/123.mp4"
// 	)
// 	.then((r) => console.log(r));

// instance
// 	.getPlayInfo(
// 		"http://192.168.31.200:49152/_urn:schemas-upnp-org:service:AVTransport_control"
// 	)
// 	.then((r) => console.log(r));
