import React from "react";
import './App.css';
import {Home} from "./component/home";
import {Clients} from "./component/clients/ClientPage";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {NavigationBar} from "./navigation/navigation-bar";
import Sidebar from "./navigation/side-bar";
import Calendar from "./component/calendar/Calendar";

function App() {
  return (
    <div className="App">
        <Router>
            <NavigationBar />
            <Sidebar />
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route path="/clients" component={Clients}/>
                <Route path="/calendar" component={Calendar}/>
            </Switch>
        </Router>
    </div>
  );
}

export default App;
