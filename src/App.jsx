import React from "react";
import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { NavigationBar } from "./navigation/navigation-bar";
import Home from "./component/home";
import { Clients } from "./component/clients/ClientPage";
import Calendar from "./component/calendar/Calendar";
import Login from "./component/login/Login";
import { AuthProvider } from "./context/AuthProvider";
import RequireAuth from "./component/auth/requireAuth";
import { SideBar } from "./navigation/side-bar";
import { SnackbarProvider } from "./context/SnackbarProvider";
import { RefreshSessionsProvider } from "./context/RefreshSessionsProvider";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <RefreshSessionsProvider>
            <SnackbarProvider>
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
            </SnackbarProvider>
          </RefreshSessionsProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
