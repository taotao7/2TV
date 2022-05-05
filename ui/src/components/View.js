import { useEffect, useState } from "react";
import axios from "axios";

export default () => {
	const [data, setData] = useState([]);
	useEffect(() => {
		axios.get("https").then((res) => {
			setData(res.data);
		});
	}, []);

	return <></>;
};
