import React, { createContext, useContext } from "react";
import ServiceApiClient from "../Hooks/ApiClient";

const ApiContext = createContext();

export default function ApiProvider({ children }) {
  const api = new ServiceApiClient();

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApi() {
  return useContext(ApiContext);
}
