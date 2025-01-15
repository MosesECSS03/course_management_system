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
        skillsFutureOptions: ["Pending", "Generate SkillsFuture Invoice", "SkillsFuture Done", "Cancelled"], // SkillsFuture specific options
        filteredSuggestions: {} ,
        focusedInputIndex: null,
        originalData: [],
        currentPage: 1, // Add this
        entriesPerPage: 100, // Add this
        remarks: "", // Remarks for each row
        expandedRow: null
      };
      this.tableRef = React.createRef();
    }

    /*handleRemarksChange = (e) => {
      const { value } = e.target;
      console.log("Value Remarks:", value);
    
      // Update the remarks state based on the index
      this.setState({
        remarks: value
      });
    };*/

    handleRemarksChange = (e, index) => {
      const { value } = e.target;
      console.log("Value Remarks:", value);
    
      // Update the specific remark using the item's unique ID as the key
      this.setState((prevState) => ({
        remarks: {
          ...prevState.remarks, // Retain previous remarks for other items
          [index]: value, // Update the remark for the specific item
        },
      }));
    };

    toggleRow = (index) => {
      this.setState((prevState) => ({
        expandedRow: prevState.expandedRow === index ? null : index,
      }));
    };  
    
    handleSubmit = async (id, remark) => {
      console.log("Id:", id);
      console.log("Remarks:", remark);
      console.log("handleRemarks:", id, remark);
    
      this.props.updateRemarksPopup();
    
      // Perform the submit action here, e.g., API call
      try {
       const response = await axios.post(
          'http://localhost:3001/courseregistration', 
          { 
            purpose: 'updateRemarks', 
            id: id, 
            remarks: remark, 
            staff: this.props.userName 
          }
        );
        /*const response = await axios.post(
          'https://moses-ecss-backend.azurewebsites.net/courseregistration', 
          { 
            purpose: 'updateRemarks', 
            id: id, 
            remarks: remark, 
            staff: this.props.userName 
          }
        );*/
    
        console.log("handleSubmit:", response.data);
        if (response.data.result.success === true) {
          this.props.closePopup();
          this.refreshChild();
        } else {
          // Handle unsuccessful submission if needed
          this.props.closePopup();
          this.refreshChild();
        }
      } catch (error) {
        console.error('Error during submission:', error);
        this.props.closePopup();
        this.refreshChild();
      }
    };

    refreshChild = () =>
    {
      this.props.refreshChild();
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
        /*const response = await axios.post(
          'https://moses-ecss-backend.azurewebsites.net/courseregistration', 
          { purpose: 'retrieve' }
        );*/
        const response = await axios.post(
          'http://localhost:3001/courseregistration', 
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
      var names = await this.getAllNames(data);
      this.props.passDataToParent(locations, names);

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
        console.log("Current Remarks: ", item.official.remarks)
      });

      this.setState({
        originalData: data,
        registerationDetails: data, // Update with fetched dat
        isLoading: false, // Set loading to false after data is fetche
        inputValues: inputValues,  // Show dropdown for the focused input
        remarks: inputValues1,  // Show dropdown for the focused input
        locations: locations, // Set locations in state
        names: names
      });
      this.props.closePopup();
    }
    
    

    async componentDidUpdate(prevProps) {
      const { selectedLocation, selectedCourseName, searchQuery} = this.props;
      if (selectedLocation !== prevProps.selectedLocation ||
        selectedCourseName !== prevProps.selectedCourseName ||
        searchQuery !== prevProps.searchQuery 
      ) {
        this.filterRegistrationDetails();
      }
    }

    filterRegistrationDetails() 
    {
      const { section } = this.props;
  
      if (section === "registration") {
          const { originalData } = this.state;
          const { selectedLocation, selectedCourseName, searchQuery } = this.props;
          console.log("Section:", section);
          console.log("Selected Course Type:", selectedCourseName);
  
          // Reset filtered courses to all courses if the search query is empty
          if (selectedCourseName === "All Courses" && selectedLocation === "All Locations") {
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
  
              const matchesNames = selectedCourseName === "All Courses" || 
                  selectedCourseName === "" || 
                  selectedCourseName === "" || 
                  !selectedCourseName
                  ? true 
                  : courseEngName === selectedCourseName.toLowerCase().trim();
              
              console.log("matchNames:", matchesNames);

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
  
              return matchesNames && matchesLocation && matchesSearchQuery;
          });
  
          // If filteredDetails is empty, set registerationDetails to an empty array
          this.setState({ registerationDetails: filteredDetails.length > 0 ? filteredDetails : [] });
      }
  }
  
  handleFocus = (index, payment) => {
    console.log("handleFocus:", index);
  
    // Update only the focused row's state
    this.setState(prevState => ({
      dropdownVisible: {
        ...prevState.dropdownVisible, // Retain previous dropdown visibility states
        [index]: true, // Show dropdown for the focused input
      },
      inputValues: {
        ...prevState.inputValues, // Retain previous input values
        [index]: "", // Clear the input for the focused row
      },
      filteredSuggestions: {
        ...prevState.filteredSuggestions, // Retain other filtered suggestions
        [index]: this.getSuggestionsByPaymentType(payment), // Set filtered suggestions for the specific row
      }
    }));
  };
  
  
    getSuggestionsByPaymentType(payment) {
      if (payment === "Cash" || payment === "PayNow") {
        return this.state.cashPaynowSuggestions; // Use Cash/PayNow suggestions
      } else if (payment === "SkillsFuture") {
        return this.state.skillsFutureOptions; // Use SkillsFuture suggestions
      }
      return []; // Default empty suggestions
    }
    
    
    /*handleInputChange = (event, index) => {
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
    };*/

    handleInputChange = (event, index) => {
      const value = event.target.value;
    
      // Log the index and value for debugging
      console.log("Index:", index);
      console.log("Value:", value);
      console.log("handleInputChange:", index, value);
    
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
    
      // Update the filtered suggestions and dropdown visibility for the specific index
     this.setState(prevState => ({
        filteredSuggestions: {
          ...prevState.filteredSuggestions,
          [index]: filteredSuggestions, // Store filtered suggestions by index
        },
        dropdownVisible: {
          ...prevState.dropdownVisible,
          [index]: true, // Keep the dropdown visible for the focused input
        },
      }));
    };

    handleSuggestionClick = (index, value, id, participant, course, official) => {
      this.props.updatePaymentPopup();
    
      // Log the index and value for debugging
      console.log("Index:", index);
      console.log("Value:", value);
      console.log("Course Details:", course);
    
      // Update only the specific input value for the clicked suggestion
      this.setState(prevState => ({
        inputValues: {
          ...prevState.inputValues,
          [index]: value, // Set clicked suggestion as input value for the specific row
        },
      }));
    
      // Filter suggestions based on the selected suggestion's payment type for the specific row
      const paymentType = this.state.registerationDetails[index]?.course.payment;
      const filteredSuggestions = this.getSuggestionsByPaymentType(paymentType).filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
    
      // Update filtered suggestions and hide dropdown for the specific row
      this.setState(prevState => ({
        filteredSuggestions: {
          ...prevState.filteredSuggestions, // Keep previous suggestions for other rows
          [index]: filteredSuggestions, // Update filtered suggestions for the current row
        },
        dropdownVisible: {
          ...prevState.dropdownVisible, // Keep dropdown visibility for other rows
          [index]: false, // Hide dropdown for the current row after selection
        },
      }));
    
      // If the selected value is not "Pending" or "Cancelled", update the database
      console.log("Updated Status:", value);
      this.updateWooCommerceForRegistrationPayment(value, id, participant,course, official);
    };
    
    updateWooCommerceForRegistrationPayment = async (value, id, participant, course, official) => {
          console.log("WooCommerce", value, id);
        
          try {
            // Update the course registration payment
            const courseResponse = await axios.post('http://localhost:3001/courseregistration', { 
              purpose: 'updatePayment', 
              page: course, 
              registration_id: id, 
              staff: this.props.userName, 
              status: value 
            });
        
            console.log("Course Registration Update response:", courseResponse.data);
        
           // Check if the value is "Pending", "Cancelled", or "SkillsFuture Done"
            if (value === "Pending" || value === "Cancelled" || value === "SkillsFuture Done") {
              console.log("Status is one of the special values, closing popup and refreshing child.");
              this.props.closePopup();  // Close the popup
              this.refreshChild();      // Refresh the child component
            } else {
              // Proceed to update WooCommerce stock
             const stockResponse = await axios.post('http://localhost:3002/update_stock/', { 
                type: 'update', 
                page: course, 
                status: value 
             });
        
            console.log("WooCommerce stock update response:", stockResponse.data);
        
              // If WooCommerce stock update is successful, generate receipt
             if (stockResponse.data.success === true) {
                this.receiptGenerator(id, participant, course, official, value);
              } else {
                console.error("Error updating WooCommerce stock:", stockResponse.data);
              }
            }
          } catch (error) {
            console.error("Error during the update process:", error);
          }
        };
        
          
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
      getAllNames = async (datas) => {
        return [...new Set(datas.map(data => {
          return data.course.courseEngName;
        }))];
      }

      receiptGenerator = async (id, participant, course, official, value) => {
        console.log("Selected Parameters:", { course, official, value });
      
        const generateReceiptNumber = async () => {
          if (official.receiptNo) {
            console.log("Using existing receipt number:", official.receiptNo);
            return official.receiptNo;
          }
      
          const courseLocation =
            course.payment === "SkillsFuture" ? "ECSS/SFC/" : course.courseLocation;
      
          try {
            console.log("Fetching receipt number for location:", courseLocation);
      
            const response = await axios.post("http://localhost:3001/receipt", {
              purpose: "getReceiptNo",
              courseLocation,
            });
      
            if (response?.data?.result?.success) {
              console.log("Fetched receipt number:", response.data.result.receiptNumber);
              return response.data.result.receiptNumber;
            } else {
              throw new Error("Failed to fetch receipt number from response");
            }
          } catch (error) {
            console.error("Error fetching receipt number:", error);
            throw error;
          }
        };
      
        const generatePDFReceipt = async (id, participant, course, receiptNo, status) => {
          try {
      
            const pdfResponse = await axios.post(
              "http://localhost:3001/courseregistration",
              {
                purpose: "receipt",
                id,
                participant,
                course,
                staff: this.props.userName,
                receiptNo,
                status,
              },
              { responseType: "blob" }
            );
      
            const contentDisposition = pdfResponse.headers["content-disposition"];
            const filenameMatch = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
            );
            const filename = filenameMatch
              ? filenameMatch[1].replace(/['"]/g, "")
              : "unknown.pdf";
            console.log(`PDF Filename: ${filename}`);
      
            const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
      
            console.log("PDF receipt URL:", url);
            return url;
          } catch (error) {
            console.error("Error generating PDF receipt:", error);
            throw error;
          }
        };
      
        const createReceiptInDatabase = async (participant, course, receiptNo, registration_id, url) => {
          try {
            console.log("Creating receipt in database:", {
              receiptNo,
              registration_id,
              url,
            });
      
            const receiptCreationResponse = await axios.post(
              "http://localhost:3001/receipt",
              {
                purpose: "createReceipt",
                receiptNo,
                registration_id,
                url,
                staff: this.props.userName,
              }
            );
      
            console.log("Receipt creation response:", receiptCreationResponse.data);
          } catch (error) {
            console.error("Error creating receipt in database:", error);
            throw error;
          }
        };
      
        console.log("Processing status:", value);
      
        if (value === "Paid" || value === "SkillsFuture Done") {
          this.props.generateReceiptPopup();
      
          if (
            course.payment === "Cash" ||
            course.payment === "PayNow" ||
            course.payment === "SkillsFuture"
          ) {
            try {
              console.log("Generating receipt for course:", course);
      
              const registration_id = course._id;
              const receiptNo =
                official.receiptNo || (await generateReceiptNumber(course));
      
              if (value === "Paid") {
                const url = await generatePDFReceipt(id, participant, course, receiptNo, value);
                this.props.closePopup();
                this.refreshChild();
                await createReceiptInDatabase(participant, course, receiptNo, registration_id, url);
              }
      
            } catch (error) {
              console.error("Error during receipt generation:", error);
            }
          }
        } else if (value === "Generate SkillsFuture Invoice") {
          this.props.generateInvoiceNumber();
      
          if (course.payment === "SkillsFuture") {
            try {
              console.log("Generating SkillsFuture invoice for course:", course);
      
              const registration_id = course._id;
              const receiptNo = await generateReceiptNumber(course);
              const url = await generatePDFReceipt(id, participant, course, receiptNo, value);
      
              await createReceiptInDatabase(participant, course, receiptNo, registration_id, url);
      
              this.props.closePopup();
              this.refreshChild();
            } catch (error) {
              console.error("Error during SkillsFuture invoice generation:", error);
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
        Feburary: '02',
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
    
      // Regular expression to match the input format
      const regex = /^(\d{1,2})\s([A-Za-z]+)\s(\d{4})$/;
    
      // Test the input against the regex
      const match = dateString.trim().match(regex);
    
      if (!match) {
        console.error('Invalid date format:', dateString);
        return 'Invalid date format';
      }
    
      // Extract day, month, and year from the regex groups
      const [, day, month, year] = match;
    
      // Validate the month
      const monthNumber = months[month];
      if (!monthNumber) {
        console.error('Invalid month name:', month);
        return 'Invalid date format';
      }
    
      // Return the formatted date
      return `${day.padStart(2, '0')}/${monthNumber}/${year}`;
    }
    

    handleEdit = async(item, index) =>
    {
      console.log("Handle Edit:", item);
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
        if (detail.course.courseType === "NSA") {
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
          sourceSheet.getCell(`I${rowIndex}`).value = detail.participant.race.split(" ")[0];
          sourceSheet.getCell(`J${rowIndex}`).value = detail.participant.contactNumber;
          sourceSheet.getCell(`K${rowIndex}`).value = detail.participant.email;
          sourceSheet.getCell(`L${rowIndex}`).value = detail.participant.postalCode;
  
          const educationParts = detail.participant.educationLevel.split(" ");
          if (educationParts.length === 3) {
            sourceSheet.getCell(`M${rowIndex}`).value = educationParts[0] + " " + educationParts[1];
          } else {
            sourceSheet.getCell(`M${rowIndex}`).value = educationParts[0];
          }
  
          const workParts = detail.participant.workStatus.split(" ");
          if (workParts.length === 3) {
            sourceSheet.getCell(`N${rowIndex}`).value = workParts[0] + " " + workParts[1];
          } else {
            sourceSheet.getCell(`N${rowIndex}`).value = workParts[0];
          }
  
          sourceSheet.getCell(`O${rowIndex}`).value = detail.course.courseEngName.split("–")[0].trim();
  
          const [startDate, endDate] = detail.course.courseDuration.split(" - ");
          console.log("Duration LOP:", startDate, this.convertDateFormat1(startDate), endDate, this.convertDateFormat1(endDate));
          sourceSheet.getCell(`P${rowIndex}`).value = this.convertDateFormat1(startDate);
          sourceSheet.getCell(`Q${rowIndex}`).value = this.convertDateFormat1(endDate);
  
          sourceSheet.getCell(`R${rowIndex}`).value = detail.course.coursePrice;
          sourceSheet.getCell(`S${rowIndex}`).value = detail.course.payment === "SkillsFuture" ? "SFC" : detail.course.payment;
          sourceSheet.getCell(`V${rowIndex}`).value = detail.official.receiptNo;
  
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
      this.refreshChild();
  };
  
  
    render() {
      const { isDisabled, remarks, hideAllCells, registerationDetails, filteredSuggestions, currentInput, showSuggestions, focusedInputIndex, expandedRow} = this.state;
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
              <div className="table-wrapper" style={{ marginLeft: '8%', height: '40vh'}}>
                <table style={{ borderCollapse: 'collapse', width: '150%'}} ref={this.tableRef}>
                  <thead>
                    <tr>
                      <th></th>
                      <th colSpan="2">{this.props.language === 'zh' ? '参与者' : 'Participants'}</th>
                      <th colSpan="5" >{this.props.language === 'zh' ? '' : 'For Official Uses'}</th>
                    </tr>
                    <tr>
                      <th style={{ width: '0.01%' }}>{this.props.language === 'zh' ? '' : 'S/N'}</th>
                      <th style={{ width: '0.001%' }}>{this.props.language === 'zh' ? '名字' : 'Name'}</th>
                      <th style={{ width: '0.01%' }}>{this.props.language === 'zh' ? '' : 'Contact Number'}</th>
                      <th style={{ width: '0.04%' }}>{this.props.language === 'zh' ? '支付' : 'Payment Status'}</th>
                      <th style={{ width: '0.01%' }}>{this.props.language === 'zh' ? '' : 'Receipt/Invoice Number'}</th>
                      <th style={{ width: '0.04%' }}>{this.props.language === 'zh' ? '' : 'Remarks'}</th>
                      <th style={{ width: '0.02%' }}>{this.props.language === 'zh' ? '' : 'Update/Edit'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDetails.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents event bubbling
                            this.toggleRow(index);
                          }}
                          className={expandedRow === index ? 'expanded' : ''}
                        >
                          <td>{index + 1}</td>
                          <td>{item.participant.name}</td>
                          <td style={{ width: '0.005%' }}>{item.participant.contactNumber}</td>
                          <td>
                            {!hideAllCells && (
                              <div className="input-container" style={{ position: 'relative', width: '75%' }}>
                                <input
                                  type="text"
                                  value={this.state.inputValues[index] || ''} // Ensure value is specific to the row
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row expansion when clicking on the input
                                    console.log("OnChange:", e);
                                    this.handleInputChange(e, index); // Handle input change for specific row
                                  }}
                                   onFocus={() => this.handleFocus(index, item.course.payment)} // Focus handler for specific row
                                  onBlur={() => this.handleBlur(index)} // Blur handler for specific row 
                                  style={{
                                    backgroundColor:
                                        item.status === 'Pending' ? '#ffa500' :  // Orange (Pending)
                                        item.status === 'Paid' ? '#28a745' :  // Green (Paid)
                                        item.status === 'Cancelled' ? '#dc3545' :  // Red (Cancelled)
                                        item.status === 'Generate SkillsFuture Invoice' ? '#0000FF' :  // Blue (SkillsFuture)
                                        item.status=== 'SkillsFuture Done' ? '#28a745' :  // Green (SkillsFuture Done)
                                      '#f8f9fa', // Default background
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem',
                                    padding: '0.25rem',
                                    borderRadius: '0.375rem',
                                    outline: 'none',
                                    width: '15rem',
                                    textAlign: 'center',
                                    height: 'fit-content',
                                  }}
                                />
                                  {this.state.dropdownVisible[index] && Array.isArray(this.state.filteredSuggestions[index]) && this.state.filteredSuggestions[index].length > 0 && (
                                    <ul className="suggestions-list" style={{
                                      listStyleType: 'none',
                                      padding: '0',
                                      margin: '0',
                                      maxHeight: '150px',
                                      overflowY: 'auto',
                                      backgroundColor: 'white',
                                      borderRadius: '0.375rem',
                                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                                    }}>
                                      {this.state.filteredSuggestions[index].map((suggestion, idx) => (
                                        <li
                                          key={idx}
                                          onMouseDown={(event) => {
                                            event.stopPropagation(); // Prevent event bubbling
                                            this.handleSuggestionClick(index, suggestion, item._id, item.participant, item.course, item.official); // Handle suggestion click
                                          }}
                                          style={{
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s ease',
                                          }}
                                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f1f1'} // Hover effect
                                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} // Reset hover
                                        >
                                          {suggestion}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                              </div>
                            )}
                          </td>
                          <td>{item.official?.receiptNo}</td>
                          <td>
                            <input
                              type="text"
                              value={remarks[index]} // Retrieve the value from state based on unique id
                              onChange={(e) => this.handleRemarksChange(e, index)} 
                              onClick={(e) => e.stopPropagation()} // Prevent the click event from propagating to parent elements
                              onFocus={(e) => e.stopPropagation()} // Prevent the focus event from propagating to parent elements 
                              style={{
                                width: "80%",
                                padding: "0.5rem",
                                fontSize: "0.75rem",
                                border: "1px solid #ccc",
                                borderRadius: "4px", // Optional rounded corners
                              }}
                            />
                            <br/>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();  // Prevent event bubbling
                              this.handleSubmit(item._id, remarks[index]);  // Call handleSubmit
                            }}
                            style={{
                              width: "fit-content",
                              marginTop: "1%",
                              padding: "0.5rem",
                              fontSize: "1rem",
                              border: "1px solid #ccc",
                              borderRadius: "4px", // Optional rounded corners
                            }}
                          >
                            Submit
                          </button>
                        </td>
                          <td>
                            <button onClick={() => this.handleEdit(item, index)} style={{
                              width: "100%",
                              marginTop: "1rem",
                              padding: "0.5rem",
                              fontSize: "1rem",
                              border: "1px solid #ccc",
                              borderRadius: "4px", // Optional rounded corners
                            }}>Edit</button>
                          </td>
                        </tr>
                        {expandedRow === index  && (
                            <tr>
                            <td colSpan="7">
                              <div>
                                <p>
                                  <strong>Course Name: </strong>{" "}
                                  {item.course?.courseEngName?.includes("Protected: ")
                                    ? item.course.courseEngName.replace("<br />Protected: ", "")
                                    : item.course?.courseEngName || "N/A"}
                                </p>
                                <p>
                                  <strong>Course Location: </strong> {item.course?.courseLocation || "N/A"}
                                </p>
                                <p>
                                  <strong>Course Duration: </strong> {item.course?.courseDuration || "N/A"}
                                </p>
                                <p>
                                  <strong>Payment Method: </strong> {item.course?.payment || "N/A"}
                                </p>
                                <hr/>
                                <p>
                                  <strong>Staff Name: </strong>
                                  {item.official?.name}
                                </p>
                                <p>
                                  <strong>Date Received: </strong>
                                  {item.official?.date}
                                </p>
                                <p>
                                  <strong>Time Received: </strong>
                                  {item.official?.time}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )
  }
}

export default RegistrationPaymentSection;
