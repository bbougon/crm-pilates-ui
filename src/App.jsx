import React from "react";
import './App.css';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {NavigationBar} from "./navigation/navigation-bar";
import SideBar from "./navigation/side-bar";
import Home from "./component/home";
import {Clients} from "./component/clients/ClientPage";
import Calendar from "./component/calendar/Calendar";
import Login from "./component/login/Login";

function App() {
  return (
    <div className="App">
        <Router>
            <NavigationBar />
            <SideBar />
            <Routes>
                <Route path="/login" element={<Login/>} />
                <Route exact path="/" element={<Home />}/>
                <Route path="/clients" element={<Clients />}/>
                <Route path="/calendar" element={<Calendar />}/>
            </Routes>
        </Router>
    </div>
  );
}

export default App;
