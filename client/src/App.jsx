import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home/Home";
import CreateUser from "./pages/User/CreateUser";
import Login from "./pages/User/Login";
import UserList from "./pages/User/UserList";

const App = () => {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<UserList />} />
        <Route path="/signup" element={<CreateUser />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
