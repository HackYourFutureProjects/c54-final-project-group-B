import { AuthProvider } from "./context/AuthContext.jsx";

/**
 * This component wraps our App with the providers we do not want to have in our tests
 */

const AppWrapper = ({ children }) => {
  return (
    <AuthProvider>
      <Router>{children}</Router>
    </AuthProvider>
  );
};

export default AppWrapper;
