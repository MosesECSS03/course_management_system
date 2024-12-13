  import React, { Component } from 'react';
  import axios from 'axios';
  import '../../../css/sub/registrationPayment.css';
  import * as XLSX from 'xlsx';
  import ExcelJS from 'exceljs';
  import Popup from '../popup/popupMessage';

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
        skillsFutureOptions: ["Pending", "Generate Invoice Number", "Paid", "Cancelled"], // SkillsFuture specific options
        filteredSuggestions: [],
        focusedInputIndex: null,
        originalData: [],
        currentPage: 1, // Add this
        entriesPerPage: 100, // Add this
        remarks: {}, // Remarks for each row
      };
      this.tableRef = React.createRef();
    }

    handleInputChange1 = (e, id) => {
      const { value } = e.target;
      this.setState((prevState) => ({
        remarks: {
          ...prevState.remarks,
          [id]: value, // Use item._id as key
        },
      }));
    };
  
    handleSubmit = async (id, index) => {
      const remark = this.state.remarks[index];
      console.log("handleRemarks:", id, remark);
    
      this.props.updateRemarksPopup();
    
      // Perform the submit action here, e.g., API call
      try {
        /*const response = await axios.post(
          'http://localhost:3001/courseregistration', 
          { 
            purpose: 'updateRemarks', 
            id: id, 
            remarks: remark, 
            staff: this.props.userName 
          }
        );*/
        const response = await axios.post(
          'https://moses-ecss-backend.azurewebsites.net/courseregistration', 
          { 
            purpose: 'updateRemarks', 
            id: id, 
            remarks: remark, 
            staff: this.props.userName 
          }
        );
    
        console.log("handleSubmit:", response.data);
        if (response.data.result.success === true) {
          this.props.closePopup();
          this.props.refreshChild();
        } else {
          // Handle unsuccessful submission if needed
          this.props.closePopup();
          this.props.refreshChild();
        }
      } catch (error) {
        console.error('Error during submission:', error);
        this.props.closePopup();
        this.props.refreshChild();
      }
    };
    

    handleEntriesPerPageChange = (e) => {
      this.setState({
        entriesPerPage: parseInt(e.target.value, 100),
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

    fetchCourseRegistrations = async (language) => {
      try {
        const response = await axios.post(
          'https://moses-ecss-backend.azurewebsites.net/courseregistration', 
          { purpose: 'retrieve' }
        );
        /*const response = await axios.post(
          'http://localhost:3001/courseregistration', 
          { purpose: 'retrieve' }
        );*/

        console.log("Course Registration:", response);
    
        const array = this.languageDatabase(response.data.result, language);
        return array;
    
      } catch (error) {
        console.error('Error fetching course registrations:', error);
        return []; // Return an empty array in case of error
      }
    };

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
      var locations = await this.getAllLocations(data);
      var types = await this.getAllType(data);
      this.props.passDataToParent(locations, types);

      const statuses = data.map(item => item.status); // Extract statuses
      console.log('Statuses:', statuses); // Log the array of statuses
      
      await this.props.getTotalNumberofDetails(data.length);

      // Initialize inputValues for each index based on fetched data
      const inputValues = {};
      data.forEach((item, index) => {
        inputValues[index] = item.status || "Pending"; // Use item.status or default to "Pending"
      });

      const inputValues1 = {};
      data.forEach((item, index) => {
        inputValues1[index] = item.official.remarks; // Use item.status or default to "Pending"
      });

      this.setState({
        originalData: data,
        registerationDetails: data, // Update with fetched dat
        isLoading: false, // Set loading to false after data is fetche
        inputValues: inputValues,  // Show dropdown for the focused input
        remarks: inputValues1,  // Show dropdown for the focused input
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
          console.log("normalizedSearchQuery:", normalizedSearchQuery);

  
          const filteredDetails = originalData.filter(data => {
              // Extract participant properties
              const pName = data.participant.name.toLowerCase().trim() || ""; 
              const pNric = data.participant.nric.toLowerCase().trim() || ""; 
              const pRS = data.participant.residentialStatus.toLowerCase().trim() || ""; // Fixed to avoid calling it as a function
              const pRace = data.participant.race.toLowerCase().trim() || ""; // Assuming race is a string
              const pGender = data.participant.gender.toLowerCase().trim() || "";
              const pDateOfBirth = data.participant.dateOfBirth.toLowerCase().trim() || ""; // Ensure correct formatting if needed
              const pContactNumber = data.participant.contactNumber.toLowerCase().trim() || "";
              const pEmail = data.participant.email.toLowerCase().trim() || "";
              const pPostalCode = data.participant.postalCode || "";
              const pEducationLevel = data.participant.educationLevel.toLowerCase().trim() || "";
              const pWorkStatus = data.participant.workStatus.toLowerCase().trim() || "";

              // Extract course properties
              const location = data.course.courseLocation.toLowerCase().trim() || ""; 
              const type = data.course.courseType.toLowerCase().trim() || "";
              const courseEngName = data.course.courseEngName.toLowerCase().trim() || "";
              const duration = data.course.courseDuration.toLowerCase().trim() || "";
              const payment = data.course.payment.toLowerCase().trim() || "";
              const agreement = data.agreement.toLowerCase().trim() || "";

              //Extract official properties
              const status = data.status.toLowerCase().trim() || ""; 
              console.log("Status:", status)
              const oName = data.official?.name?.toLowerCase().trim() || "";
              const oDate = data.official?.date?.toLowerCase().trim() || "";
              const oTime = data.official?.time?.toLowerCase().trim() || ""
  
              // Match 'All Languages' and 'All Locations'
              const matchesLocation = selectedLocation === "All Locations" || 
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
                     agreement.includes(normalizedSearchQuery) ||
                     status.includes(normalizedSearchQuery) ||
                     oName.includes(normalizedSearchQuery) ||
                     oDate.includes(normalizedSearchQuery) ||
                     oTime.includes(normalizedSearchQuery))
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

    handleSuggestionClick = (index, value, id, page, item) => {
      this.props.updatePaymentPopup();
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
      this.updateDatabaseForRegistrationPayment(value, id, page, item);
    };

    updateDatabaseForRegistrationPayment = async (value, id, page, item) => {
      console.log(value, id);
     return axios
        .post('https://moses-ecss-backend.azurewebsites.net/courseregistration', { purpose: 'update', id: id, status: value })
        .then(response => {
          console.log("Update Database", response);
          if(response.data.result ===  true)
          {
            if(value === "Paid")
            {
              this.updateWooCommerceForRegistrationPayment(value, id, page, item);
            }
            else if(value === "Generate Invoice Number")
            {
              //Generate Invoice Number 
              console.log("Invoice Number Generating")
              this.receiptGenerator(item, value)
            }
          }
        })
      /*return axios
        .post('http://localhost:3001/courseregistration', { purpose: 'update', id: id, status: value })
        .then(response => {
          if(response.data.result ===  true)
          {
            this.updateWooCommerceForRegistrationPayment(value, id, page)
          }
        })*/
        .catch(error => {
          console.error('Error fetching course registrations:', error);
          return []; // Return an empty array in case of error
        });
    };

    updateWooCommerceForRegistrationPayment = async (value, id, page, item) =>
    {
      console.log("WooCommerce", value, page,id);
      axios.post('https://moses-ecss-data.azurewebsites.net/update_stock/', {page: page, status: value })
      //axios.post('http://localhost:3002/update_stock/', { type: 'update', page: page, status: value })
        .then(response => {
          console.log("Update Woo Commerce", response.data);
          if(response.data.success ===  true)
          {
            console.log(this.props);
            axios.post('https://moses-ecss-backend.azurewebsites.net/courseregistration', { purpose: 'updatePayment', page: page, registration_id: id, staff: this.props.userName, status: value}).then(response => {
            //axios.post('http://localhost:3001/courseregistration', { purpose: 'updatePayment', page: page, registration_id: id, staff: this.props.userName, status: value}).then(response => {
              if(response.data.result ===  true)
              {
                //this.props.createAccountPopupMessage(true, response.data.message, response.data.message);
                //this.props.refreshChild();
                if(value === "Paid")
                {
                  this.receiptGenerator(item, value);
                }
              }
              }).catch(error => {
                console.error('Error fetching course registrations:', error);
                return []; // Return an empty array in case of error
              });
            //var updateResult = await 
          }
        })
        .catch(error => {
          console.error('Error fetching course registrations:', error);
          return []; // Return an empty array in case of error
        });
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
      getAllLocations = async (datas) => {
        return [...new Set(datas.map(data => {
          //console.log(data.course)
          return data.course.courseLocation;
        }))];
      }
  
      // Method to get all languages
      getAllType = async (datas) => {
        return [...new Set(datas.map(data => {
          return data.course.courseType;
        }))];
      }

      receiptGenerator = async (rowDataArray, value) => {
        console.log("Selected:", rowDataArray, value);
        if(value === "Paid")
        {
          this.props.generateReceiptPopup();
        }
        else if(value === "Generate Invoice Number")
        {
          this.props.generateInvoiceNumber();
        }
            if (
                (rowDataArray.course.payment === "Cash" || 
                 rowDataArray.course.payment === "PayNow" || 
                 rowDataArray.course.payment === "SkillsFuture") && 
                (rowDataArray.status === "Paid" || rowDataArray.status === "Generate Invoice Number")&& 
                rowDataArray.official.name !== null ) {
                try {
                    console.log("Generating Receipt for:", rowDataArray._id);
                    console.log("Payment Method:", rowDataArray.course.payment);
                    const registration_id = rowDataArray._id;
                    let receiptNo = "";
                    let response;
    
                    // Check if there's an existing receipt number
                    if (rowDataArray.official.receiptNo === "") {
                        // Get a new receipt number if not available
                        const courseLocation = (rowDataArray.course.payment !== "SkillsFuture") 
                            ? rowDataArray.course?.courseLocation 
                            : 'ECSS/SFC/'; // Use 'SFC' for SkillsFuture payments
    
                       response = await axios.post(
                            'https://moses-ecss-backend.azurewebsites.net/receipt',
                            {
                                purpose: 'getReceiptNo',
                                courseLocation: courseLocation
                            }
                        );

                        /*response = await axios.post(
                          'http://localhost:3001/receipt',
                          {
                              purpose: 'getReceiptNo',
                              courseLocation: courseLocation
                          }
                      );*/
                        console.log("Get receipt number:", response.data);
                        receiptNo = response.data.result.receiptNumber;
                    } else {
                        // Use the existing receipt number
                        receiptNo = rowDataArray.official.receiptNo;
                    }
    
                      if (response?.data?.result?.success) 
                      {
                        // Fetch the PDF receipt
                        const pdfResponse = await axios.post(
                            'https://moses-ecss-backend.azurewebsites.net/courseregistration',
                            {
                                purpose: 'receipt',
                                rowData: rowDataArray,
                                staff: this.props.userName,
                                receiptNo: receiptNo, 
                                status: value
                            },
                            { responseType: 'blob' }
                        );
                        /*const pdfResponse = await axios.post(
                          'http://localhost:3001/courseregistration',
                          {
                              purpose: 'receipt',
                              rowData: rowDataArray,
                              staff: this.props.userName,
                              receiptNo: receiptNo
                          },
                          { responseType: 'blob' }
                      );*/
                        console.log("pdfResponse:", pdfResponse);
                        if(value === "Paid")
                        {
                          // Extract filename from Content-Disposition header
                          const contentDisposition = pdfResponse.headers['content-disposition'];
                          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                          let filename = filenameMatch && filenameMatch[1] ? filenameMatch[1].replace(/['"]/g, '') : 'unknown.pdf';
      
                          console.log(`Filename: ${filename}`);
      
                          // Create a Blob for the PDF
                          const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
                          const url = window.URL.createObjectURL(blob);
      
                          // Open PDF in a new tab
                          const pdfWindow = window.open();
                          pdfWindow.location.href = url;
      
                          // Create the receipt in the database
                          const receiptCreationResponse = await axios.post(
                              'https://moses-ecss-backend.azurewebsites.net/receipt',
                              {
                                  purpose: 'createReceipt',
                                  receiptNo: receiptNo,
                                  registration_id: registration_id,
                                  url: url,
                                  staff: this.props.userName
                              }
                          );
                          /*const receiptCreationResponse = await axios.post(
                            'http://localhost:3001/receipt',
                            {
                                purpose: 'createReceipt',
                                receiptNo: receiptNo,
                                registration_id: registration_id,
                                url: url,
                                staff: this.props.userName
                            }
                        );*/
                          console.log("Receipt Created:", receiptCreationResponse.data);
                      } 
                    }
                    else 
                    {
                      const pdfResponse = await axios.post(
                            'https://moses-ecss-backend.azurewebsites.net/courseregistration',
                            {
                                purpose: 'receipt',
                                rowData: rowDataArray,
                                staff: this.props.userName,
                                receiptNo: receiptNo
                            },
                            { responseType: 'blob' }
                        );
                        /*const pdfResponse = await axios.post(
                          'http://localhost:3001/courseregistration',
                          {
                              purpose: 'receipt',
                              rowData: rowDataArray,
                              staff: this.props.userName,
                              receiptNo: receiptNo
                          },
                          { responseType: 'blob' }
                      );*/
                        console.log("pdfResponse:", pdfResponse);

                        // Extract filename from Content-Disposition header
                        const contentDisposition = pdfResponse.headers['content-disposition'];
                        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                        let filename = filenameMatch && filenameMatch[1] ? filenameMatch[1].replace(/['"]/g, '') : 'unknown.pdf';

                        console.log(`Filename: ${filename}`);

                        // Create a Blob for the PDF
                        const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);

                        // Open PDF in a new tab
                        const pdfWindow = window.open();
                        pdfWindow.location.href = url;
                  }
    
                    // Close the popup and refresh
                    this.props.closePopup();
                    this.props.refreshChild();
                } catch (error) {
                    console.error('Error during receipt generation process:', error);
                }
            }
    };
    
    
    async saveData(paginatedDetails) {
        console.log("Save Data:", paginatedDetails);
    
        // Prepare the data for Excel
        const preparedData = [];

        // Define the sub-headers
        const headers = [
            "Participant Name", "Participant NRIC", "Participant Residential Status", "Participant Race", "Participant Gender", "Participant Date of Birth",
            "Participant Contact Number", "Participant Email", "Participant Postal Code", "Participant Education Level", "Participant Work Status",
            "Course Type", "Course English Name", "Course Chinese Name", "Course Location",
            "Course Price", "Course Duration", "Payment", "Agreement", "Payment Status",
            "Staff Name", "Received Date", "Received Time", "Receipt/Inovice Number", "Remarks"
        ];
    
        preparedData.push(headers);
    
        // Add the values
        paginatedDetails.forEach(detail => {
            const row = [
                detail.participant.name,
                detail.participant.nric,
                detail.participant.residentialStatus,
                detail.participant.race,
                detail.participant.gender,
                detail.participant.dateOfBirth,
                detail.participant.contactNumber,
                detail.participant.email,
                detail.participant.postalCode,
                detail.participant.educationLevel,
                detail.participant.workStatus,
                detail.course.courseType,
                detail.course.courseEngName,
                detail.course.courseChiName,
                detail.course.courseLocation,
                detail.course.coursePrice,
                detail.course.courseDuration,
                detail.course.payment,
                detail.agreement,
                detail.status,
                detail.official?.name,
                detail.official?.date,
                detail.official?.time,
                detail.official?.receiptNo,
                detail.official?.remarks
            ];
            preparedData.push(row);
        });
    
        // Convert the prepared data into a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(preparedData);
    
        // Create a new workbook and add the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Exported Data");

        // Prompt user for filename input
        var date = new Date();
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
        const fileName = `exported data ${formattedDate}`;
    
        // Generate a binary string
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
        // Create a blob from the binary string
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
    
        // Create a link element for downloading
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${fileName}.xlsx`; // Specify the file name with .xlsx extension
        link.click(); // Trigger the download
      }

    convertDateFormat1(dateString) {
      const months = {
        January: '01',
        February: '02',
        March: '03',
        April: '04',
        May: '05',
        June: '06',
        July: '07',
        August: '08',
        September: '09',
        October: '10',
        November: '11',
        December: '12'
      };
    
      // Split the date string into parts
      const [day, fullMonth, year] = dateString.split(' ');
    
      const monthNumber = months[fullMonth];
    
      if (!monthNumber) {
        return 'Invalid date format'; // Handle invalid month names
      }  
      // Return the date in the dd/mm/yyyy format
      return `${day.toString().padStart(2, '0')}/${monthNumber.toString().padStart(2, '0')}/${year.toString().padStart(4, '0')}`;
    }

    handleEdit = async(item, index) =>
    {
      this.props.showEditPopup(item)
    }

    convertDateFormat(dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month (0-based index)
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    }

    exportToLOP = async (paginatedDetails) => {
      const fileInput = document.getElementById('fileInput');
  
      if (!fileInput.files.length) {
          return this.props.warningPopUpMessage("Please select an Excel file first!");
      }
  
      const file = fileInput.files[0];
      console.log(file);

      const data = await file.arrayBuffer();
  
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
  
      const sourceSheet = workbook.getWorksheet('LOP');
      if (!sourceSheet) {
        return this.props.warningPopUpMessage("Sheet 'LOP' not found!");
      }
  
      const originalRow = sourceSheet.getRow(9);
      const startRow = 9;

      console.log("Paginated Details:", paginatedDetails, paginatedDetails.length);
  
      paginatedDetails.forEach((detail, index) => {
        if(detail.course.courseType === "NSA")
        {
          const rowIndex = startRow + index;
          const newDataRow = sourceSheet.getRow(rowIndex);
          newDataRow.height = originalRow.height;
  
          // Populate cells with data from `detail`
          sourceSheet.getCell(`A${rowIndex}`).value = rowIndex - startRow + 1;
          sourceSheet.getCell(`B${rowIndex}`).value = detail.participant.name;
          sourceSheet.getCell(`C${rowIndex}`).value = detail.participant.nric;
          sourceSheet.getCell(`D${rowIndex}`).value = detail.participant.residentialStatus.substring(0, 2);
          
          const [day, month, year] = detail.participant.dateOfBirth.split("/");
          sourceSheet.getCell(`E${rowIndex}`).value = day.trim();
          sourceSheet.getCell(`F${rowIndex}`).value = month.trim();
          sourceSheet.getCell(`G${rowIndex}`).value = year.trim();
          
          sourceSheet.getCell(`H${rowIndex}`).value = detail.participant.gender.split(" ")[0];
          sourceSheet.getCell(`I${rowIndex}`).value = detail.participant.race .split(" ")[0];
          sourceSheet.getCell(`J${rowIndex}`).value = detail.participant.contactNumber;
          sourceSheet.getCell(`K${rowIndex}`).value = detail.participant.email;
          sourceSheet.getCell(`L${rowIndex}`).value = detail.participant.postalCode;
  
          const educationParts = detail.participant.educationLevel.split(" ");
          if(educationParts.length === 3)
          {
            sourceSheet.getCell(`M${rowIndex}`).value = educationParts[0]+" "+educationParts[1];
          }
          else
          {
            sourceSheet.getCell(`M${rowIndex}`).value = educationParts[0];
          }

          const workParts = detail.participant.workStatus.split(" ");
          if(workParts.length === 3)
          {
            sourceSheet.getCell(`N${rowIndex}`).value =  workParts[0]+" "+workParts[1];
          }
          else
          {
            sourceSheet.getCell(`N${rowIndex}`).value = workParts[0];
          }
  
          sourceSheet.getCell(`O${rowIndex}`).value = detail.course.courseEngName.split("–")[0].trim();
  
          const [startDate, endDate] = detail.course.courseDuration.split(" - ");
          sourceSheet.getCell(`P${rowIndex}`).value = this.convertDateFormat1(startDate);
          sourceSheet.getCell(`Q${rowIndex}`).value = this.convertDateFormat1(endDate);
  
          sourceSheet.getCell(`R${rowIndex}`).value = detail.course.coursePrice;
          sourceSheet.getCell(`S${rowIndex}`).value = detail.course.payment === "SkillsFuture" ? "SFC" : detail.course.payment;
          sourceSheet.getCell(`V${rowIndex}`).value = detail.official.receiptNo
          // Copy styles from the original row

          originalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              const newCell = newDataRow.getCell(colNumber);
              newCell.style = cell.style;
          });
        }
      });
  
      const originalFileName = file.name.replace('.xlsx', '_new.xlsx');
      const buffer = await workbook.xlsx.writeBuffer();
  
      const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
  
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.props.refreshChild();
  };
  
    render() {
      const { isDisabled, remarks, hideAllCells, registerationDetails, filteredSuggestions, currentInput, showSuggestions, focusedInputIndex } = this.state;
      const paginatedDetails = this.getPaginatedDetails();
      return (
        <>
        <div className="registration-payment-container">
          <div className="registration-payment-heading">
            <h1>{this.props.language === 'zh' ? '报名与支付' : 'Registration And Payment'}</h1>
            <div className="button-row3">
              <button onClick={() => this.saveData(paginatedDetails)}>Save Data</button>             
              <div className="file-input-wrapper">
                <input type="file" id="fileInput" accept=".xlsx, .xls" className="file-input" />
                <label htmlFor="fileInput" className="custom-file-input">Select File</label>
              </div>            
              <button onClick={() => this.exportToLOP(paginatedDetails)}>Export To LOP</button>
            </div>
            <div className="table-wrapper" style={{marginLeft: '8%', height: '40vh'}}>
            <table style={{borderCollapse: 'collapse', width: '300%'}} ref={this.tableRef}>
                <thead>
                  <tr>
                    <th colSpan="5">{this.props.language === 'zh' ? '参与者' : 'Participants'}</th>
                    <th colSpan="5">{this.props.language === 'zh' ? '课程' : 'Courses'}</th>
                    <th>{this.props.language === 'zh' ? '其他' : 'Others'}</th>
                    <th>{this.props.language === 'zh' ? '确认状态' : 'Confirmation Status'}</th>
                    <th colSpan="6">{this.props.language === 'zh' ? '' : 'For Official Uses'}</th>
                  </tr>
                  <tr>
                   <th style={{width: '0.01%'}}>{this.props.language === 'zh' ? '' : 'S/N'}</th>
                    <th style={{width: '0.02%'}}>{this.props.language === 'zh' ? '名字' : 'Name'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? 'NRIC' : 'NRIC'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '性别' : 'Gender'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '出生日期' : 'Date Of Birth'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '' : 'Contact Number'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '课程名' : 'Name'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '地点' : 'Location'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '时长' : 'Duration'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '支付方式' : 'Payment Method'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '协议' : 'Agreement'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '支付' : 'Payment Status'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '' : 'Staff Name'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '' : 'Date Received'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '' : 'Time Received'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '' : 'Receipt/Invoice Number'}</th>
                    <th style={{width: '1%'}}>{this.props.language === 'zh' ? '' : 'Remarks'}</th>
                    <th style={{width: '0.2%'}}>{this.props.language === 'zh' ? '' : 'Update/Edit'}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDetails.map((item, index) => (
                    <tr key={index}>
                       <td>{index+1}</td>
                      <td >{item.participant.name}</td>
                      <td>{item.participant.nric}</td>
                      <td>{item.participant.gender}</td>
                      <td>{item.participant.dateOfBirth}</td>
                      <td>{item.participant.contactNumber}</td>
                      <td>
                      {item.course.courseEngName.includes('Protected: ')
                        ? item.course.courseEngName.replace('<br />Protected: ', '')
                        : item.course.courseEngName}
                      </td>
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
                              onBlur={() => this.handleBlur(index)} // Pass index to blur handler
                              placeholder="Type here..."
                            />
                            {this.state.dropdownVisible[index] && this.state.filteredSuggestions.length > 0 && (
                              <ul className="suggestions-list">
                                {this.state.filteredSuggestions.map((suggestion, idx) => (
                                  <li
                                    key={idx}
                                    onMouseDown={(event) => {
                                      event.stopPropagation();
                                      var coursePage = `${item.course.courseChiName}<br />${item.course.courseEngName}<br />(${item.course.courseLocation})`;
                                      coursePage = coursePage.replace(/–/g, "-");
                                      this.handleSuggestionClick(index, suggestion, item._id, coursePage, item);
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
                      <td>{item.official?.name}</td>
                      <td>{item.official?.date}</td>                      
                      <td>{item.official?.time}</td>
                      <td>{item.official?.receiptNo}</td>                      
                      <td style={{ width: '20vw', padding: '0', overflow: 'hidden' }}>
                      <input
                          type="text"
                          value={this.state.remarks[index]}
                          maxLength={1000}
                          onChange={(e) => this.handleInputChange1(e, index)}
                          style={{
                            width: '70%',
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box',
                            whiteSpace: 'nowrap',
                            marginTop: '0.5em'
                          }}
                        />
                        <br/>
                        <button
                          onClick={() => this.handleSubmit(item._id, index)}
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            color: '#fff',
                            border: 'none',
                            marginBottom: '0.5em',
                            width:"fit-content"
                          }}
                        >
                          Submit
                        </button>
                        {this.state.errorMessage && <div className="error-message1">{this.state.errorMessage}</div>}
                      </td>
                      <td>
                      <button
                          onClick={() => this.handleEdit(item, index)}
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            color: '#fff',
                            border: 'none',
                            marginBottom: '0.5em',
                            marginLeft: '2em',
                            width: '50%'
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
      );
    }
  }

  export default RegistrationPaymentSection;
