import React, { Component } from 'react';
import axios from 'axios';
import '../../../css/sub/sideBar.css'; // Import a CSS file for styling

class SideBarContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accessRights: {}, // State to hold access rights
            openKey: null, // State to manage which main key is open
            accessRightsUpdated: false
        };
    }

    componentDidMount = async () => {
        const { accountId } = this.props;
        await this.getAccessRight(accountId);
    }

    // Helper function to compare access rights
    isEqual = (obj1, obj2) => {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) {
            return false; // Different number of keys
        }

        for (const key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false; // Values are different
            }
        }

        return true; // Objects are equal
    }

    componentDidUpdate(prevProps, prevState) {
        // Check if accountId has changed
        if (prevProps.accountId !== this.props.accountId) {
            this.getAccessRight(this.props.accountId);
        }
    
        // Only refresh when accessRights differ and it's the first call after accountId change
        if (!this.isEqual(prevState.accessRights, this.state.accessRights)) {
            // Avoid calling getAccessRight again if accessRights is already being updated
            if (!this.accessRightsUpdated) {
                this.accessRightsUpdated = true; // Set the flag to indicate we've called it
                this.getAccessRight(this.props.accountId);
            }
        } else {
            // Reset the flag if accountId hasn't changed
            this.accessRightsUpdated = false;
        }
    }
    getAccessRight = async (accountId) => {
        try {
            const response = await axios.post('http://localhost:3001/accessRights', {
                "purpose": "retrieveAccessRight",
                "accountId": accountId
            });
            console.log(response);

            // Store the access rights in state
            this.setState({ accessRights: response.data.result });
        } catch (error) {
            console.error("Error retrieving access rights:", error);
        }
    }

    toggleMainMenu = (mainItem) => {
        this.setState((prevState) => ({
            openKey: prevState.openKey === mainItem ? null : mainItem, // Toggle the active main key
        }));
    }

    handleSubKeyClick = (subKey) => {
        // Add any additional functionality you want to execute on sub-menu item click
       // console.log(`${subKey} clicked`); // Example of handling sub-key click
       console.log(subKey);
       if(subKey === "Create Account")
       {
         this.props.toggleAccountsComponent(subKey);
       }
       else if(subKey === "Account Table")
       {
            subKey = "Accounts";
            this.props.toggleAccountsComponent(subKey);
       }
       else if(subKey === "Access Rights Table")
       {
        subKey = "Access Rights";
        this.props.toggleAccountsComponent(subKey);
       } 
       else if(subKey === "NSA Courses")
       {
        subKey = "NSA";
        this.props.toggleCourseComponent(subKey);
       }
       else if(subKey === "ILP Courses")
       {
         subKey = "ILP";
         this.props.toggleCourseComponent(subKey);
       }
       else if(subKey === "Registration And Payment Table")
       {
        this.props.toggleRegistrationPaymentComponent(subKey);
       }
       else if(subKey === "Receipt Table")
       {
        this.props.toggleRegistrationPaymentComponent(subKey);
       }
    }

    closeSubMenu = () =>
    {
        this.setState({ openKey: null }); 
    }

    render() {
        const { accessRights, openKey } = this.state;

        // Map of icons for each main item
        const iconMap = {
            "Account": 'fa-solid fa-users',
            "Courses": "fa-solid fa-chalkboard-user",
            "Registration And Payment": 'fa-brands fa-wpforms',
            "QR Code": 'fa-solid fa-qrcode',
        };

        return (
            <div className="sidebar-content"  onMouseLeave={this.closeSubMenu}>
                <ul>
                    {Object.keys(accessRights).map((key) => {
                        const value = accessRights[key];

                        // Check if the value is exactly true or an object with true sub-keys
                        if (value === true) {
                            return (
                                <li key={key} onClick={() => this.toggleMainMenu(key)}>
                                    <i className={iconMap[key]} aria-hidden="true"></i> {/* Display the icon */}
                                    <span>{key}</span> {/* Display the main key */}
                                </li>
                            );
                        } else if (typeof value === 'object' && value !== null) {
                            // If value is an object, check its sub-keys
                            const subKeys = Object.keys(value).filter(subKey => value[subKey] === true);
                            if (subKeys.length > 0) {
                                return (
                                    <li key={key}>
                                        <div onClick={() => this.toggleMainMenu(key)}>
                                            <i className={iconMap[key]} aria-hidden="true"></i> {/* Display the icon */}
                                            {key} {/* Display the main key */}
                                        </div>
                                        {openKey === key && ( // Render sub-keys only if this main key is open
                                            <ul>
                                                {subKeys.map(subKey => (
                                                    <li key={subKey} onClick={() => this.handleSubKeyClick(subKey)}>
                                                        <span>{subKey}</span>{/* Display the sub-key */}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            }
                        }
                        return null; // Do not render anything if the value is not true
                    })}
                </ul>
            </div>
        );
    }
}

export default SideBarContent;