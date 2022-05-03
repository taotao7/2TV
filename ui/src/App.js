import { useState, useEffect } from "react";
import { Layout } from "antd";
import axios from "axios";

const { Content, Footer } = Layout;

function App() {
	const [devices, setDevices] = useState([]);
	const [loading, setLoading] = useState(false);

	const getDevices = async () => {
		setLoading(true);
		const res = await axios.get("http://localhost:3000/getdevices");
		if (res.data.msg === "ok") {
			setDevices(res.data);
		}
	};

	// useEffect(() => {
	// 	getDevices();
	// 	setLoading(false);
	// }, []);

	return (
		<Layout style={{ height: "100vh" }}>
			<Content>内容</Content>
			<Footer>脚</Footer>
		</Layout>
	);
}

export default App;
