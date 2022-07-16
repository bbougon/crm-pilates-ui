import React from "react";
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {NavigationBar} from "./navigation/navigation-bar";
import SideBar from "./navigation/side-bar";
import {Home} from "./component/home";
import {Clients} from "./component/clients/ClientPage";
import Calendar from "./component/calendar/Calendar";

function App() {
  return (
    <div className="App">
        <Router>
            <NavigationBar />
            <SideBar />
            <Switch>
                <Route exact path="/" element={Home}/>
                <Route path="/clients" component={Clients}/>
                <Route path="/calendar" component={Calendar}/>
            </Switch>
        </Router>
    </div>
  );
}

export default App;
