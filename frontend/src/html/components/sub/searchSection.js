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
        locations: [], // Default to props if available
        languages: [], // Default to props if available
        statuses: [], // Default to props if available
        filteredLocations: [],
        filteredLanguages: [],
        filteredStatuses: [],
        showLocationDropdown: false,
        showLanguageDropdown: false
      };
      this.locationDropdownRef = React.createRef();
      this.languageDropdownRef = React.createRef();
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
      this.setState({ [name]: value }, () => {
        if (name === 'centreLocation') {
          this.setState({
            filteredLocations: this.state.locations.filter(location =>
              location.toLowerCase().includes(value.toLowerCase())
            ),
          });
        } else if (name === 'language') {
          this.setState({
            filteredLanguages: this.state.languages.filter(lang =>
              lang.toLowerCase().includes(value.toLowerCase())
            )
          });
        } else {
          this.props.passSearchedValueToParent(value);
        }
      });
    };

    handleDropdownToggle = (dropdown) => {
      this.setState(prevState => ({
        showLocationDropdown: dropdown === 'showLocationDropdown' ? !prevState.showLocationDropdown : false,
        showLanguageDropdown: dropdown === 'showLanguageDropdown' ? !prevState.showLanguageDropdown : false
      }));
    };

    handleOptionSelect = (value, dropdown) =>
    {
      const isMandarin = this.props.language === "zh"; 
      if (value === 'Select All') {
        // Clear the input field if "Select All" is clicked
        const updatedState = dropdown === 'showLocationDropdown'
          ? { centreLocation: isMandarin ? "所有地点" : "All Locations", showLocationDropdown: false }
          : {  language: isMandarin ? "所有语言" : "All Languages", showLanguageDropdown: true };

        this.setState(updatedState, () => {
          // Notify parent with the updated state
          this.props.passSelectedValueToParent(updatedState);
        });
      } else {
        // Update state based on dropdown type
        const updatedState = dropdown === 'showLocationDropdown'
          ? { centreLocation: value, showLocationDropdown: false }
          : { language: value, showLanguageDropdown: true };

        this.setState(updatedState, () => {
          // Notify parent with the updated state
          this.props.passSelectedValueToParent(updatedState);
        });
      }
    };

    handleClickOutside = (event) => {
      if (
        this.locationDropdownRef.current &&
        !this.locationDropdownRef.current.contains(event.target) &&
        this.languageDropdownRef.current &&
        !this.languageDropdownRef.current.contains(event.target)
      ) {
        this.setState({
          showLocationDropdown: false,
          showLanguageDropdown: false
        });
      }
    };

    componentDidMount() {
      document.addEventListener('mousedown', this.handleClickOutside);
      // Initialize state with unique values from props
      const uniqueLocations = [...new Set(this.props.locations)];
      const uniqueLanguages = [...new Set(this.props.languages)];

      /*this.setState({
        locations: uniqueLocations,
        filteredLocations: uniqueLocations,
        languages: uniqueLanguages,
        filteredLanguages: uniqueLanguages
      });*/

      this.updateUniqueLocationsAndLanguages(this.props);
    }

      componentDidUpdate(prevProps) {
        console.log(this.props);  
        if ((this.props.resetSearch && prevProps.resetSearch !== this.props.resetSearch)) {
          this.setState({
            searchQuery: '',
            centreLocation: '',
            language: '',
            showLocationDropdown: false,
            showLanguageDropdown: false
          });
        }

        if (this.props.language !== prevProps.language) {
          const uniqueLocations = [...new Set(this.props.locations)]
          this.setState({
            searchQuery: '',
            centreLocation: '',
            language: ''
          });
        }
      
        if (this.props.locations !== prevProps.locations) {
          const uniqueLocations = [...new Set(this.props.locations)];
          this.setState({
            locations: uniqueLocations,
            filteredLocations: uniqueLocations
          });
        }
      
        if (this.props.languages !== prevProps.languages) {
          const uniqueLanguages = [...new Set(this.props.languages)];
          this.setState({
            languages: uniqueLanguages,
            filteredLanguages: uniqueLanguages
          }); 
        }  
      }
      
     // Method to handle updating locations and languages
  updateUniqueLocationsAndLanguages(props) {
    const uniqueLocations = [...new Set(props.locations)];
    const uniqueLanguages = [...new Set(props.languages)];
    console.log("Language:", this.translateLanguages(uniqueLanguages));

    this.setState({
      locations: uniqueLocations,
      filteredLocations: uniqueLocations,
      languages: this.translateLanguages(uniqueLanguages), // Translate if necessary
      filteredLanguages: this.translateLanguages(uniqueLanguages), // Translate if necessary
    });
  }

    componentWillUnmount() {
      document.removeEventListener('mousedown', this.handleClickOutside);
    }

    

    render() {
      const { searchQuery, centreLocation, language, filteredLocations, filteredLanguages, showLocationDropdown, showLanguageDropdown } = this.state;

      return (
        <div className="filter-section">
          <div className="form-group-row">
            <div className="form-group">
            <label htmlFor="searchQuery">{this.props.language === 'zh' ? '中心位置' : 'Locations'}</label>
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
                    <li
                      onClick={() => this.handleOptionSelect('Select All', 'showLocationDropdown')}
                    >
                    {this.props.language !== 'zh' ?  "All Locations": '所有地点'}
                    </li>
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
            <label htmlFor="searchQuery">{this.props.language === 'zh' ? '语言' : 'Languages'}</label>
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
                    <li
                      onClick={() => this.handleOptionSelect('Select All', 'showLanguageDropdown')}
                    >
                   {this.props.language !== 'zh' ?  "All Languages": '所有语言'}
                    </li>
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
          </div>
        </div>
      );
    }
  }

  export default SearchSection;
