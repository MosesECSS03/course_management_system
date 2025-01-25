import React, { Component } from 'react';
import axios from 'axios';
import '../../../css/sub/registrationPayment.css';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import PaymentMethod from '../dropdownBox/paymentMethod'; 

class RegistrationPaymentSection extends Component {
    constructor(props) {
      super(props);
      this.state = {
        hideAllCells: false,
        registerationDetails: [],
        isLoading: true,
        focusedInputIndex: null,
        originalData: [],
        currentPage: 1, // Add this
        entriesPerPage: 100, // Add this
        remarks: "", // Remarks for each row
        paginatedDetails: [],
        columnDefs: this.getColumnDefs(),
        rowData: [],
        expandedRowIndex: null
      };
      this.tableRef = React.createRef();
    }

    toggleRow = (index) => {
      this.setState((prevState) => ({
        expandedRow: prevState.expandedRow === index ? null : index,
      }));
    };  

    handleEntriesPerPageChange = (e) => {
      this.setState({
        entriesPerPage: parseInt(e.target.value, 100),
        currentPage: 1 // Reset to the first page when changing entries per page
      });
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
     // this.props.onResetSearch();
      const { language } = this.props;
      const data = await this.fetchCourseRegistrations(language);
      console.log('All Courses Registration:  ', data);
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
        names: names,
        //rowData: data
      });
      this.getRowData(data);
      this.props.closePopup();
    }

    updateRowData(paginatedDetails) {
      this.props.onResetSearch();
      // Update the state with the newly formatted rowData
      //console.log("Row Datawe:", rowData);
      this.setState({filterRegistrationDetails: paginatedDetails});
    }
    
          
    updateWooCommerceForRegistrationPayment = async (chi, eng, location, updatedStatus) => {
      try {
        // Check if the value is "Paid" or "Generate SkillsFuture Invoice"
        if (updatedStatus === "Paid" || updatedStatus === "SkillsFuture Done" || updatedStatus === "Cancelled") {
          // Proceed to update WooCommerce stock
          //const stockResponse = await axios.post('http://localhost:3002/update_stock/', { 
          const stockResponse = await axios.post('https://moses-ecss-data.azurewebsites.net/update_stock/', { 
            type: 'update', 
            page: {"courseChiName":chi, "courseEngName":eng, "courseLocation":location}, // Assuming `chi` refers to the course or page
            status: updatedStatus, // Using updatedStatus directly here
            location: location, // Added location if needed
          });
    
          console.log("WooCommerce stock update response:", stockResponse.data);
        
          // If WooCommerce stock update is successful, generate receipt
          if (stockResponse.data.success === true) {
            console.log("Stock updated successfully.");
            // Call the function to generate receipt or perform other action
          } else {
            console.error("Error updating WooCommerce stock:", stockResponse.data);
          }
        } else {
          console.log("No update needed for the given status.");
        }
      } catch (error) {
        console.error("Error during the update process:", error);
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

      generateReceiptNumber = async (course, newMethod) => 
      {
        const courseLocation = newMethod === "SkillsFuture" ? "ECSS/SFC/" : course.courseLocation;
        console.log("Course Location:", courseLocation);
    
        try {
          //console.log("Fetching receipt number for location:", courseLocation);
         /* const response = await axios.post("http://localhost:3001/receipt", {
            purpose: "getReceiptNo",
            courseLocation,
          });*/

          const response = await axios.post("https://moses-ecss-backend.azurewebsites.net/receipt", {
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

      generatePDFReceipt = async (id, participant, course, receiptNo, status) => {
        try {
          const pdfResponse = await axios.post(
           // "http://localhost:3001/courseregistration",
           'https://moses-ecss-backend.azurewebsites.net/courseregistration',
            {
              purpose: "addReceiptNumber",
              id,
              participant,
              course,
              staff: this.props.userName,
              receiptNo,
              status,
            }
          );
          console.log("generatePDFReceipt:", pdfResponse);
          return pdfResponse;
        } catch (error) {
          console.error("Error generating PDF receipt:", error);
          throw error;
        }
      };
      
    
      receiptShown = async (participant, course, receiptNo) => 
      {
        try {
          if(course.payment === "Cash" || course.payment === "PayNow")
          {
            const pdfResponse = await axios.post(
              //"http://localhost:3001/courseregistration",
              'https://moses-ecss-backend.azurewebsites.net/courseregistration',
              {
                purpose: "receipt",
                participant,
                course,
                staff: this.props.userName,
                receiptNo,
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
          }
          else
          {
            const pdfResponse = await axios.post(
            //"http://localhost:3001/courseregistration",
            "https://moses-ecss-backend.azurewebsites.net/courseregistration",
            {
              purpose: "invoice",
              participant,
              course,
              staff: this.props.userName,
              receiptNo,
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
        }
        } catch (error) {
          console.error("Error generating PDF receipt:", error);
          throw error;
        }
      };

      generatePDFInvoice = async (id, participant, course, receiptNo, status) => {
        try {
    
          const pdfResponse = await axios.post(
            //"http://localhost:3001/courseregistration",
            "https://moses-ecss-backend.azurewebsites.net/courseregistration",
            {
              purpose: "addInvoiceNumber",
              id,
              participant,
              course,
              staff: this.props.userName,
              receiptNo,
              status,
            }
          );
          return pdfResponse;
        } catch (error) {
          console.error("Error generating PDF receipt:", error);
          throw error;
        }
      };
    
      createReceiptInDatabase = async (receiptNo, registration_id, url) => {
        try {
          console.log("Creating receipt in database:", {
            receiptNo,
            registration_id,
            url,
          });
    
          const receiptCreationResponse = await axios.post(
            //"http://localhost:3001/receipt",
            "https://moses-ecss-backend.azurewebsites.net/receipt",
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
    

      receiptGenerator = async (id, participant, course, official, value) => {
        console.log("Selected Parameters:", { course, official, value });
    
        if (value === "Paid") 
        {
          if (course.payment === "Cash" || course.payment === "PayNow") 
          {
            try 
            {
              console.log("Generating receipt for course:", course);
      
              //const registration_id = id;
              const receiptNo = await this.generateReceiptNumber(course, course.payment);
              console.log("Manual Receipt No:", receiptNo);
              await this.generatePDFReceipt(id, participant, course, receiptNo, value);
              await this.createReceiptInDatabase(receiptNo,  id, "");  
            } 
            catch (error) 
            {
              console.error("Error during receipt generation:", error);
            }
          }
        } 
        else if (value === "Generating SkillsFuture Invoice") {
            try {
              console.log("Generating SkillsFuture invoice for course:", course);
              const invoiceNo = await this.generateReceiptNumber(course);
              console.log("Invoice No:", invoiceNo);
              await this.generatePDFInvoice(id, participant, course, invoiceNo, value);  
              await this.createReceiptInDatabase(invoiceNo,  id, ""); 
            } catch (error) {
              console.error("Error during SkillsFuture invoice generation:", error);
            }
        }
      };

      //this.autoReceiptGenerator(id, participantInfo, courseInfo, officialInfo, newValue, "Paid")
      autoReceiptGenerator = async (id, participant, course, official, newMethod, value) => {
        console.log("Selected Parameters:", { course, official, newMethod, value });
    
        if (newMethod === "Cash" || newMethod === "PayNow") 
        {
          if (value === "Paid") 
          {
            try 
            {
              console.log("Generating receipt for course:", course);
      
              const registration_id = id;
              const receiptNo = await this.generateReceiptNumber(course, newMethod);
              console.log("Receipt No:", receiptNo);
              await this.generatePDFReceipt(id, participant, course, receiptNo, value);
              await this.createReceiptInDatabase(receiptNo,  id, "");    
            } 
            catch (error) 
            {
              console.error("Error during receipt generation:", error);
            }
          }
        } 
        else if(newMethod === "SkillsFuture")
        {
          try 
          {
            console.log("Generating receipt for course:", course);
    
            const registration_id = id;
            const invoiceNo = await this.generateReceiptNumber(course, newMethod);
            console.log("Invoice No:", invoiceNo);
            await this.generatePDFReceipt(id, participant, course, invoiceNo, value);
            await this.createReceiptInDatabase(invoiceNo,  id, "");    
          } 
          catch (error) 
          {
            console.error("Error during receipt generation:", error);
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
        if (detail.courseInfo.courseType === "NSA") {
          const rowIndex = startRow + index;
          const newDataRow = sourceSheet.getRow(rowIndex);
          newDataRow.height = originalRow.height;
  
          // Populate cells with data from `detail`
          sourceSheet.getCell(`A${rowIndex}`).value = rowIndex - startRow + 1;
          sourceSheet.getCell(`B${rowIndex}`).value = detail.participantInfo.name;
          sourceSheet.getCell(`C${rowIndex}`).value = detail.participantInfo.nric;
          sourceSheet.getCell(`D${rowIndex}`).value = detail.participantInfo.residentialStatus.substring(0, 2);
  
          const [day, month, year] = detail.participant.dateOfBirth.split("/");
          sourceSheet.getCell(`E${rowIndex}`).value = day.trim();
          sourceSheet.getCell(`F${rowIndex}`).value = month.trim();
          sourceSheet.getCell(`G${rowIndex}`).value = year.trim();
  
          sourceSheet.getCell(`H${rowIndex}`).value = detail.participantInfo.gender.split(" ")[0];
          sourceSheet.getCell(`I${rowIndex}`).value = detail.participantInfo.race.split(" ")[0];
          sourceSheet.getCell(`J${rowIndex}`).value = detail.participantInfo.contactNumber;
          sourceSheet.getCell(`K${rowIndex}`).value = detail.participantInfo.email;
          sourceSheet.getCell(`L${rowIndex}`).value = detail.participantInfo.postalCode;
  
          const educationParts = detail.participantInfo.educationLevel.split(" ");
          if (educationParts.length === 3) {
            sourceSheet.getCell(`M${rowIndex}`).value = educationParts[0] + " " + educationParts[1];
          } else {
            sourceSheet.getCell(`M${rowIndex}`).value = educationParts[0];
          }
  
          const workParts = detail.participantInfo.participant.workStatus.split(" ");
          if (workParts.length === 3) {
            sourceSheet.getCell(`N${rowIndex}`).value = workParts[0] + " " + workParts[1];
          } else {
            sourceSheet.getCell(`N${rowIndex}`).value = workParts[0];
          }
  
          sourceSheet.getCell(`O${rowIndex}`).value = detail.course.courseEngName.split("–")[0].trim();
  
          const [startDate, endDate] = detail.courseInfo.courseDuration.split(" - ");
          console.log("Duration LOP:", startDate, this.convertDateFormat1(startDate), endDate, this.convertDateFormat1(endDate));
          sourceSheet.getCell(`P${rowIndex}`).value = this.convertDateFormat1(startDate);
          sourceSheet.getCell(`Q${rowIndex}`).value = this.convertDateFormat1(endDate);
  
          sourceSheet.getCell(`R${rowIndex}`).value = detail.courseinfo.coursePrice;
          sourceSheet.getCell(`S${rowIndex}`).value = detail.courseInfo.payment === "SkillsFuture" ? "SFC" : detail.course.payment;
          sourceSheet.getCell(`V${rowIndex}`).value = detail.officialInfo.receiptNo;
  
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
  
  // Custom Cell Renderer for Slide Button
  slideButtonRenderer = (params) => {
    const paymentMethod = params.data.paymentMethod; // Get payment method for the row

    // Return null or empty if the payment method is not 'SkillsFuture'
    if (paymentMethod !== 'SkillsFuture') {
      return null;
    }

    // Otherwise, return JSX for the slide button (checkbox)
    const checked = params.value;  // Set checkbox state based on the current value of 'confirmed'
    
    const handleChange = (event) => {
      const newValue = event.target.checked;
      params.api.getRowNode(params.node.id).setDataValue('confirmed', newValue);
      console.log('Slide button toggled:', newValue);
    };

    return (
      <div className="slide-button-container">
        <input 
          type="checkbox"
          className="slide-button"
          checked={checked}
          onChange={handleChange}
        />
      </div>
    );
  };

  // Custom cell renderer for Payment Method with Buttons
  paymentMethodRenderer = (params) => {
    const currentPaymentMethod = params.value; // Get the current payment method value

    // List of payment methods
    const paymentMethods = ['Cash', 'PayNow', 'SkillsFuture'];

    // Handle button click to update the payment method in the row
    const handleButtonClick = (method) => {
      params.api.getRowNode(params.node.id).setDataValue('paymentMethod', method);
      console.log('Payment method changed to:', method);
    };

    return (
      <div className="payment-method-buttons-container">
        {paymentMethods.map((method) => (
          <button
            key={method}
            className={`payment-method-button ${method === currentPaymentMethod ? 'active' : ''}`}
            onClick={() => handleButtonClick(method)}
          >
            {method}
          </button>
        ))}
      </div>
    );
  };

  // Column Definitions
  getColumnDefs = () => [
    { headerName: "S/N", field: "sn", width: 100 },
    { headerName: "Name", field: "name", width: 300 },
    { headerName: "Contact Number", field: "contactNo", width: 150 },
    { headerName: "Course Name", field: "course", width: 350 },
    {
      headerName: 'Payment Method',
      field: 'paymentMethod',
      cellRenderer: this.paymentMethodRenderer,  // Use the custom cell renderer with buttons
      editable: false,  // Since we're using buttons, no need for cell editor
      width: 500,
    },
    {
      headerName: 'Confirmation',
      field: 'confirmed',
      cellRenderer: this.slideButtonRenderer,  // Use the custom slide button renderer (no parentheses)
      editable: false,  // Since the slide button is interactive, we don't need the cell to be editable
      width: 180,
      // Optionally add cellStyle to hide the column if paymentMethod is not 'SkillsFuture'
      cellStyle: (params) => {
        const paymentMethodValue = params.data.paymentMethod;
        if (paymentMethodValue !== 'SkillsFuture') {
          return { display: 'none' };  // Hide the cell if paymentMethod is not 'SkillsFuture'
        }
        return {};  // No special styling, cell is visible
      },
    },    
    {
      headerName: "Payment Status",
      field: "paymentStatus",
      cellEditor: 'agSelectCellEditor',  // Use a select cell editor
      cellEditorParams: (params) => {
        // Check the value of the paymentMethod for the current row
        const paymentMethod = params.data.paymentMethod;
    
        // Define different arrays for SkillsFuture and others
        const skillsFutureOptions = ['Pending', 'Generating SkillsFuture Invoice', 'SkillsFuture Done', 'Cancelled'];
        const otherOptions = ['Pending', 'Paid', 'Cancelled'];
    
        // Set the appropriate options based on paymentMethod
        const options = paymentMethod === 'SkillsFuture' ? skillsFutureOptions : otherOptions;
    
        // Return the options for the select box
        return {
          values: options,  // List of options for the select box
        };
      },
      editable: true,  // Make the cell editable
      width: 350,
    },    
    { headerName: "Receipt/Invoice Number", field: "recinvNo", width: 200 },
  ];

  getPaginatedDetails() {
    const { registerationDetails } = this.state;
    const { currentPage, entriesPerPage } = this.props;
    
    // Calculate the index range for pagination
    const indexOfLastCourse = currentPage * entriesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - entriesPerPage;
  
    // Return the paginated slice of the filtered registerationDetails
    return registerationDetails.slice(indexOfFirstCourse, indexOfLastCourse);
  }

  getRowData = (registerationDetails) => {
   //const paginatedDetails = this.getPaginatedDetails();
   //console.log("Hi")
  
    // Assuming paginatedDetails is an array of objects with the necessary fields.
    const rowData = registerationDetails.map((item, index) => {
      return {
        id: item._id,
        sn: index + 1,  // Serial number (S/N)
        name: item.participant.name,  // Replace with the actual field for name
        contactNo: item.participant.contactNumber,  // Replace with the actual field for contact number
        course: item.course.courseEngName,  // Replace with the actual field for payment status
        courseChi: item.course.courseChiName,  // Replace with the actual field for payment status
        location: item.course.courseLocation,  // Replace with the actual field for payment status
        paymentMethod: item.course.payment,  // Replace with the actual field for payment method
        confirmed: item.official.confirmed,  // Replace with the actual field for receipt/invoice number
        paymentStatus: item.status,  // Replace with the actual field for payment status
        recinvNo: item.official.receiptNo,  // Replace with the actual field for receipt/invoice number
        participantInfo: item.participant,
        courseInfo: item.course,
        officialInfo: item.official
      };
    });
    console.log("All Rows Data:", rowData);
  
    // Set the state with the new row data
    this.setState({rowData });
  };

  handleValueClick = async (event) =>
  {
    console.log("handleValueClick");
    const columnName = event.colDef.headerName;
    const receiptInvoice = event.data.recinvNo;
    const participantInfo = event.data.participantInfo;
    const courseInfo = event.data.courseInfo;

    const rowIndex = event.rowIndex; // Get the clicked row index
    const expandedRowIndex = this.state.expandedRowIndex;

    try {
      if(columnName === "S/N")
        {
          
          // Optional: Handle additional logic here if necessary
          console.log("Cell clicked", event);
          // Check if clicked on a row and handle expansion
          if (expandedRowIndex === rowIndex) {
            // If the same row is clicked, collapse it
            this.setState({ expandedRowIndex: null });
          } else {
            // Expand the new row
            this.setState({ expandedRowIndex: rowIndex });
          }
  
        }
        else if (columnName === "Receipt/Invoice Number")
        {
          //console.log("Receipt/Invoice Number");
          await this.receiptShown(participantInfo, courseInfo, receiptInvoice);
        }
      }
      catch (error) {
        console.error('Error during submission:', error);
      }
  }

  // Define the Master/Detail grid options
  getDetailGridOptions = () => {
    return {
      columnDefs: [
        { headerName: "Detail Info", field: "detailInfo", width: 500 },
        { headerName: "More Info", field: "moreInfo", width: 500 },
      ],
      domLayout: "autoHeight", // Allows dynamic expansion
    };
  };

    // Add custom row below the clicked row
    getRowStyle = (params) => {
      // If this is the expanded row, display the custom <div>
      if (this.state.expandedRowIndex !== null && this.state.expandedRowIndex === params.rowIndex) {
        return { background: '#f1f1f1' }; // Example style for expanded row
      }
      return null;
    };
  

  onCellValueChanged = async (event) => {
    const columnName = event.colDef.headerName;
    const id = event.data.id;
    const courseName = event.data.course;
    const courseChiName = event.data.courseChi;
    const courseLocation = event.data.location;
    const newValue = event.value;
    const participantInfo = event.data.participantInfo;
    const courseInfo = event.data.courseInfo;
    const officialInfo = event.data.officialInfo;
    const confirmed = event.data.confirmed;
    const paymentMethod = event.data.paymentMethod;
    const paymentStatus = event.data.paymentStatus;

    console.log("Column Name:", columnName);

    try 
    {
        this.props.showUpdatePopup("Updating in progress... Please wait ...")
        if (columnName === "Payment Method") 
        {
          await axios.post(
            //'http://localhost:3001/courseregistration', 
            'https://moses-ecss-backend.azurewebsites.net/courseregistration',
            { 
              purpose: 'updatePaymentMethod', 
              id: id, 
              newUpdatePayment: newValue, 
              staff: this.props.userName 
            }
          );
          //Automatically Update Status
          console.log("newPaymentMethod:", newValue);
          if(newValue === "Cash" || newValue === "PayNow")
          {
              const response = await axios.post(
              // 'http://localhost:3001/courseregistration', 
              'https://moses-ecss-backend.azurewebsites.net/courseregistration',
                { 
                  purpose: 'updatePaymentStatus', 
                  id: id, 
                  newUpdateStatus: "Paid", 
                  staff: this.props.userName 
                });
              if (response.data.result === true) 
              {
                  // Define the parallel tasks function
                  const performParallelTasks = async () => {
                    try {
                      // Run the two functions in parallel using Promise.all
                      await Promise.all([
                        this.updateWooCommerceForRegistrationPayment(courseChiName, courseName, courseLocation, "Paid"),
                        //console.log("Course Info:", courseInfo)
                        this.autoReceiptGenerator(id, participantInfo, courseInfo, officialInfo, newValue, "Paid")
                      ]);
                      console.log("Updated Successfully");
                    } catch (error) {
                      console.error("Error occurred during parallel task execution:", error);
                    }
                };
                await performParallelTasks();
              } 
          }
          this.props.closePopup();
          this.refreshChild();  
        }
        else if (columnName === "Confirmation") 
        {
          console.log('Cell clicked', event);
          const response = await axios.post(
              //'http://localhost:3001/courseregistration', 
              'https://moses-ecss-backend.azurewebsites.net/courseregistration',
              { 
                purpose: 'updateConfirmationStatus', 
                id: id, 
                newConfirmation: newValue, 
                staff: this.props.userName 
              }
            );
        console.log(`${columnName}: ${newValue}`);
        if(paymentMethod === "SkillsFuture" && newValue === true)
        {
            if (response.data.result === true) 
            {
              console.log("Auto Generate SkillsFuture Invoice");
              // Define the parallel tasks function
              const response = await axios.post(
                //'http://localhost:3001/courseregistration', 
                'https://moses-ecss-backend.azurewebsites.net/courseregistration',
                { 
                  purpose: 'updatePaymentStatus', 
                  id: id, 
                  newUpdateStatus: "Generating SkillsFuture Invoice", 
                  staff: this.props.userName 
                }
              );

              if (response.data.result === true) 
                {
                    // Define the parallel tasks function
                    const performParallelTasks = async () => {
                      try {
                        // Run the two functions in parallel using Promise.all
                        await Promise.all([
                          this.autoReceiptGenerator(id, participantInfo, courseInfo, officialInfo, paymentMethod, "Generating SkillsFuture Invoice")
                        ]);
                        console.log("Updated Successfully");
                      } catch (error) {
                        console.error("Error occurred during parallel task execution:", error);
                      }
                  };
                  await performParallelTasks();
                } 
            }
        }
        this.props.closePopup();
        this.refreshChild();  
        }
        else if (columnName === "Payment Status") 
        {
          console.log('Cell clicked', event);
            const response = await axios.post(
              //'http://localhost:3001/courseregistration', 
              'https://moses-ecss-backend.azurewebsites.net/courseregistration', 
              { 
                purpose: 'updatePaymentStatus', 
                id: id, 
                newUpdateStatus: newValue, 
                staff: this.props.userName 
              }
            );
            console.log("Response for Payment Status1:", response);
            if (response.data.result === true) 
            {
              console.log("New Payment Status:", newValue);
              if(paymentMethod === "Cash" || paymentMethod === "PayNow")
              {
                console.log("Update Payment Status Success1");
                  if(newValue === "Cancelled")
                  {
                    const performParallelTasks = async () => {
                      try {
                        // Run the two functions in parallel using Promise.all
                        await Promise.all([
                          this.updateWooCommerceForRegistrationPayment(courseChiName, courseName, courseLocation, newValue),
                        ]);
                        console.log("Both tasks completed successfully.");
                      } catch (error) {
                        console.error("Error occurred during parallel task execution:", error);
                      }};
                      await performParallelTasks();
                  } 
                else
                {
                  // Define the parallel tasks function
                  const performParallelTasks = async () => {
                    try {
                      // Run the two functions in parallel using Promise.all
                      await Promise.all([
                        this.updateWooCommerceForRegistrationPayment(courseChiName, courseName, courseLocation, newValue),
                        this.receiptGenerator(id, participantInfo, courseInfo, officialInfo, newValue),
                      ]);
                      console.log("Both tasks completed successfully.");
                    } catch (error) {
                      console.error("Error occurred during parallel task execution:", error);
                    }};
                    await performParallelTasks();
                  }
            }
            else if(paymentMethod === "SkillsFuture")
            {
              if(newValue === "SkillsFuture Done")
              {
                const performParallelTasks = async () => {
                  try {
                    // Run the two functions in parallel using Promise.all
                    await Promise.all([
                      this.updateWooCommerceForRegistrationPayment(courseChiName, courseName, courseLocation, newValue),
                    ]);
                    console.log("Both tasks completed successfully.");
                  } catch (error) {
                    console.error("Error occurred during parallel task execution:", error);
                  }};
                  await performParallelTasks();
              }
              else if(newValue === "Cancelled")
                {
                  console.log("Cancelled Participants");
                  const performParallelTasks = async () => {
                    try {
                      // Run the two functions in parallel using Promise.all
                      await Promise.all([
                        this.updateWooCommerceForRegistrationPayment(courseChiName, courseName, courseLocation, newValue),
                      ]);
                      console.log("Both tasks completed successfully.");
                    } catch (error) {
                      console.error("Error occurred during parallel task execution:", error);
                    }};
                    await performParallelTasks();
                } 
            }
          }
          this.props.closePopup();
          this.refreshChild(); 
        }
    } catch (error) {
      console.error('Error during submission:', error);
      this.props.closePopup();
    }
  };
  
   refreshChild = () =>
   {
     this.props.refreshChild();
   }

   /*filterRegistrationDetails() {
    const { section, selectedLocation, selectedCourseName, searchQuery } = this.props;
  
    if (section === "registration") {
      const { originalData } = this.state;
  
      console.log("Original Data:", originalData);
      console.log("Filters Applied:", { selectedLocation, selectedCourseName, searchQuery });
  
      // Normalize the search query
      const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase().trim() : '';
  
      // Define filter conditions
      const filters = {
        location: selectedLocation !== "All Locations" ? selectedLocation : null,
        courseName: selectedCourseName !== "All Courses" ? selectedCourseName : null,
        searchQuery: normalizedSearchQuery || null,
      };
  
      // Apply all active filters in a single pass
      const filteredDetails = originalData.filter(data => {
        // Check location filter
        const matchesLocation = filters.location
          ? data.course.courseLocation === filters.location
          : true;
  
        // Check course name filter
        const matchesCourseName = filters.courseName
          ? data.course.courseEngName === filters.courseName
          : true;
  
        // Check search query filter
        const matchesSearchQuery = filters.searchQuery
          ? [
              (data.participant.name || "").toLowerCase(),
              (data.course.courseLocation || "").toLowerCase(),
              (data.course.courseEngName || "").toLowerCase(),
            ].some(field => field.includes(filters.searchQuery))
          : true;
  
        // Return true if all active filters match
        return matchesLocation && matchesCourseName && matchesSearchQuery;
      });
  
      // Log filtered results
      console.log("Filtered Details:", filteredDetails);
  
      // Update the row data with the filtered results
      this.updateRowData(filteredDetails);
    }
  }*/

 // componentDidUpdate is called after the component has updated (re-rendered)
  componentDidUpdate(prevProps, prevState) {
    const { selectedLocation, selectedCourseName, searchQuery } = this.props;

    // Check if the relevant props have changed
    if (
      selectedLocation !== prevProps.selectedLocation ||
      selectedCourseName !== prevProps.selectedCourseName ||
      searchQuery !== prevProps.searchQuery
    ) {
      // Call the filter method when relevant props change
      this.filterRegistrationDetails();
    }

    // Log for debugging
    //console.log("Component did update, current props:", this.props);
    //console.log("Previous props:", prevProps);
    //console.log("Current state:", this.state);
  }


  filterRegistrationDetails() {
    const { section, selectedLocation, selectedCourseName, searchQuery } = this.props;
    console.log("Section:", section);

    if (section === "registration") {
      const { originalData } = this.state;

      console.log("Original Data:", originalData);
      console.log("Filters Applied:", { selectedLocation, selectedCourseName, searchQuery });

      if (
        (selectedLocation === "All Locations" || !selectedLocation) &&
        (selectedCourseName === "All Courses" || !selectedCourseName) &&
        (!searchQuery || searchQuery.trim() === "")
      ) {
        const rowData = originalData.map((item, index) => ({
          id: item._id,
          sn: index + 1,  // Serial number (S/N)
          name: item.participant.name,  // Participant's name
          contactNo: item.participant.contactNumber,  // Contact number
          course: item.course.courseEngName,  // Course English name
          courseChi: item.course.courseChiName,  // Course Chinese name
          location: item.course.courseLocation,  // Course location
          paymentMethod: item.course.payment,  // Payment method
          confirmed: item.official.confirmed,  // Confirmation status
          paymentStatus: item.status,  // Payment status
          recinvNo: item.official.receiptNo,  // Receipt number
          participantInfo: item.participant,  // Participant details
          courseInfo: item.course,  // Course details
          officialInfo: item.official  // Official details
        }));
  
        // Update the row data with the filtered results
        this.setState({rowData});
        this.updateRowData(filteredDetails);
        return;
      }

      // Normalize the search query
      const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase().trim() : '';

      // Define filter conditions
      const filters = {
        location: selectedLocation !== "All Locations" ? selectedLocation : null,
        courseName: selectedCourseName !== "All Courses" ? selectedCourseName : null,
        searchQuery: normalizedSearchQuery || null,
      };


    // Apply filters step by step
    let filteredDetails = originalData;

    // Apply location filter
    if (filters.location) {
      filteredDetails = filteredDetails.filter(data => data.course?.courseLocation === filters.location);
    }

    // Apply course name filter
    if (filters.courseName) {
      filteredDetails = filteredDetails.filter(data => data.course?.courseEngName === filters.courseName);
    }

    // Apply search query filter
    if (filters.searchQuery) {
      filteredDetails = filteredDetails.filter(data => {
        return [
          (data.participant?.name || "").toLowerCase(),
          (data.course?.courseLocation || "").toLowerCase(),
          (data.course?.courseEngName || "").toLowerCase(),
        ].some(field => field.includes(filters.searchQuery));
      });
    }


      // Log filtered results
      console.log("Filtered Details:", filteredDetails);

      const rowData = filteredDetails.map((item, index) => ({
        id: item._id,
        sn: index + 1,  // Serial number (S/N)
        name: item.participant.name,  // Participant's name
        contactNo: item.participant.contactNumber,  // Contact number
        course: item.course.courseEngName,  // Course English name
        courseChi: item.course.courseChiName,  // Course Chinese name
        location: item.course.courseLocation,  // Course location
        paymentMethod: item.course.payment,  // Payment method
        confirmed: item.official.confirmed,  // Confirmation status
        paymentStatus: item.status,  // Payment status
        recinvNo: item.official.receiptNo,  // Receipt number
        participantInfo: item.participant,  // Participant details
        courseInfo: item.course,  // Course details
        officialInfo: item.official  // Official details
      }));

      // Update the row data with the filtered results
      this.setState({rowData})
      this.updateRowData(filteredDetails);
    }
  }

    render()
    {
      ModuleRegistry.registerModules([AllCommunityModule]);
      var paginatedDetails = this.state.registerationDetails;
      console.log("Rows Data:", this.state.rowData);
      return (
        <>
          <div className="registration-payment-container" >
            <div className="registration-payment-heading">
              <h1>{this.props.language === 'zh' ? '报名与支付' : 'Registration And Payment'}</h1>
              <div className="button-row3">
                <button onClick={() => this.saveData(paginatedDetails)}>Save Data</button>
                <div className="file-input-wrapper">
                  <input type="file" id="fileInput" accept=".xlsx, .xls" className="file-input" />
                  <label htmlFor="fileInput" className="custom-file-input">Select File</label>
                </div>
                <button onClick={() => this.exportToLOP(this.state.rowData)}>Export To LOP</button>
              </div>
              <div className="grid-container">
              <AgGridReact
                  columnDefs={this.state.columnDefs}
                  rowData={this.state.rowData}
                  domLayout="normal"
                  paginationPageSize={this.state.rowData.length}
                  sortable={true}
                  statusBar={false}
                  pagination={true}
                  defaultColDef={{
                    resizable: true, // Make columns resizable
                  }}
                  onCellValueChanged={this.onCellValueChanged} // Handle cell click event
                  onCellClicked={this.handleValueClick} // Handle cell click even
              />
              </div>
               {/* Render custom <div> below the expanded row */}
               {this.state.expandedRowIndex !== null && (
               <div
               style={{
                 padding: '10px',
                 backgroundColor: '#e0e0e0',
                 marginLeft: '5%',
                 width: '88vw',
                 height: 'fit-content',
                 borderRadius: '15px', // Make the border more rounded
                 boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Optional: Add a subtle shadow for a floating effect
               }}
                >
                  {/* Custom content you want to display */}
                  <p><strong>More Information</strong></p>
                  <strong>Course Details</strong>
                  <p>
                    <strong>Type: </strong>{this.state.rowData[this.state.expandedRowIndex].courseInfo.courseType}
                  </p>
                  <p>
                    <strong>Location: </strong>{this.state.rowData[this.state.expandedRowIndex].courseInfo.courseLocation}
                  </p>
                  <p>
                    <strong>Price: </strong>{this.state.rowData[this.state.expandedRowIndex].courseInfo.coursePrice}
                  </p>
                  <p>
                    <strong>Duration: </strong>{this.state.rowData[this.state.expandedRowIndex].courseInfo.courseDuration}
                  </p>
                  <strong>Official Use</strong>
                  <p>
                    <strong>Staff Name: </strong>{this.state.rowData[this.state.expandedRowIndex].officialInfo.name}
                  </p>
                  <p>
                    <strong>Received Date: </strong>{this.state.rowData[this.state.expandedRowIndex].officialInfo.date}
                  </p>
                  <p>
                    <strong>Received Time: </strong>{this.state.rowData[this.state.expandedRowIndex].officialInfo.time}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )
  }
}

export default RegistrationPaymentSection;
