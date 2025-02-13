
import axios from "axios";

const BASE_URL="https://a-iquizapp.vercel.app/api"

const axiosInstance = axios.create();

axiosInstance.defaults.baseURL = BASE_URL;
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;
