import React, { Component } from 'react';
import axios from 'axios';
import '../../../css/sub/receipt.css';

class ReceiptSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideAllCells: false,
      registerationDetails: [],
      isLoading: true,
      inputValues: {},
      dropdownVisible: {}, // Store input values for each row
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

  fetchReceipt = async() =>
  {
    var response = await axios.post(`http://localhost:3001/receipt`, { "purpose": "retrieve"});
    return response.data.result
  }


  async componentDidMount() 
  {
    const { language } = this.props;
    var data = await this.fetchReceipt();
    console.log(data);
    this.props.closePopup();
    //console.log('Data:', data);
    /*var locations = this.getAllLocations(data);
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
  
    this.props.closePopup();*/
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
          <h1>{this.props.language === 'zh' ? '' : 'Receipt'}</h1>
          <div className="table-wrapper" ref={this.tableRef}>
            <table>
              <thead>
                <tr>
                  <th>{this.props.language === 'zh' ? '' : 'Receipt Number'}</th>
                  <th>{this.props.language === 'zh' ? '' : 'Receipt'}</th>
                  <th>{this.props.language === 'zh' ? '' : 'Staff Created'}</th>
                  <th>{this.props.language === 'zh' ? '' : 'Date Created'}</th>
                  <th>{this.props.language === 'zh' ? '' : 'Time Created'}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{item.receiptNo}</td>
                    <td>{item.url}</td>
                    <td>{item.staff}</td>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
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

export default ReceiptSection;
