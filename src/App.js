import './App.css';
import {Home} from "./component/home";
import {Clients} from "./component/client/clients";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {NavigationBar} from "./navigation/navigation-bar";
import Sidebar from "./navigation/side-bar";

function App() {
  return (
    <div className="App">
        <Router>
            <NavigationBar />
            <Sidebar />
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route path="/clients" component={Clients}/>
            </Switch>
        </Router>
    </div>
  );
}

export default App;
