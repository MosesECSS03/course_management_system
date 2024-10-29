import React, { Component } from "react";
import '../../../css/popup/popup.css'; // Import CSS for popup styles
import axios from 'axios';

class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword: "",
      newPassword1: "",
      confirmPassword: "",
      newPasswordError: "",
      confirmPasswordError: "",
      formErrorMessage: "",
      showNewPassword: false, // For toggling new password visibility
      showConfirmPassword: false, // For toggling confirm password visibility
      username: "",
      message: '',
      error: '',
      password: '',
      countdown: 10
    };
    this.countdownInterval = null;
  }

  componentDidMount() {
    // Check the type prop to decide whether to start the countdown
    if (this.props.type === "no-activity") {
      console.log("Start CountDown");
      this.startCountdown();
    }
  }

  componentDidUpdate(prevProps) {
    // Check if the type prop has changed from the previous value
    if (this.props.type !== prevProps.type) {
      console.log("Type prop changed. Current type:", this.props.type);
      // If the new type is "no-activity", restart the countdown
      if (this.props.type === "no-activity") {
        console.log("Restart CountDown");
        this.startCountdown();
      } else {
        clearInterval(this.countdownInterval);
        this.setState({ countdown: 10 });
        // If the type changed to something else, clear the countdown
      }
    }
  }

 componentWillUnmount() {
    clearInterval(this.countdownInterval);
    this.setState({ countdown: 10 });
  }

  startCountdown = () => {
    this.countdownInterval = setInterval(() => {
      this.setState(prevState => {
        if (prevState.countdown <= 1) {
          //console.log(prevState.countdown);
         clearInterval(this.countdownInterval);
          this.props.goBackLoginPage();
            return { countdown: 10 };
        }
        console.log(prevState.countdown);
        return { countdown: prevState.countdown - 1 };
      });
    }, 1000);
  };



  validatePassword = (password) => {
    // Password validation regex: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle form submission for changing password
  changePassword = async (event) => {
    event.preventDefault();
    const { newPassword, confirmPassword } = this.state;
    const {accountId} = this.props;

    let valid = true;

    // Validate new password
    if (!this.validatePassword(newPassword)) {
      this.setState({
        newPasswordError:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
      valid = false;
    }

    // Validate confirm password
    if (confirmPassword === "") {
      this.setState({ confirmPasswordError: "Confirm Password cannot be empty" });
      valid = false;
    } else if (newPassword !== confirmPassword) {
      this.setState({ confirmPasswordError: "Passwords do not match" });
      valid = false;
    }

    if (!valid) {
      return;
    }
    else if(valid)
    {
      var response = await axios.post(`http://localhost:3001/login`, {"purpose": "changePassword", "accountId": accountId, "newPassword": newPassword});
      if(response.data.success === true)
      {
        this.props.passPopupMessage(response.data.success, response.data.message);
      }
      else
      {
        this.props.passPopupMessage(response.data.success, response.data.message);
      }
    }
  };

  handlePasswordChange = (event) => {
    const { value } = event.target;
    this.setState({ newPassword: value });

    // Validate password as the user types
    if (!this.validatePassword(value)) {
      this.setState({
        newPasswordError:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    } else {
      this.setState({ newPasswordError: "" });
    }
  };

  clickPasswordChange = () => {
    this.setState({ newPasswordError: "" });
  };

  clickConfirmPasswordChange = () => {
    this.setState({ confirmPasswordError: "" });
  };

  handleConfirmPasswordChange = (event) => {
    const { value } = event.target;
    this.setState({ confirmPassword: value });

    // Clear error if passwords match
    if (value === this.state.newPassword) {
      this.setState({ confirmPasswordError: "" });
    }
  };

  // Toggle new password visibility
  toggleNewPasswordVisibility = () => {
    this.setState((prevState) => ({
      showNewPassword: !prevState.showNewPassword,
    }));
  };

  // Toggle confirm password visibility
  toggleConfirmPasswordVisibility = () => {
    this.setState((prevState) => ({
      showConfirmPassword: !prevState.showConfirmPassword,
    }));
  };

  cancel = async() =>
  {
    this.props.closePopup();
  }

  cancel1 = async() =>
  {
    this.props.closePopup();
    this.setState({ countdown: 10 });
  }

  goBackHome = async() =>
  {
    this.props.goBackLoginPage();
  }

  enterUsername = (e) => {
    const { name, value } = e.target;
    console.log(name, value); // Logs the id and value for debugging
    this.setState({ [name]: value });
  };

  handleSendPassword = async (e) => 
  {
    console.log("Handle Password");
    e.preventDefault();
    const { username, newPassword1 } = this.state;
    let valid = true;

    if (!username) {
      this.setState({ error: 'Please enter your username.' });
      valid = false;
    }
    if (!newPassword1) {
      this.setState({
        newPasswordError1:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
      valid = false;
    }
    if (!this.validatePassword(newPassword1)) {
      this.setState({
        newPasswordError1:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
      valid = false;
    }
  
    if(valid === true)
    {
      var response = await axios.post(`http://localhost:3001/login`, {"purpose": "resetPassword",  "username": username, "password": newPassword1});
      console.log(response)
      if(response.data.success === true)
      {
        //console.log("Change Password Successfully");
        this.props.passPopupMessage(response.data.success, "Reset Password Successfully");
      }
      else
      {
        //console.log("Change Password Error");
        this.props.passPopupMessage(response.data.success, "Reset Password Failure");
      }
    }

   /* // For demonstration, we'll just set a success message
    this.setState({
      message: 'Instructions have been sent to your email.',
      error: '',
    });*/
  };

  manageAccountInfo(action)
  {
    if(action === "Delete")
    {
      console.log("Delete Account");
    }
  }

  

  render() {
    const { message, isOpen, onClose, type } = this.props;
    const {newPassword,
      newPassword1,
      confirmPassword,
      newPasswordError,
      newPasswordError1,
      confirmPasswordError,
      formErrorMessage,
      showNewPassword,
      showConfirmPassword,
      username,
      message1,
      error,
      countdown
    } = this.state;

    if (!isOpen) return null;

    const popupTypeClass = `popup-content ${type}`; // Apply different class based on the type

    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className={popupTypeClass} onClick={(e) => e.stopPropagation()}>
          {type === "loading" ? (
            // Layout for loading type
            <div className="loading-popup">
              <h2>{message}</h2>
              <div className="bouncing-circles">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
              </div>
            </div>
          ) : type === "success-message" ? (
            // Layout for success type
            <div className="success-message">
              <img src="https://ecss.org.sg/wp-content/uploads/2024/10/iqbf2fomkl6f65us70kdcann90.png"></img>
              <h2 className="success-title">Success!</h2>
              <p>{message}</p>
            </div>
          ) : type === "error-message" ? (
            // Layout for error type
            <div className="error-message">
            <img src="https://ecss.org.sg/wp-content/uploads/2024/10/error-10376-2.png"></img>
            <h2 className="error-title">Error!</h2>
            <p>{message}</p>
          </div>
          ): type === "change-password" ? (
            // Layout for error type
            <div className="change-password-message">
              <form onSubmit={this.changePassword}>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new-password"
                      name="newPassword"
                      value={newPassword}
                      onChange={this.handlePasswordChange}
                      onClick={this.clickPasswordChange}
                    />
                    <i
                      className={`fa ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                      onClick={this.toggleNewPasswordVisibility}
                    ></i>
                  </div>
                  {newPasswordError && <p className="error-message1">{newPasswordError}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={this.handleConfirmPasswordChange}
                      onClick={this.clickConfirmPasswordChange}
                    />
                    <i
                      className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                      onClick={this.toggleConfirmPasswordVisibility}
                    ></i>
                  </div>
                  {confirmPasswordError && <p className="error-message1">{confirmPasswordError}</p>}
                </div>
                {formErrorMessage && <p className="error-message1">{formErrorMessage}</p>}
                <button type="submit" className="submit-btn">Change Password</button>
              </form>
        </div>
          ):  type === "forgot-password" ? (
            // Layout for success type
            <div className="forgot-password-message">
            <h2 style={{color:"#000000"}}>Forgot Password</h2>
            <form onSubmit={this.handleSendPassword} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={this.enterUsername}
                />
              </div>
              {error && <div className="error-message2">{error}</div>}
              <div className="form-group">
              <label htmlFor="password1">Password:</label>
              <div className="password-input-container">
              <input
                      type={showNewPassword ? "text" : "password"}
                      id="new-password1"
                      name="newPassword1"
                      value={newPassword1}
                      onChange={this.enterUsername}
                    />
                    <i
                      className={`fa ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                      onClick={this.toggleNewPasswordVisibility}
                    ></i>
                  </div>
                  {newPasswordError1 && <p className="error-message2">{newPasswordError1}</p>}
              </div>
              {message1 && <div className="success-message">{message1}</div>}
              <br/>
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>
          ):  type === "logout" ? (
            // Layout for success type
            <div className="logout-message">
              <h2 className="logout-title">Logout</h2>
              <p>{message}</p>
              <div className="button-container1">
                <button onClick={this.cancel}>No</button>
                <button onClick={this.goBackHome}>Yes</button>
              </div>
            </div>
          ):  type === "no-activity" ? (
           
            // Layout for success type
            <div className="no-activity-message">
              <h2 className="no-activity-title">No Activity</h2>
              <p>You have been inactive for a while</p>
              <h3>Returning to Login Page: {`00:${countdown.toString().padStart(2, '0')}`}</h3>
              <div className="button-container1">
                <button onClick={this.cancel1}>Cancel</button>
              </div>
            </div>
          ): type === "edit-account" ?(
          // Layout for success type
            <div className="edit-account-message">
               <button className="close-button12" onClick={this.cancel}>&times;</button>
               <h2 className="edit-account-title">Account</h2>
              <p>Click on the button below:</p>
              <div className="button-container2">
                <button  onClick={() => this.manageAccountInfo("Edit")}>Edit Account Info</button>
                <button onClick={() => this.manageAccountInfo("Delete")}>Delete Account</button>              
              </div>
            </div>
          ):(
            // Default layout for other types (like "message")
            <>  
            </>
          )}
        </div>
      </div>
    );
  }
}

export default Popup;
