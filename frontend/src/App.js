
import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import LoginPage from './html/components/loginPage';
import NewCustomersPage from './html/components/newCustomers';
import HomePage from './html/components/homePage';
import FormPage from './html/components/formPage';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AuthProvider  } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import ErrorPage from './html/components/errorPage';

class App extends Component
{
  render() 
  {
    return (
      <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={LoginPage} />
          <ProtectedRoute path="/home" component={HomePage} />
          <Route path="/form" component={FormPage} />
          <Route path="/new" component={NewCustomersPage} />
          <Route component={ErrorPage} />
        </Switch>
      </Router>
      </AuthProvider>
    );
  }
}

export default App;
