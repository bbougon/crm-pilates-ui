import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { NavigationBar } from "./navigation/navigation-bar";
import Home from "./component/home";
import { Clients } from "./component/clients/ClientPage";
import Calendar from "./component/calendar/Calendar";
import Login from "./component/login/Login";
import { AuthProvider } from "./context/AuthProvider";
import RequireAuth from "./component/auth/requireAuth";
import { SideBar } from "./navigation/side-bar";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <NavigationBar />
          <SideBar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route exact path="/" element={<Home />} />
              <Route path="/clients" key="clients" element={<Clients />} />
              <Route path="/calendar" element={<Calendar />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
