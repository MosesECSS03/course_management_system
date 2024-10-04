import React, { Component } from 'react';
import '../../css/loginPage.css';
import axios from 'axios';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: 'en',
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      showPassword: false, // State to toggle password visibility
    };
  }

  toggleLanguage = () => {
    this.setState((prevState) => {
      const newLanguage = prevState.language === 'en' ? 'zh' : 'en';

      // Re-validate email and password with the new language
      const emailError = this.validateEmail(prevState.email, newLanguage);
      const passwordError = this.validatePassword(prevState.password, newLanguage);

      return {
        language: newLanguage,
        emailError, // Set email error message in the new language
        passwordError, // Set password error message in the new language
      };
    });
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  validateEmail = (email) => {
    if (!email) {
      return this.state.language === 'en'
        ? 'Email cannot be empty.'
        : '电子邮件不能为空。';
    }
    return '';
  };

  validatePassword = (password) => {
    if (!password) {
      return this.state.language === 'en'
        ? 'Password cannot be empty.'
        : '密码不能为空。';
    }
    return '';
  };

  handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    const { email, password } = this.state;

    const emailError = this.validateEmail(email);
    const passwordError = this.validatePassword(password);

    if (emailError || passwordError) {
      this.setState({ emailError, passwordError });
      return;
    }

    // Clear error messages and handle login logic here
    this.setState({ emailError: '', passwordError: '' });

    // Replace with your API endpoint and payload
    var response = await axios.post('http://localhost:3001/login', {
      email,
      password
    });
    /*var response = await axios.post('https://moses-course-testing-dqghhsbcgseccyfa.japaneast-01.azurewebsites.net/login', {
        email,
        password
      });*/

      console.log(response);

      /*if (response.data.success) {
        // Handle successful login
        console.log('Login successful:', response.data);
        this.setState({ emailError: '', passwordError: '' });
        // Redirect or perform further actions
      } else {
        // Handle errors from the server
        this.setState({
          emailError: response.data.emailError || '',
          passwordError: response.data.passwordError || '',
        });
      }*/
  };

  render() {
    const { language, emailError, passwordError, showPassword } = this.state;
    const title = (
      <>
        En Community Services Society
        <br />
        Courses Management System
      </>
    );
    const loginText = 'Login';
    const copyrightText = (
      <>
        © 2024 En Community Service Society Courses Management System.
        <br />
        All rights reserved.
      </>
    );

    return (
      <div class="container">
        <div class="header">
          <div class="language-toggle">
            <button onClick={this.toggleLanguage}>
              {language === 'en' ? '中文' : 'English'}
            </button>
          </div>
        </div>
        <div class="login-main-content">
          <div class="left-section">
            <div class="title-and-image">
              <img
                src="https://ecss.org.sg/wp-content/uploads/2023/07/En_logo_Final_Large_RGB.png"
                alt="Logo"
                class="title-image"
              />
              <h1 class="title">{title}</h1>
            </div>
            <h2>{loginText}</h2>
            <form class="login-form" onSubmit={this.handleSubmit}>
              <label htmlFor="email">
                {language === 'en' ? 'Email:' : '电子邮件：'}
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={this.state.email}
                onChange={this.handleChange}
                placeholder={
                  language === 'en' ? 'Enter your email' : '请输入电子邮件...'
                }
              />
              {emailError && <small class="error-message">{emailError}</small>}

              <label htmlFor="password">
              {language === 'en' ? 'Password:' : '密码：'}
            </label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={this.state.password}
                onChange={this.handleChange}
                placeholder={language === 'en' ? 'Enter your password' : '请输入密码...'}
              />
              <i
                className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                onClick={this.togglePasswordVisibility}
              ></i>
            </div>
              {passwordError && <small class="error-message">{passwordError}</small>}

              <button type="submit">
                {language === 'en' ? 'Login' : '登录'}
              </button>
            </form>
            <p class="copyright">{copyrightText}</p>
          </div>
          <div class="right-section">
            <div class="right-section-content">
              <img
                src="https://ecss.org.sg/wp-content/uploads/2024/09/Untitled_design-removebg-preview.png"
                alt="Description"
                class="description-image"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
