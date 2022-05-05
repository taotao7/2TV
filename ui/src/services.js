import axios from "axios";

const prefix = "http://localhost:3000";

export function getDevices() {
	return axios.get(`${prefix}/getdevices`);
}

export function play(params) {
	return axios.post(`${prefix}/play`, { body: params });
}

export function getmedia() {
	return axios.get(`${prefix}/currentmedia`);
}
