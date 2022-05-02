const app = require("./dist/server").default;
const console = require("debug")("app:server");
const mri = require("mri");

const argv = process.argv.slice(2);

const params = mri(argv);
const port = params.port || params.p || 3000;

app.listen(port, () => {
	console(`Server is running on port ${port}`);
});
