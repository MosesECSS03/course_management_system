  import React, { Component } from 'react';
  import { withRouter } from 'react-router-dom';
  import '../../css/homePage.css'; // Ensure your CSS paths are correct
  import AccountsSection from './sub/accountsSection';
  import CoursesSection from './sub/courseSection';
  import RegistrationPaymentSection from './sub/registrationPaymentSection';
  import Popup from './popup/popupMessage';
  import Search from './sub/searchSection';
  import ViewToggle from './sub/viewToggleSection';
  import Pagination from './sub/paginationSection';
  import CreateAccountsSection from './sub/createAccountsSection';
  import SideBarContent from './sub/sideBarContent';

  class HomePage extends Component {
    constructor(props) {
      super(props);
      this.state = {
        submenuVisible: null,
        language: 'en',
        courseType: null,
        isPopupOpen: false,
        popupMessage: '',
        popupType: '',
        sidebarVisible: false,
        locations: [],
        languages: [],
        types: [],
        selectedCourseLanguage: '',
        selectedCourseLocation: '',
        selectedCourseType: '',
        courseSearchQuery: '',
        selectedRegPaymentLanguage: '',
        selectedRegPaymentLocation: '',
        regPaymentSearchQuery: '',
        resetSearch: false,
        currentPage: 1,
        entriesPerPage: 10,
        totalPages: 1,
        nofCourses: 0,
        noofDetails: 0,
        nofAccounts: 0,
        viewMode: 'full',
        isRegistrationPaymentVisible: false,
        section: '',
        accountType: null,
        roles: [],
        createAccount: false,
        displayedName: "",
        isDropdownOpen: false
      };

      this.handleDataFromChild = this.handleDataFromChild.bind(this);
      this.searchResultFromChild = this.searchResultFromChild.bind(this);
      this.handleSelectFromChild = this.handleSelectFromChild.bind(this);
      this.handleRegPaymentSelectFromChild = this.handleRegPaymentSelectFromChild.bind(this);
      this.handleRegPaymentSearchFromChild = this.handleRegPaymentSearchFromChild.bind(this);
      this.handlePageChange = this.handlePageChange.bind(this);
      this.toggleViewMode = this.toggleViewMode.bind(this); 
      this.toggleRegistrationPaymentComponent = this.toggleRegistrationPaymentComponent.bind(this);
      this.createAccountPopupMessage = this.createAccountPopupMessage.bind(this);
      //this.getTotalNumberofDetails = this.getTotalNumberofDetails.bind(this);
    }

    // Function to handle data passed from the child
    handleDataFromChild = async (filter1, filter2) =>
    {
      var {section} = this.state;
      console.log("Current Sections:", section);  
      if(section === "courses")
      {
      const filterLanguages = new Set(filter1);
      const filterLocations = new Set(filter2);

      this.setState({
        locations: Array.from(filterLanguages),
        languages: Array.from(filterLocations)
      });
     }
     else if(section === "registration")
     {
      const filterLocations = new Set(filter1);
      const filterType = new Set(filter2);
      this.setState({
        locations: Array.from(filterLocations),
        types: Array.from(filterType)
      });
     }
     else if(section === "accounts")
     {
      var filterRoles = new Set(filter1);
      this.setState({
        roles: Array.from(filterRoles)
      });
     }
  }

    handleSelectFromChild = async (updateState, dropdown) => {
      console.log("Selected Data:", updateState, dropdown);
      var {section} = this.state;
      if(section === "courses")
      {
        if (dropdown === "showLanguageDropdown") {
          this.setState({
            selectedLanguage: updateState.language
          });
        }
        else if (dropdown === "showLocationDropdown") {
          this.setState({
            selectedLocation: updateState.centreLocation
          });
        }
        else if(dropdown === "showTypeDropdown")
        {
          this.setState({
            selectedLocation: updateState.centreLocation
          });
        }
      }
      else if(section === "accounts")
      {
        if(dropdown === "showAccountTypeDropdown")
        {
              this.setState({
                selectedAccountType: updateState.role
              });
          }
      }
    }

    // Handle selection for registration payments
    handleRegPaymentSelectFromChild = async (updateState, dropdown) => {
      console.log("Selected Data (Registration Payment):", updateState, dropdown);
      if(updateState.centreLocation)
      {
        this.setState({
          selectedLocation: updateState.centreLocation
        });
      }
      else if(updateState.courseType)
      {
        this.setState({
          selectedCourseType: updateState.courseType
        });
      }
    }

    // Handle selection for registration payments
    handleRegPaymentSearchFromChild = async (data) => {
      this.setState({
        searchQuery: data
      });
    }


    searchResultFromChild = async (value) => {
      //console.log("Search Result:", value);
      this.setState({
        searchQuery: value
      });
    }

      // Search results for registration payments
      searchRegPaymentResultFromChild = async (value) => {
        console.log("Registration Payment Search Result:", value);
        this.setState({
          regPaymentSearchQuery: value
        });
      }


      toggleSubMenu = (index) => {
        this.setState((prevState) => ({
          submenuVisible: prevState.submenuVisible === index ? null : index
        }));
        //this.setState({viewMode: "full"});
      };

    toggleLanguage = () => {
      this.setState((prevState) => {
        const newLanguage = prevState.language === 'en' ? 'zh' : 'en';
        return {
          language: newLanguage
        };
      });
    };

    handleMouseLeave = () => {
      this.setState({ submenuVisible: null });
    };

    toggleSidebar = () => {
      this.setState((prevState) => ({
        sidebarVisible: !prevState.sidebarVisible
      }));
    };

    toggleCourseComponent = async (courseType) => {
      try {
        this.setState({ resetSearch: true, }, () => {
          this.setState({ resetSearch: false });
        });

        this.setState({
          isPopupOpen: true,
          popupMessage: "Loading In Progress",
          popupType: "loading",
          courseType: courseType,
          sidebarVisible: false,
          isRegistrationPaymentVisible: false ,
          section: "courses",
          accountType: "",
          createAccount: false
        });
      } catch (error) {
        console.log(error);
      }
    };

    toggleAccountsComponent = async (accountType) => 
    {
      try 
      {
        if(accountType !== "Create Account")
        { 
          this.setState({ resetSearch: true, }, () => {
            this.setState({ resetSearch: false });
          });

          console.log("Account Type:", accountType);

          this.setState({
            isPopupOpen: true,
            popupMessage: "Loading In Progress",
            popupType: "loading",
            courseType: "",
            sidebarVisible: false,
            isRegistrationPaymentVisible: false ,
            section: "accounts",
            accountType: accountType,
            createAccount: false
          });
        }
        else
        {
          this.setState({
            isPopupOpen: true,
            popupMessage: "Loading In Progress",
            popupType: "loading",
            courseType: "",
            sidebarVisible: false,
            isRegistrationPaymentVisible: false ,
            section: "accounts",
            accountType: null,
            createAccount: true
          });
        }
      } 
      catch (error) 
      {
        console.log(error);
      }
    };


    toggleViewMode(mode) {
      var {section} = this.state;
      console.log("Toggle View Mode:", section);
      this.setState({ viewMode: mode });
      if (mode === 'full') 
      {
        if(section === "courses")
        {
          this.handleEntriesPerPageChange(this.state.nofCourses); // Reset table data when switching to full view
        }
        else if(section === "registration")
        {
          this.handleEntriesPerPageChange(this.state.noofDetails);
        }
        else if(section === "accounts")
        {
          this.handleEntriesPerPageChange(this.state.nofAccounts);
        }
      }
    }

    closePopup = () => {
      this.setState({
        isPopupOpen: false,
        popupMessage: '',
        popupType: '',
      });
    };

    handlePageChange(page) {
      console.log("Total No Of Pages:", this.state.totalPages);
      if (page >= 1 && page <= this.state.totalPages) {
        this.setState({ currentPage: page });
      }
    }

    getPaginatedCourses = () => {
        const { currentPage, coursesPerPage } = this.state;
      const startIndex = (currentPage - 1) * coursesPerPage;
      return this.getFilteredCourses().slice(startIndex, startIndex + coursesPerPage);
    };

    getTotalNumberofCourses = async (total) =>
    {
      console.log(total);
      this.setState({ nofCourses: total });
    };

    getTotalNumberofDetails = async (total) =>
    {
        console.log("Registration:", total);
        this.setState({ noofDetails: total });
    };

    getTotalNumberofAccounts = async (total) =>
    {
        console.log("Total Number Of Accounts:", total);
        this.setState({ nofAccounts: total });
    };
  

    handleEntriesPerPageChange = (value) => 
    {
      value = Number(value);
      const { nofCourses, section, noofDetails, nofAccounts } = this.state;
      console.log("Entries Per Page:", value);
      console.log("Number of Courses:", nofAccounts);
      if(section === "courses")
      {
        this.setState(
          { entriesPerPage: value, currentPage: 1 }, // Reset to the first page
          () => {
            const totalPages = Math.ceil(nofCourses / value);
            console.log("Total Pages:", totalPages);
            this.setState({ totalPages });
          }
        )
      }
      else if(section === "registration")
      {
        this.setState(
          { entriesPerPage: value, currentPage: 1 }, // Reset to the first page
          () => {
            const totalPages = Math.ceil(noofDetails / value);
            console.log("Total Pages:", totalPages);
            this.setState({ totalPages });
          }
        )
      }
      else if(section === "accounts")
      {
          console.log("Number of Accounts:", nofAccounts);
          this.setState(
            { entriesPerPage: value, currentPage: 1 }, // Reset to the first page
            () => {
              const totalPages = Math.ceil(nofAccounts / value);
              console.log(" Accounts Total Pages:", totalPages);
              this.setState({ totalPages });
            }
          )
        }
    };

    toggleRegistrationPaymentComponent(item)
    {
      if(item === "Registration And Payment Table")
      {
        this.setState({ resetSearch: true, }, () => {
          this.setState({ resetSearch: false });
        });

        this.setState((prevState) => ({
            courseType: "",
            isRegistrationPaymentVisible: !prevState.isRegistrationPaymentVisible, // Toggle visibility
            isPopupOpen: true,
            popupMessage: "Loading In Progress",
            popupType: "loading",
            sidebarVisible: false,
            section: "registration",
            accountType: null,
            createAccount: false
            //viewMode: "full"
        }));
      }
  }

  logOut = async() =>
  {
    //this.props.history.push('/');  
    this.setState({
      isPopupOpen: true,
      popupMessage: "Are you sure that you want to log out?",
      popupType: "logout",
      isDropdownOpen: false
    });
  }

  goBackHome = async() =>
  {
    this.props.history.push("/");
  }

    createAccountPopupMessage(result, message, popupType)
    {
      console.log(result, message, popupType);
      this.setState({
        isPopupOpen: result,
        popupMessage: message,
        popupType: "success-message"
      });
      setTimeout(() => {
        this.setState({ isPopupOpen: false});
      }, 5000);
    }

    toggleDropdown = () => {
      this.setState((prevState) => ({
        isDropdownOpen: !prevState.isDropdownOpen,
      }));
    };

    render() 
    {
      const userName = this.props.location.state?.name || 'User';
      const { isDropdownOpen, displayedName, submenuVisible, language, courseType, accountType, isPopupOpen, popupMessage, popupType, sidebarVisible, locations, languages, types, selectedLanguage, selectedLocation, selectedCourseType, searchQuery, resetSearch, viewMode, currentPage, totalPages, nofCourses,noofDetails, isRegistrationPaymentVisible, section, roles, selectedAccountType, nofAccounts, createAccount} = this.state;
      return (
        <>
          <div className="dashboard">
            <div className="header">
              <button className="sidebar-toggle" onClick={this.toggleSidebar}>
                ☰
              x</button>
              <div className="language-toggle">
                <button onClick={this.toggleLanguage}>
                  {language === 'en' ? '中文' : 'English'}
                </button>
              </div>
              <div className="user-dropdown">
                <div className="dropdown-toggle" onClick={this.toggleDropdown}>
                  <span className="displayedName">{userName}</span>
                  <i className='fas fa-user-alt'></i>
                </div>

                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <ul>
                      {/*<li>Profile</li>
                      <li>Settings</li>*/}
                      <li onClick={this.logOut}>Logout</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className={`content ${sidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
              <div
                className={`sidebar ${submenuVisible !== null ? 'expanded' : ''}`}
                onMouseLeave={this.handleMouseLeave}
              >
                <SideBarContent
                  accountId = {this.props.location.state?.accountId}
                  toggleAccountsComponent = {this.toggleAccountsComponent}
                  toggleCourseComponent = {this.toggleCourseComponent}
                  toggleRegistrationPaymentComponent = {this.toggleRegistrationPaymentComponent}
                />
              </div>
              <div className="main-content">
              {createAccount && (
                <>
                   <div className="create-account-section">
                      <CreateAccountsSection
                        language={language}
                        closePopup={this.closePopup}
                        createAccountPopupMessage={this.createAccountPopupMessage}
                      />
                    </div>
                </>
              )}
              {accountType && (
                  <>
                  <div className="search-section">
                      <Search
                        language={language}
                        closePopup={this.closePopup}
                        passSelectedValueToParent={this.handleSelectFromChild}
                        passSearchedValueToParent={this.searchResultFromChild}
                        resetSearch={resetSearch}
                        section={section}
                        roles={roles}
                      />
                    </div>
                    <div className="view-toggle-section">
                      <ViewToggle
                        language={language}
                        viewMode={viewMode}
                        onToggleView={this.toggleViewMode}
                        onEntriesPerPageChange={this.handleEntriesPerPageChange}  
                        getTotalNumber= {nofAccounts}
                      />
                    </div>
                    <div className="account-section">
                      <AccountsSection
                        language={language}
                        accountType={accountType}
                        closePopup={this.closePopup}
                        passDataToParent={this.handleDataFromChild}
                        selectedAccountType ={selectedAccountType}
                        searchQuery={searchQuery}
                        getTotalNumberofAccounts={this.getTotalNumberofAccounts}
                        currentPage={currentPage} // Pass current page
                        entriesPerPage={this.state.entriesPerPage} // Pass entries per page
                        resetSearch={resetSearch} 
                        section={section}
                      />
                    </div>
                    <div className="pagination-section">
                      <Pagination
                        viewMode = {viewMode}
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={this.handlePageChange}
                      />
                    </div>
                  </>
                )}
                {courseType && (
                  <>
                    <div className="search-section">
                      <Search
                        language={language}
                        closePopup={this.closePopup}
                        languages={languages}
                        locations={locations}
                        passSelectedValueToParent={this.handleSelectFromChild}
                        passSearchedValueToParent={this.searchResultFromChild}
                        resetSearch={resetSearch}
                        section={section}
                      />
                    </div>
                    <div className="view-toggle-section">
                      <ViewToggle
                        language={language}
                        viewMode={viewMode}
                        onToggleView={this.toggleViewMode}
                        onEntriesPerPageChange={this.handleEntriesPerPageChange}  
                        getTotalNumber= {nofCourses}
                      />
                    </div>
                    <div className="courses-section">
                      <CoursesSection
                        language={language}
                        courseType={courseType}
                        closePopup={this.closePopup}
                        passDataToParent={this.handleDataFromChild}
                        selectedLanguage={selectedLanguage}
                        selectedLocation={selectedLocation}
                        searchQuery={searchQuery}
                        getTotalNumberofCourses={this.getTotalNumberofCourses}
                        currentPage={currentPage} // Pass current page
                        entriesPerPage={this.state.entriesPerPage} // Pass entries per page
                        resetSearch={resetSearch} 
                        section={section}
                      />
                    </div>
                    <div className="pagination-section">
                      <Pagination
                        viewMode = {viewMode}
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={this.handlePageChange}
                      />
                    </div>
                  </>
                )}
                {isRegistrationPaymentVisible && 
                  <>
                  <div className="search-section">
                      <Search
                        locations={locations}
                        types={types}
                        resetSearch={resetSearch}
                        section={section}
                        passSelectedValueToParent={this.handleRegPaymentSelectFromChild}
                        passSearchedValueToParent={this.handleRegPaymentSearchFromChild}
                      />
                    </div>
                    <div className="view-toggle-section">
                      <ViewToggle
                        language={language}
                        viewMode={viewMode}
                        onToggleView={this.toggleViewMode}
                        onEntriesPerPageChange={this.handleEntriesPerPageChange}  
                        getTotalNumber= {noofDetails}
                      />
                    </div>
                    <div className="registration-payment-section">
                    <RegistrationPaymentSection 
                        closePopup={this.closePopup}
                        section={section}
                        passDataToParent={this.handleDataFromChild}
                        selectedLocation={selectedLocation}
                        selectedCourseType={selectedCourseType}
                        searchQuery={searchQuery}
                        resetSearch={resetSearch}
                        getTotalNumberofDetails={this.getTotalNumberofDetails}
                        currentPage={currentPage} // Pass current page
                        entriesPerPage={this.state.entriesPerPage} // Pass entries per page
                        userName = {userName}
                    />
                    </div>
                    <div className="pagination-section">
                      <Pagination
                        viewMode = {viewMode}
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={this.handlePageChange}
                      />
                    </div>
                  </>} {/* Conditionally render the section */}
              </div>
            </div>
            <div className="footer">
              <p>© 2024 En Community Service Society Courses Management System.<br />
                All rights reserved.</p>
            </div>
          </div>
          <Popup isOpen={isPopupOpen} message={popupMessage} type={popupType} closePopup={this.closePopup} goBackLoginPage={this.goBackHome}/>
        </>
      );
    }
  }

  export default withRouter(HomePage);
