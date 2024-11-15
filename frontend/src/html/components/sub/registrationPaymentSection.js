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
        skillsFutureOptions: ["Pending", "Paid", "Cancelled"], // SkillsFuture specific options
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
  
    // Handle the submit action for a specific row
    handleSubmit = async (id, index) => {
      this.props.updateRemarksPopup();
      const remark = this.state.remarks[index];
      // Perform the submit action here, e.g., API call
      //console.log(`Submitting remark for item with id ${id}:`, remark);

      const response = await axios.post(
        'https://moses-ecss-backend.azurewebsites.net/courseregistration', 
        { purpose: 'updateRemarks', id: id, remarks: remark, staff: this.props.userName }
      );
      console.log("handleSubmit:", response.data);
      if(response.data.result.success === true)
      {
        this.props.closePopup();
        this.props.refreshChild();
      }
      else
      {
        this.props.closePopup();
      }
    }
    


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
      await this.props.passDataToParent(locations, types);

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
      this.updateDatabaseForRegistrationPayment(value, id, page);
    };

    updateDatabaseForRegistrationPayment = async (value, id, page) => {
      console.log(value, id);
     return axios
        .post('https://moses-ecss-backend.azurewebsites.net/courseregistration', { purpose: 'update', id: id, status: value })
        .then(response => {
          if(response.data.result ===  true)
          {
            this.updateWooCommerceForRegistrationPayment(value, id, page)
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

    updateWooCommerceForRegistrationPayment = async (value, id, page) =>
    {
      console.log("WooCommerce");
      axios.post('https://moses-ecss-backend.azurewebsites.net/courses', { type: 'update', page: page, status: value })
     // axios.post('http://localhost:3001/courses', { type: 'update', page: page, status: value })
        .then(response => {
          console.log("Update Woo Commerce", response.data);
          if(response.data.result ===  true)
          {
            console.log(this.props);
            axios.post('https://moses-ecss-backend.azurewebsites.net/courseregistration', { purpose: 'updatePayment', page: page, registration_id: id, staff: this.props.userName, status: value}).then(response => {
            //axios.post('http://localhost:3001/courseregistration', { purpose: 'updatePayment', page: page, registration_id: id, staff: this.props.userName, status: value}).then(response => {
              if(response.data.result ===  true)
              {
                //this.props.createAccountPopupMessage(true, response.data.message, response.data.message);
                this.props.refreshChild();
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

      receiptGenerator = async (event, rowData) => {
        event.stopPropagation();
        this.props.generateReceiptPopup();
    
        const rowDataArray = Array.isArray(rowData) ? rowData : [rowData];
    
        for (var i = 0; i < rowDataArray.length; i++) {
            if (
                (rowDataArray[i].course.payment === "Cash" || 
                 rowDataArray[i].course.payment === "PayNow" || 
                 rowDataArray[i].course.payment === "SkillsFuture") && 
                rowDataArray[i].status === "Paid" && 
                rowDataArray[i].official.name !== null
            ) {
                try {
                    console.log("Generating Receipt for:", rowDataArray[i]._id);
                    console.log("Payment Method:", rowDataArray[i].course.payment);
                    const registration_id = rowDataArray[i]._id;
                    let receiptNo = "";
                    let response;
    
                    // Check if there's an existing receipt number
                    if (rowDataArray[i].official.receiptNo === "") {
                        // Get a new receipt number if not available
                        const courseLocation = (rowDataArray[i].course.payment !== "SkillsFuture") 
                            ? rowDataArray[i].course?.courseLocation 
                            : 'SFC'; // Use 'SFC' for SkillsFuture payments
    
                        response = await axios.post(
                            'https://moses-ecss-backend.azurewebsites.net/receipt',
                            {
                                purpose: 'getReceiptNo',
                                courseLocation: courseLocation
                            }
                        );
                        console.log("Get receipt number:", response.data);
                        receiptNo = response.data.result.receiptNumber;
                    } else {
                        // Use the existing receipt number
                        receiptNo = rowDataArray[i].official.receiptNo;
                    }
    
                    if (response?.data?.result?.success) {
                        // Fetch the PDF receipt
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
                        console.log("Receipt Created:", receiptCreationResponse.data);
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
        const fileName = prompt("Please enter the file name (without extension):", "paginated_data") || 'exported_data';
    
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

    convertDateFormat(dateString) {
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

    exportToLOP = async (paginatedDetails) => {
      const fileInput = document.getElementById('fileInput');
  
      if (!fileInput.files.length) {
          alert("Please select an Excel file first!");
          return;
      }
  
      const file = fileInput.files[0];
      const data = await file.arrayBuffer();
  
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
  
      const sourceSheet = workbook.getWorksheet('LOP');
      if (!sourceSheet) {
          alert(`Sheet "LOP" not found!`);
          return;
      }
  
      const originalRow = sourceSheet.getRow(9);
      const startRow = 9;
  
      paginatedDetails.forEach((detail, index) => {
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
          
          sourceSheet.getCell(`H${rowIndex}`).value = detail.participant.gender;
          sourceSheet.getCell(`I${rowIndex}`).value = detail.participant.race[0];
          sourceSheet.getCell(`J${rowIndex}`).value = detail.participant.contactNumber;
          sourceSheet.getCell(`K${rowIndex}`).value = detail.participant.email;
          sourceSheet.getCell(`L${rowIndex}`).value = detail.participant.postalCode;
  
          const educationParts = detail.participant.educationLevel.split(" ");
          if(educationParts.length === 3)
          {
            sourceSheet.getCell(`M${rowIndex}`).value = educationParts.slice(0, 2).join(" ");
          }
          else
          {
            sourceSheet.getCell(`M${rowIndex}`).value = educationParts.slice(0).join(" ");
          }
  
          const workParts = detail.participant.workStatus.split(" ");
          if(workParts.length === 3)
          {
            sourceSheet.getCell(`M${rowIndex}`).value = workParts.slice(0, 2).join(" ");
          }
          else
          {
            sourceSheet.getCell(`M${rowIndex}`).value = workParts.slice(0).join(" ");
          }
  
          sourceSheet.getCell(`O${rowIndex}`).value = detail.course.courseEngName;
  
          const [startDate, endDate] = detail.course.courseDuration.split(" - ");
          sourceSheet.getCell(`P${rowIndex}`).value = this.convertDateFormat(startDate);
          sourceSheet.getCell(`Q${rowIndex}`).value = this.convertDateFormat(endDate);
  
          sourceSheet.getCell(`R${rowIndex}`).value = detail.course.coursePrice;
          sourceSheet.getCell(`S${rowIndex}`).value = detail.course.payment === "SkillsFuture" ? "SFC" : detail.course.payment;
  
          // Copy styles from the original row
          originalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              const newCell = newDataRow.getCell(colNumber);
              newCell.style = cell.style;
          });
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
            <div className="table-wrapper" ref={this.tableRef}>
            <table style={{borderCollapse: 'collapse',tableLayout: 'fixed', width: '600%'}}>
                <thead>
                  <tr>
                    <th colSpan="11">{this.props.language === 'zh' ? '参与者' : 'Participants'}</th>
                    <th colSpan="5">{this.props.language === 'zh' ? '课程' : 'Courses'}</th>
                    <th>{this.props.language === 'zh' ? '其他' : 'Others'}</th>
                    <th>{this.props.language === 'zh' ? '确认状态' : 'Confirmation Status'}</th>
                    <th colSpan="5">{this.props.language === 'zh' ? '' : 'For Official Uses'}</th>
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
                    <th>{this.props.language === 'zh' ? '支付' : 'Payment Status'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Staff Name'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Date Received'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Time Received'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Receipt/Invoice Number'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Remarks'}</th>
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
                      <td onClick={(event) => this.receiptGenerator(event, item)}>{item.official?.name}</td>
                      <td>{item.official?.date}</td>                      
                      <td>{item.official?.time}</td>
                      <td>{item.official?.receiptNo}</td>                      
                      <td style={{ width: '100%', padding: '0', overflow: 'hidden' }}>
                      <input
                          type="text"
                          value={this.state.remarks[index]}
                          maxLength={1000}
                          onChange={(e) => this.handleInputChange1(e, index)}
                          style={{
                            width: '100%',
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
                            marginBottom: '0.5em'
                          }}
                        >
                          Submit
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
