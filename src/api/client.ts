const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export { API_BASE_URL };
