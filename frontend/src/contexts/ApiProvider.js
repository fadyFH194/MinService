import React, { createContext, useContext } from "react";
import ApiClient from "../Hooks/ApiClient";

const ApiContext = createContext();

export default function ApiProvider({ children }) {
  const api = new ApiClient();

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApi() {
  return useContext(ApiContext);
}
