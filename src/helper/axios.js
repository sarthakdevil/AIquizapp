
import axios from "axios";

const BASE_URL="http://127.0.0.1:8000"

const axiosInstance = axios.create();

axiosInstance.defaults.baseURL = BASE_URL;
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;
