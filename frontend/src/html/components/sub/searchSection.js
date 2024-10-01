      import React, { Component } from 'react';
      import '../../../css/sub/search.css'; // Ensure you have this CSS file for styling

      const languageTranslations = {
        "English": '英语',
        "Mandarin": '中文',
        "English and Mandarin": '英文和中文',
        "All Languages": '所有语言',
        "All Locations": '所有地点'
      }

      class SearchSection extends Component {
        constructor(props) {
          super(props);
          this.state = {
            searchQuery: '',
            centreLocation: '',
            language: '',
            status: '',
            courseType: '',
            locations: [], // Default to props if available
            languages: [], // Default to props if available
            statuses: [], // Default to props if available
            types: [], // Default to props if available
            filteredLocations: [],
            filteredLanguages: [],
            filteredStatuses: [],
            filteredTypes: [],
            showLocationDropdown: false,
            showLanguageDropdown: false,
            showTypeDropdown: false
          };
          this.locationDropdownRef = React.createRef();
          this.languageDropdownRef = React.createRef();
          this.typeDropdownRef = React.createRef();
        }


        // Translate languages to Chinese if the selected language is 'zh'
        translateLanguages = (languages) => {
          if (this.props.language === 'zh') {
            return languages.map(lang => languageTranslations[lang] || lang);
          }
          return languages;
        };

        handleChange = (event) => {
          const { name, value } = event.target;
          console.log("handleChange", name,event)
          this.setState({ [name]: value }, () => {
            if (name === 'centreLocation') {
              this.setState({
                filteredLocations: this.state.locations.filter(location =>
                  location.toLowerCase().includes(value.toLowerCase())
                ),
                centrelocation: value
              });
            } else if (name === 'language') {
              this.setState({
                filteredLanguages: this.state.languages.filter(lang =>
                  lang.toLowerCase().includes(value.toLowerCase())
                ),
                language: value
              });
            }  else if (name === 'courseType') {
              console.log(value);
              this.setState({
                filteredTypes: this.state.types.filter(type =>
                  type.toLowerCase().includes(value.toLowerCase())
                ),
                courseType: value
              });
            } else if (name === 'searchQuery') {
              this.props.passSearchedValueToParent(value);
            }
          });
        };

        /*handleDropdownToggle = (dropdown) => {
          console.log("Toggle:", dropdown);
          this.setState(prevState => ({ 
            showLocationDropdown: dropdown === 'showLocationDropdown' ? !prevState.showLocationDropdown : false,
            showLanguageDropdown: dropdown === 'showLanguageDropdown' ? !prevState.showLanguageDropdown : false,
            showTypeDropdown: dropdown === 'showTypeDropdown' ? !prevState.showTypeDropdown : false
          }));
        };*/

        handleDropdownToggle = (dropdown) =>
        {
          console.log("Dropdown:", dropdown);
          if(dropdown === 'showLocationDropdown')
          {
            this.setState({
              showLocationDropdown: true,
              showLanguageDropdown: false,
              showTypeDropdown: false
            });
          }
          else if(dropdown === 'showLanguageDropdown')
            {
              this.setState({
                showLocationDropdown: false,
                showLanguageDropdown: true,
                showTypeDropdown: false
              });
            }
            else if(dropdown === 'showTypeDropdown')
            {
                this.setState({
                  showLocationDropdown: false,
                  showLanguageDropdown: false,
                  showTypeDropdown: true
                });
            }
        }

        handleOptionSelect = (value, dropdown) => {
          const isMandarin = this.props.language === "zh"; 
          let updatedState = {};
        
            // Update state based on dropdown type
            if (dropdown === 'showLocationDropdown') {
              updatedState = {
                centreLocation: value,
                showLocationDropdown: false, // Close the location dropdown
                showLanguageDropdown: false,
                showTypeDropdown: false
              };
            } else if (dropdown === 'showLanguageDropdown') {
              updatedState = {
                language: value,
                showLocationDropdown: false,
                showLanguageDropdown: false, // Close the language dropdown
                showTypeDropdown: false
              };
            } else if (dropdown === 'showTypeDropdown') {
              updatedState = {
                courseType: value,
                showLocationDropdown: false,
                showLanguageDropdown: false,
                showTypeDropdown: false // Close the type dropdown
              };
            }
        
            this.setState(updatedState, () => {
              console.log("Updated States:", updatedState);
              // Notify parent with the updated state
              this.props.passSelectedValueToParent(updatedState, dropdown);
            });
        }

        handleClickOutside = (event) => {
          if (
            this.locationDropdownRef.current &&
            !this.locationDropdownRef.current.contains(event.target) &&
            this.languageDropdownRef.current &&
            !this.languageDropdownRef.current.contains(event.target) &&  
            this.typeDropdownRef.current &&
            !this.typeDropdownRef.current.contains(event.target)
          ) {
            this.setState({
              showLocationDropdown: false,
              showLanguageDropdown: false,
              showTypeDropdown: false,
            });
          }
        };

        componentDidMount() {
          document.addEventListener('mousedown', this.handleClickOutside);
          // Initialize state with unique values from props
          const uniqueLocations = [...new Set(this.props.locations)];
          const uniqueLanguages = [...new Set(this.props.languages)];

          this.updateUniqueLocationsLanguagesTypes(this.props);
        }

          componentDidUpdate(prevProps) {
            console.log(this.props);  
            if ((this.props.resetSearch && prevProps.resetSearch !== this.props.resetSearch)) {
              this.setState({
                searchQuery: '',
                centreLocation: '',
                language: '',
                showLocationDropdown: false,
                showLanguageDropdown: false,
                showTypeDropdown: false
              });
            }

            if (this.props.language !== prevProps.language) {
              const uniqueLocations = ["All Locations", ...new Set(this.props.locations)]
              this.setState({
                searchQuery: '',
                centreLocation: '',
                language: ''
              });
            }
          
            if (this.props.locations !== prevProps.locations) {
              const uniqueLocations = ["All Locations", ...new Set(this.props.locations)];
              this.setState({
                locations: uniqueLocations,
                filteredLocations: uniqueLocations
              });
            }
          
            if (this.props.languages !== prevProps.languages) {
              const uniqueLanguages = ["All Languages", ...new Set(this.props.languages)];
              this.setState({
                languages: uniqueLanguages,
                filteredLanguages: uniqueLanguages
              }); 
            }  

                     
            if (this.props.types !== prevProps.types) {
              const uniqueTypes = ["All Types", ...new Set(this.props.types)];
              this.setState({
                types: uniqueTypes,
                filteredTypes: uniqueTypes
              }); 
            }  
          }
          
        // Method to handle updating locations and languages
      updateUniqueLocationsLanguagesTypes(props) {
        const uniqueLocations = ["All Locations", ...new Set(props.locations)];
        const uniqueLanguages = ["All Languages", ...new Set(props.languages)];
        const uniqueTypes = ["All Types", ...new Set(props.types)];
        console.log("Props:", props);

        this.setState({
          locations: uniqueLocations,
          filteredLocations: uniqueLocations,
          languages: this.translateLanguages(uniqueLanguages), // Translate if necessary
          filteredLanguages: this.translateLanguages(uniqueLanguages), // Translate if necessary
          types: uniqueTypes, // Translate if necessary
          filteredTypes: uniqueTypes // Translate if necessary
        });
      }

        componentWillUnmount() {
          document.removeEventListener('mousedown', this.handleClickOutside);
        }

        
render() {
  const { searchQuery, centreLocation, language, filteredLocations, filteredLanguages, filteredTypes, showLocationDropdown, showLanguageDropdown, showTypeDropdown, courseType} = this.state;
  const { section } = this.props; // Destructure section from props

  return (
    <div className="filter-section"> {/* Same class name for both sections */}
      <div className="form-group-row">
        {section === "courses" && ( // Content for "courses"
          <>
            <div className="form-group">
              <label htmlFor="centreLocation">{this.props.language === 'zh' ? '中心位置' : 'Locations'}</label>
              <div
                className={`dropdown-container ${showLocationDropdown ? 'open' : ''}`}
                ref={this.locationDropdownRef}
              >
                <input
                  type="text"
                  id="centreLocation"
                  name="centreLocation"
                  value={centreLocation}
                  onChange={this.handleChange}
                  onClick={() => this.handleDropdownToggle('showLocationDropdown')}
                  placeholder={this.props.language === 'zh' ? '按地点筛选' : 'Filter by location'}
                  autoComplete="off"
                />
                {showLocationDropdown && (
                  <ul className="dropdown-list">
                    {filteredLocations.map((location, index) => (
                      <li
                        key={index}
                        onClick={() => this.handleOptionSelect(location, 'showLocationDropdown')}
                      >
                        {location}
                      </li>
                    ))}
                  </ul>
                )}
                <i className="fas fa-angle-down dropdown-icon"></i>
              </div>
            </div>
            <div className="form-group">
            <label htmlFor="language">{this.props.language === 'zh' ? '语言' : 'Languages'}</label>
            <div
              className={`dropdown-container ${showLanguageDropdown ? 'open' : ''}`}
              ref={this.languageDropdownRef}
            >
              <input
                type="text"
                id="language"
                name="language"
                value={language}
                onChange={this.handleChange}
                onClick={() => this.handleDropdownToggle('showLanguageDropdown')}
                placeholder={this.props.language === 'zh' ? '按语言筛选' : 'Filter by language'}
                autoComplete="off"
              />
              {showLanguageDropdown && (
                <ul className="dropdown-list">
                  {filteredLanguages.map((lang, index) => (
                    <li
                      key={index}
                      onClick={() => this.handleOptionSelect(lang, 'showLanguageDropdown')}
                    >
                      {lang}
                    </li>
                  ))}
                </ul>
              )}
              <i className="fas fa-angle-down dropdown-icon"></i>
            </div>
          </div>
            <div className="form-group">
              <label htmlFor="searchQuery">{this.props.language === 'zh' ? '搜寻' : 'Search'}</label>
              <div className="search-container">
                <input
                  type="text"
                  id="searchQuery"
                  name="searchQuery"
                  value={searchQuery}
                  onChange={this.handleChange}
                  placeholder={this.props.language === 'zh' ? '搜索' : 'Search'}
                  autoComplete="off"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
            </div>
          </>
        )}
        
        {section === "registration" && ( // Content for "registration"
          <>
           <div className="form-group">
              <label htmlFor="centreLocation">{this.props.language === 'zh' ? '中心位置' : 'Locations'}</label>
              <div
                className={`dropdown-container ${showLocationDropdown ? 'open' : ''}`}
                ref={this.locationDropdownRef}
              >
                <input
                  type="text"
                  id="centreLocation"
                  name="centreLocation"
                  value={centreLocation}
                  onChange={this.handleChange}
                  onClick={() => this.handleDropdownToggle('showLocationDropdown')}
                  placeholder={this.props.language === 'zh' ? '按地点筛选' : 'Filter by location'}
                  autoComplete="off"
                />
                {showLocationDropdown && (
                  <ul className="dropdown-list">
                    {filteredLocations.map((location, index) => (
                      <li
                        key={index}
                        onClick={() => this.handleOptionSelect(location, 'showLocationDropdown')}
                      >
                        {location}
                      </li>
                    ))}
                  </ul>
                )}
                <i className="fas fa-angle-down dropdown-icon"></i>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="courseType">{this.props.language === 'zh' ? '类型' : 'Types'}</label>
              <div
                className={`dropdown-container ${showTypeDropdown ? 'open' : ''}`}
                ref={this.typeDropdownRef}
              >
                <input
                  type="text"
                  id="courseType"
                  name="courseType"
                  value={courseType}
                  onChange={this.handleChange}
                  onClick={() => this.handleDropdownToggle('showTypeDropdown')}
                  placeholder={this.props.language === 'zh' ? '按类型筛选' : 'Filter by types'}
                  autoComplete="off"
                />
                
                {showTypeDropdown && (
                  <ul className="dropdown-list">
                    {filteredTypes.map((type, index) => (
                      <li
                        key={index}
                        onClick={() => this.handleOptionSelect(type, 'showTypeDropdown')}
                      >
                        {type}
                      </li>
                    ))}
                  </ul>
                )}
                <i className="fas fa-angle-down dropdown-icon"></i>
              </div>
              </div>
              <div className="form-group">
              <label htmlFor="searchQuery">{this.props.language === 'zh' ? '搜寻' : 'Search'}</label>
              <div className="search-container">
                <input
                  type="text"
                  id="searchQuery"
                  name="searchQuery"
                  value={searchQuery}
                  onChange={this.handleChange}
                  placeholder={this.props.language === 'zh' ? '搜索' : 'Search'}
                  autoComplete="off"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
            </div>
          </>            
        )}
      </div>
    </div>
    );
  }
}
export default SearchSection;
