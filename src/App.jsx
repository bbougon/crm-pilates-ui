import React from "react";
import './App.css';
import loadable from '@loadable/component'
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {NavigationBar} from "./navigation/navigation-bar";
import SideBar from "./navigation/side-bar";

let Home = loadable(() => import('./component/home'));
let Clients = loadable(() => import('./component/clients/ClientPage'));
let Calendar = loadable(() => import('./component/calendar/Calendar'));

function App() {
  return (
    <div className="App">
        <Router>
            <NavigationBar />
            <SideBar />
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
