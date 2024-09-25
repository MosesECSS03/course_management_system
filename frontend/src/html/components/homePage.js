  import React, { Component } from 'react';
  import '../../css/homePage.css'; // Ensure your CSS paths are correct
  import CoursesSection from './sub/courseSection';
  import Popup from './popup/popupMessage';
  import Search from './sub/searchSection';
  import ViewToggle from './sub/viewToggleSection';
  import Pagination from './sub/paginationSection';

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
        selectedLanguage: '',
        selectedLocation: '',
        searchQuery: '',
        resetSearch: false,
        currentPage: 1,
        entriesPerPage: 10,
        totalPages: 1,
        nofCourses: 0,
        viewMode: 'full' // Initialize viewMode
      };

      this.handleDataFromChild = this.handleDataFromChild.bind(this);
      this.searchResultFromChild = this.searchResultFromChild.bind(this);
      this.handleSelectFromChild = this.handleSelectFromChild.bind(this);
      this.handlePageChange = this.handlePageChange.bind(this);
      this.toggleViewMode = this.toggleViewMode.bind(this); // Ensure this is bound
    }

    // Function to handle data passed from the child
    handleDataFromChild = async (locations, languages) => {
      const filterLanguages = new Set(languages);
      const filterLocations = new Set(locations);

      console.log(filterLanguages, filterLocations);

      this.setState({
        locations: Array.from(filterLocations),
        languages: Array.from(filterLanguages)
      });
    }

    handleSelectFromChild = async (updateState) => {
      console.log("Selected Data:", updateState);
      if (updateState.showLanguageDropdown === true) {
        this.setState({
          selectedLanguage: updateState.language
        });
      } else {
        this.setState({
          selectedLocation: updateState.centreLocation
        });
      }
    }

    searchResultFromChild = async (value) => {
      //console.log("Search Result:", value);
      this.setState({
        searchQuery: value
      });
    }

    toggleSubMenu = (index) => {
      this.setState((prevState) => ({
        submenuVisible: prevState.submenuVisible === index ? null : index
      }));
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
        this.setState({ resetSearch: true }, () => {
          this.setState({ resetSearch: false });
        });

        this.setState({
          isPopupOpen: true,
          popupMessage: "Loading In Progress",
          popupType: "loading",
          courseType: courseType,
          sidebarVisible: false,
        });
      } catch (error) {
        console.log(error);
      }
    };

    toggleViewMode(mode) {
      this.setState({ viewMode: mode });
      if (mode === 'full') {
          this.handleEntriesPerPageChange(this.state.nofCourses); // Reset table data when switching to full view
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

    handleEntriesPerPageChange = (value) => 
    {
      const { nofCourses } = this.state;
      console.log("Entries Per Page:", value);
      console.log("Number of Courses:", nofCourses);
      this.setState(
        { entriesPerPage: value, currentPage: 1 }, // Reset to the first page
        () => {
          const totalPages = Math.ceil(nofCourses / value);
          console.log("Total Pages:", totalPages);
          this.setState({ totalPages });
        }
      );
    };

    render() {
      const { submenuVisible, language, courseType, isPopupOpen, popupMessage, popupType, sidebarVisible, locations, languages, selectedLanguage, selectedLocation, searchQuery, resetSearch, viewMode, currentPage, totalPages, nofCourses} = this.state;
      return (
        <>
          <div className="dashboard">
            <div className="header">
              <button className="sidebar-toggle" onClick={this.toggleSidebar}>
                ☰
              </button>
              <div className="language-toggle">
                <button onClick={this.toggleLanguage}>
                  {language === 'en' ? '中文' : 'English'}
                </button>
              </div>
            </div>
            <div className={`content ${sidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
              <div
                className={`sidebar ${submenuVisible !== null ? 'expanded' : ''}`}
                onMouseLeave={this.handleMouseLeave}
              >
                <div className="sidebar-item">
                  <i className="fa-solid fa-user"></i> {language === 'zh' ? '账户' : 'Accounts'}
                </div>
                <div className="sidebar-item" onClick={() => this.toggleSubMenu(0)}>
                  <i className="fas fa-tachometer-alt"></i> {language === 'zh' ? '课程' : 'Courses'}
                </div>
                <div className={`submenu${submenuVisible === 0 ? 'visible' : ''}`}>
                  <div className="submenu-item" onClick={() => this.toggleCourseComponent('NSA')}>
                    {language === 'zh' ? 'NSA 课程' : 'NSA Courses'}
                  </div>
                  <div className="submenu-item" onClick={() => this.toggleCourseComponent('ILP')}>
                    {language === 'zh' ? 'ILP 课程' : 'ILP Courses'}
                  </div>
                </div>
                <div className="sidebar-item">
                  <i className="fa-brands fa-wpforms"></i> {language === 'zh' ? '注册和付款' : 'Registrations and Payments'}
                </div>
                <div className="sidebar-item">
                  <i className="fas fa-qrcode"></i> {language === 'zh' ? '二维码' : 'QR Code'}
                </div>
              </div>
              <div className="main-content">
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
                      />
                    </div>
                    <div className="view-toggle-section">
                      <ViewToggle
                        language={language}
                        viewMode={viewMode}
                        onToggleView={this.toggleViewMode}
                        onEntriesPerPageChange={this.handleEntriesPerPageChange}  
                        getTotalNumberOfCourse= {nofCourses}
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
              </div>
            </div>
            <div className="footer">
              <p>© 2024 En Community Service Society Courses Management System.<br />
                All rights reserved.</p>
            </div>
          </div>
          <Popup isOpen={isPopupOpen} message={popupMessage} type={popupType} />
        </>
      );
    }
  }

  export default HomePage;
