
import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './html/components/loginPage';
import HomePage from './html/components/homePage';
import FormPage from './html/components/formPage';
import '@fortawesome/fontawesome-free/css/all.min.css';

class App extends Component
{
  render() 
  {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/form" element={<FormPage />} />
        </Routes>
      </Router>
    );
  }
}

export default App;
