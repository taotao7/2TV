const dgram = require("dgram");

const client = dgram.createSocket("udp4");

const header = {
  HOST: "239.255.255.250",
  ST: '"ssdp:all"',
  MAN: '"ssdp:discover"',
  MX: 3,
};
