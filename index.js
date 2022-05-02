const app = require("./dist/server").default;
const console = require("debug")("app:server");

app.listen(3000, () => {
	console("Server is running on port 3000");
});
