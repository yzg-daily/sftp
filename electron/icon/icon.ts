import path from "node:path";
// const isMacOS = process.platform === "darwin";
export const favicon = path.join(process.env.VITE_PUBLIC, 'favicon.ico');
export default favicon