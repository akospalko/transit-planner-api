// TODO Revise required origins
const allowedOrigins: string[] = [
  "http://localhost:8081", // Web (browser)
  "http://192.168.1.76:8081", // Mobile (development IP address)
  "exp://192.168.1.76:8081", // Mobile URL
  "http://localhost:8081", // Localhost (web browser testing)
  "http://localhost:3000",
  "http://192.168.1.76:3000", // Backend API
];

export default allowedOrigins;
