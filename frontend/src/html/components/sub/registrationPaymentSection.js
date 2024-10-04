  import React, { Component } from 'react';
  import axios from 'axios';
  import '../../../css/sub/registrationPayment.css';

  class RegistrationPaymentSection extends Component {
    constructor(props) {
      super(props);
      this.state = {
        hideAllCells: false,
        registerationDetails: [],
        isLoading: true,
        inputValues: {},
        dropdownVisible: {}, // Store input values for each row
        cashPaynowSuggestions: ["Pending", "Paid", "Cancelled"], // General suggestions
        skillsFutureOptions: ["Pending", "Approved", "Not Approved", "Refunded", "Cancelled"], // SkillsFuture specific options
        filteredSuggestions: [],
        focusedInputIndex: null,
        originalData: [],
        currentPage: 1, // Add this
        entriesPerPage: 10 // Add this
      };
      this.tableRef = React.createRef();
    }

    handleEntriesPerPageChange = (e) => {
      this.setState({
        entriesPerPage: parseInt(e.target.value, 10),
        currentPage: 1 // Reset to the first page when changing entries per page
      });
    }

    getPaginatedDetails() {
      const { registerationDetails } = this.state;
      const { currentPage, entriesPerPage } = this.props;
      const indexOfLastCourse = currentPage * entriesPerPage;
      const indexOfFirstCourse = indexOfLastCourse - entriesPerPage;
      return registerationDetails.slice(indexOfFirstCourse, indexOfLastCourse);
    }
  

    convertToChineseDate(dateStr) {
      const monthMap = {
        January: 1, February: 2, March: 3, April: 4,
        May: 5, June: 6, July: 7, August: 8,
        September: 9, October: 10, November: 11, December: 12,
      };

      const [day, month, year] = dateStr.split(' ');
      const monthNumber = monthMap[month];

      return `${year}年${monthNumber}月${parseInt(day)}日`;
    }

    fetchCourseRegistrations(language) {
      return axios
        .post('http://localhost:3001/courseregistration', { purpose: 'retrieve' })
        .then(response => {
          const array = this.languageDatabase(response.data.result, language);
          return array;
        })
        .catch(error => {
          console.error('Error fetching course registrations:', error);
          return []; // Return an empty array in case of error
        });
      /*return axios
        .post('https://moses-course-testing-dqghhsbcgseccyfa.japaneast-01.azurewebsites.net/courseregistration', { purpose: 'retrieve' })
        .then(response => {
          const array = this.languageDatabase(response.data.result, language);
          return array;
        })
        .catch(error => {
          console.error('Error fetching course registrations:', error);
          return []; // Return an empty array in case of error
        });*/
    }

    languageDatabase(array, language) {
      for (let i = 0; i < array.length; i++) {
        if (language === 'en') {
          const participant = array[i].participant;
          participant.residentialStatus = participant.residentialStatus.split(' ')[0];
          participant.race = participant.race.split(' ')[0];

          if (participant.educationLevel.split(' ').length === 3) {
            participant.educationLevel = participant.educationLevel.split(' ').slice(0, 2).join(' ');
          } else {
            participant.educationLevel = participant.educationLevel.split(' ')[0];
          }

          if (participant.workStatus.split(' ').length === 3) {
            participant.workStatus = participant.workStatus.split(' ').slice(0, 2).join(' ');
          } else {
            participant.workStatus = participant.workStatus.split(' ')[0];
          }

          array[i].agreement = array[i].agreement.split(' ')[0];
        } else if (language === 'zh') {
          const participant = array[i].participant;
          participant.residentialStatus = participant.residentialStatus.split(' ')[1];
          participant.race = participant.race.split(' ')[1];

          participant.gender = (participant.gender === 'M') ? '男' : (participant.gender === 'F') ? '女' : participant.gender;

          if (participant.educationLevel.split(' ').length === 3) {
            participant.educationLevel = participant.educationLevel.split(' ')[2];
          } else {
            participant.educationLevel = participant.educationLevel.split(' ')[1];
          }

          if (participant.workStatus.split(' ').length === 3) {
            participant.workStatus = participant.workStatus.split(' ')[2];
          } else {
            participant.workStatus = participant.workStatus.split(' ')[1];
          }

          const startDate = array[i].course.courseDuration.split('-')[0].trim();
          const endDate = array[i].course.courseDuration.split('-')[1].trim();
          array[i].course.courseEngName = array[i].course.courseChiName;
          array[i].course.courseDuration = `${this.convertToChineseDate(startDate)} - ${this.convertToChineseDate(endDate)}`;
          
          array[i].course.payment = array[i].course.payment === 'Cash' ? '现金' : array[i].course.payment;
          array[i].agreement = array[i].agreement.split(' ')[1];
        }
      }
      return array;
    }

    async componentDidMount() {
      const { language } = this.props;
      const data = await this.fetchCourseRegistrations(language);
      console.log('Data:', data);
      var locations = this.getAllLocations(data);
      var types = this.getAllType(data);
      this.props.passDataToParent(locations, types);

      const statuses = data.map(item => item.status); // Extract statuses
      console.log('Statuses:', statuses); // Log the array of statuses
      
      await this.props.getTotalNumberofDetails(data.length);

      // Initialize inputValues for each index based on fetched data
      const inputValues = {};
      data.forEach((item, index) => {
        inputValues[index] = item.status || "Pending"; // Use item.status or default to "Pending"
      });

      this.setState({
        originalData: data,
        registerationDetails: data, // Update with fetched dat
        isLoading: false, // Set loading to false after data is fetche
        inputValues: inputValues,  // Show dropdown for the focused input
        locations: locations, // Set locations in state
        types: types
      });
    
      this.props.closePopup();
    }
    
    

    async componentDidUpdate(prevProps) {
      const { selectedLocation, selectedCourseType, searchQuery} = this.props;
      if (selectedLocation !== prevProps.selectedLocation ||
        selectedCourseType !== prevProps.selectedCourseType ||
        searchQuery !== prevProps.searchQuery 
      ) {
        this.filterRegistrationDetails();
      }
    }

    filterRegistrationDetails() {
      const { section } = this.props;
  
      if (section === "registration") {
          const { originalData } = this.state;
          const { selectedLocation, selectedCourseType, searchQuery } = this.props;
  
          // Reset filtered courses to all courses if the search query is empty
          if (selectedCourseType === "All Types" && selectedLocation === "All Locations") {
              this.setState({ registerationDetails: originalData });
              return;
          }

          const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase().trim() : '';

  
          const filteredDetails = originalData.filter(data => {
              // Extract participant properties
              const pName = data.participant.name.toLowerCase().trim() || ""; 
              const pNric = data.participant.nric.toLowerCase().trim() || ""; 
              const pRS = data.participant.residentialStatus.toLowerCase().trim() || ""; // Fixed to avoid calling it as a function
              const pRace = data.participant.race.toLowerCase().trim() || ""; // Assuming race is a string
              const pGender = data.participant.gender.toLowerCase().trim() || "";
              const pDateOfBirth = data.participant.dateOfBirth || ""; // Ensure correct formatting if needed
              const pContactNumber = data.participant.contactNumber || "";
              const pEmail = data.participant.email.toLowerCase().trim() || "";
              const pPostalCode = data.participant.postalCode || "";
              const pEducationLevel = data.participant.educationLevel.toLowerCase().trim() || "";
              const pWorkStatus = data.participant.workStatus.toLowerCase().trim() || "";

              // Extract course properties
              const location = data.course?.courseLocation?.toLowerCase().trim() || ""; 
              const type = data.course?.courseType?.toLowerCase().trim() || "";
              const courseEngName = data.course?.courseEngName?.toLowerCase().trim() || "";
              const duration = data.course?.courseDuration || "";
              const payment = data.course?.payment || "";
              const agreement = data.agreement || "";
  
              // Match 'All Languages' and 'All Locations'
              const matchesLocation = selectedLocation === "All Languages" || 
                  selectedLocation === "所有语言" || 
                  selectedLocation === "" || 
                  !selectedLocation 
                  ? true 
                  : location === selectedLocation.toLowerCase().trim();
  
              const matchesType = selectedCourseType === "All Types" || 
                  selectedCourseType === "所有地点" || 
                  selectedCourseType === "" || 
                  !selectedCourseType 
                  ? true 
                  : type === selectedCourseType.toLowerCase().trim();

              const matchesSearchQuery = normalizedSearchQuery
                  ? (pName.includes(normalizedSearchQuery) ||
                     pNric.includes(normalizedSearchQuery) ||
                     pRS.includes(normalizedSearchQuery) ||
                     pRace.includes(normalizedSearchQuery) ||
                     pGender.includes(normalizedSearchQuery) ||
                     pDateOfBirth.includes(normalizedSearchQuery) ||
                     pContactNumber.includes(normalizedSearchQuery)||
                     pEmail.includes(normalizedSearchQuery) ||
                     pPostalCode.includes(normalizedSearchQuery) ||
                     pEducationLevel.includes(normalizedSearchQuery) ||
                     pWorkStatus.includes(normalizedSearchQuery)||  
                     location.includes(normalizedSearchQuery)||
                     type.includes(normalizedSearchQuery) ||
                     courseEngName.includes(normalizedSearchQuery) ||
                     duration.includes(normalizedSearchQuery) ||
                     payment.includes(normalizedSearchQuery)||
                     agreement.includes(normalizedSearchQuery))
                  : true;
  
              return matchesType && matchesLocation && matchesSearchQuery;
          });
  
          // If filteredDetails is empty, set registerationDetails to an empty array
          this.setState({ registerationDetails: filteredDetails.length > 0 ? filteredDetails : [] });
      }
  }
  
  
    
    handleFocus = (index, payment) => {
      this.setState({
        dropdownVisible: {
          ...this.state.dropdownVisible,
          [index]: true // Show dropdown for the focused input
        },
        inputValues: {
          [index]: "" // Show dropdown for the focused input
        },
        filteredSuggestions: this.getSuggestionsByPaymentType(payment), // Set filtered suggestions based on payment type
      });
    };
  
    getSuggestionsByPaymentType(payment) {
      if (payment === "Cash" || payment === "PayNow") {
        return this.state.cashPaynowSuggestions; // Use Cash/PayNow suggestions
      } else if (payment === "SkillsFuture") {
        return this.state.skillsFutureOptions; // Use SkillsFuture suggestions
      }
      return []; // Default empty suggestions
    }
    
    
    handleInputChange = (event, index) => {
      const value = event.target.value;
    
      // Log the index and value for debugging
      console.log("Index:", index);
      console.log("Value:", value);
    
      // Update only the specific input value
      this.setState(prevState => ({
        inputValues: {
          ...prevState.inputValues,
          [index]: value, // Store input value by index
        },
      }));
    
      // Filter suggestions based on the input value
      const paymentType = this.state.registerationDetails[index]?.course.payment;
      const filteredSuggestions = this.getSuggestionsByPaymentType(paymentType).filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
    
      this.setState(prevState => ({
        filteredSuggestions,
        dropdownVisible: {
          ...prevState.dropdownVisible,
          [index]: true, // Keep the dropdown visible for the focused input
        },
      }));
    };

    handleSuggestionClick = (index, value, id, page) => {
      // Log the index and value for debugging
      console.log("Index:", index);
      console.log("Value:", value);
    
      // Update only the specific input value
      this.setState(prevState => ({
        inputValues: {
          ...prevState.inputValues,
          [index]: value, // Set clicked suggestion as input value
        },
      }));
    
      // Filter suggestions based on the selected suggestion's payment type
      const paymentType = this.state.registerationDetails[index]?.course.payment;
      const filteredSuggestions = this.getSuggestionsByPaymentType(paymentType).filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
    
      // Hide the dropdown after selection
      this.setState(prevState => ({
        filteredSuggestions,
        dropdownVisible: {
          ...prevState.dropdownVisible,
          [index]: false, // Hide dropdown after selection
        },
      }));
    
      // You can uncomment the following if you need to update the database
      this.updateDatabaseForRegistrationPayment(value, id, page);
    };

    updateDatabaseForRegistrationPayment = async (value, id, page) => {
      console.log(value, id);
      return axios
        .post('http://localhost:3001/courseregistration', { purpose: 'update', id: id, status: value })
        .then(response => {
          if(response.data.result ===  true)
          {
            this.updateWooCommerceForRegistrationPayment(value, page)
          }
        })
        .catch(error => {
          console.error('Error fetching course registrations:', error);
          return []; // Return an empty array in case of error
        });
      /*return axios
        .post('https://moses-course-testing-dqghhsbcgseccyfa.japaneast-01.azurewebsites.net/courseregistration', { purpose: 'update', id: id, status: value })
        .then(response => {
          if(response.data.result ===  true)
          {
            this.updateWooCommerceForRegistrationPayment(value, page)
          }
        })
        .catch(error => {
          console.error('Error fetching course registrations:', error);
          return []; // Return an empty array in case of error
        });*/
    };

    updateWooCommerceForRegistrationPayment(value, page)
    {
      console.log("WooCommerce");
      axios
        .post('http://localhost:3001/courses', { type: 'update', page: page, status: value })
        .then(response => {
          if(response.data.result ===  true)
          {
           
          }
        })
        .catch(error => {
          console.error('Error fetching course registrations:', error);
          return []; // Return an empty array in case of error
        });
      /* axios
        .post('https://moses-course-testing-dqghhsbcgseccyfa.japaneast-01.azurewebsites.net/courses', { type: 'update', page: page, status: value })
        .then(response => {
          if(response.data.result ===  true)
          {
           
          }
        })
        .catch(error => {
          console.error('Error fetching course registrations:', error);
          return []; // Return an empty array in case of error
        });*/
    }
    
    handleBlur = (index) => {
      var currentInput = this.state.inputValues[index] || ""; // Get the current input value, default to an empty string
    
      // Check if the input is empty
      if (currentInput === "") {
        this.setState({
          inputValues: {
            ...this.state.inputValues,
            [index]: "Pending", // Set to "Pending" if empty
          },
          dropdownVisible: {
            ...this.state.dropdownVisible,
            [index]: false, // Hide the dropdown
          },
        });
      } else {
        // If input is not empty, just hide the dropdown
        this.setState(prevState => ({
          dropdownVisible: {
            ...prevState.dropdownVisible,
            [index]: false, // Hide the dropdown
          },
        }));
      }
    };

      // Method to get all locations
      getAllLocations(datas) {
        return [...new Set(datas.map(data => {
          return data.course.courseLocation;
        }))];
      }
  
      // Method to get all languages
      getAllType(datas) {
        return [...new Set(datas.map(data => {
          return data.course.courseType;
        }))];
      }
    

    render() {
      const { hideAllCells, registerationDetails, filteredSuggestions, currentInput, showSuggestions, focusedInputIndex } = this.state;
      const paginatedDetails = this.getPaginatedDetails();
      return (
        <div className="registration-payment-container">
          <div className="registration-payment-heading">
            <h1>{this.props.language === 'zh' ? '报名与支付' : 'Registration And Payment'}</h1>
            <div className="table-wrapper" ref={this.tableRef}>
              <table>
                <thead>
                  <tr>
                    <th colSpan="11">{this.props.language === 'zh' ? '参与者' : 'Participants'}</th>
                    <th colSpan="5">{this.props.language === 'zh' ? '课程' : 'Courses'}</th>
                    <th>{this.props.language === 'zh' ? '其他' : 'Others'}</th>
                    <th>{this.props.language === 'zh' ? '确认状态' : 'Confirmation Status'}</th>
                  </tr>
                  <tr>
                    <th>{this.props.language === 'zh' ? '名字' : 'Name'}</th>
                    <th>{this.props.language === 'zh' ? 'NRIC' : 'NRIC'}</th>
                    <th>{this.props.language === 'zh' ? '居住状态' : 'Residential Status'}</th>
                    <th>{this.props.language === 'zh' ? '种族' : 'Race'}</th>
                    <th>{this.props.language === 'zh' ? '性别' : 'Gender'}</th>
                    <th>{this.props.language === 'zh' ? '出生日期' : 'Date Of Birth'}</th>
                    <th>{this.props.language === 'zh' ? '联系电话' : 'Contact Number'}</th>
                    <th>{this.props.language === 'zh' ? '电子邮件' : 'Email'}</th>
                    <th>{this.props.language === 'zh' ? '邮政编码' : 'Postal Code'}</th>
                    <th>{this.props.language === 'zh' ? '教育水平' : 'Education Level'}</th>
                    <th>{this.props.language === 'zh' ? '工作状态' : 'Work Status'}</th>
                    <th>{this.props.language === 'zh' ? '类型' : 'Type'}</th>
                    <th>{this.props.language === 'zh' ? '课程名' : 'Name'}</th>
                    <th>{this.props.language === 'zh' ? '地点' : 'Location'}</th>
                    <th>{this.props.language === 'zh' ? '时长' : 'Duration'}</th>
                    <th>{this.props.language === 'zh' ? '支付方式' : 'Payment Method'}</th>
                    <th>{this.props.language === 'zh' ? '协议' : 'Agreement'}</th>
                    <th>{this.props.language === 'zh' ? '支付' : 'Payment'}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDetails.map((item, index) => (
                    <tr key={index}>
                      <td>{item.participant.name}</td>
                      <td>{item.participant.nric}</td>
                      <td>{item.participant.residentialStatus}</td>
                      <td>{item.participant.race}</td>
                      <td>{item.participant.gender}</td>
                      <td>{item.participant.dateOfBirth}</td>
                      <td>{item.participant.contactNumber}</td>
                      <td>{item.participant.email}</td>
                      <td>{item.participant.postalCode}</td>
                      <td>{item.participant.educationLevel}</td>
                      <td>{item.participant.workStatus}</td>
                      <td>{item.course.courseType}</td>
                      <td>{item.course.courseEngName}</td>
                      <td>{item.course.courseLocation}</td>
                      <td>{item.course.courseDuration}</td>
                      <td>{item.course.payment}</td>
                      <td>{item.agreement}</td>
                      <td>
                      {
                      !hideAllCells && (
                          <div className="input-container" style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={this.state.inputValues[index]} // Use index-specific value from inputValues
                              onChange={(e) => this.handleInputChange(e, index)} // Pass index for specific input
                              onFocus={() => this.handleFocus(index, item.course.payment)} // Pass index to focus handler
                              onMouseDown={() => this.handleBlur(index)} // Pass index to blur handler
                              placeholder="Type here..."
                            />
                            {this.state.dropdownVisible[index] && this.state.filteredSuggestions.length > 0 && (
                              <ul className="suggestions-list">
                                {this.state.filteredSuggestions.map((suggestion, idx) => (
                                  <li
                                    key={idx}
                                    onClick={() => {
                                      var coursePage = `${item.course.courseChiName}<br />${item.course.courseEngName}<br />(${item.course.courseLocation})`;
                                      coursePage = coursePage.replace(/–/g, "-");
                                      this.handleSuggestionClick(index, suggestion, item._id, coursePage);
                                    }}
                                  >
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
  }

  export default RegistrationPaymentSection;
