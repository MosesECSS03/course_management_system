import React, { Component } from "react";
import '../../../css/popup/popup.css'; // Import CSS for popup styles
import axios from 'axios';

class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword: "",
      confirmPassword: "",
      newPasswordError: "",
      confirmPasswordError: "",
      formErrorMessage: "",
      showNewPassword: false, // For toggling new password visibility
      showConfirmPassword: false, // For toggling confirm password visibility
    };
  }

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


  render() {
    const { message, isOpen, onClose, type } = this.props;
    const {newPassword,
      confirmPassword,
      newPasswordError,
      confirmPasswordError,
      formErrorMessage,
      showNewPassword,
      showConfirmPassword,
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
          ) : (
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
