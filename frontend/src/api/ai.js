// api/ai.js
import axios from "axios";

const ai = axios.create({
  baseURL: "https://ghaith-gtkr.onrender.com"
});

export default ai;