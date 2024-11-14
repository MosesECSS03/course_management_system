import React, { Component } from 'react';
import '../../css/formPage.css';
import FormDetails from './sub/formDetails'; // Import the FormDetails component
import PersonalInfo from './sub/personalInfo'; // Import PersonalInfo component
import CourseDetails from './sub/courseDetails'; // Import CourseDetails component
import AgreementDetailsSection from './sub/agreementDetails';
import SubmitDetailsSection from './sub/submitDetails';
import axios from 'axios';

class FormPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSection: 0,
      formData: {
        englishName: '',
        chineseName: '',
        location: '',
        nRIC: '',
        rESIDENTIALSTATUS: '',
        rACE: '',
        gENDER: '',
        dOB: '',
        cNO: '',
        eMAIL: '',
        postalCode: '',
        eDUCATION: '',
        wORKING: '',
        courseName: '',
        courseDate: '',
        agreement: ''  // Corrected key from 'argeement' to 'agreement'
      },
      validationErrors: {}
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const queryParams = new URLSearchParams(window.location.search);
    const englishName = queryParams.get('engName')?.trim() || '';
    const chineseName = queryParams.get('chiName')?.split(":")[1].trim() || '';
    const location = queryParams.get('location')?.trim() || '';
    const price = queryParams.get('price')?.trim() || '';
    const type = queryParams.get('type')?.trim() || '';
    const duration = queryParams.get('courseDuration')?.trim() || '';

    console.log(englishName, chineseName, "Location:", location, price, duration);

    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        englishName,
        chineseName,
        location, 
        price, 
        type,
        duration
      }
    }));
  }

  handleDataChange = (newData) => {
    try
    {
      this.setState((prevState) => {
        const updatedFormData = {
          ...prevState.formData,
          ...newData,
        };
        
        const key = Object.keys(newData)[0];
        const updatedValidationErrors = { ...prevState.validationErrors };
    
        if (updatedValidationErrors[key]) {
          delete updatedValidationErrors[key];
        }

    
        return {
          formData: updatedFormData,
          validationErrors: updatedValidationErrors,
        };
      });
    }
    catch(error)
    {
      console.log(error);
    }
  };

  handleNext = () => {
    const errors = this.validateForm();
    const { currentSection } = this.state;
    console.log(currentSection);
  
    // Payment validation when in CourseDetails section (currentSection === 2)
    if (currentSection === 2 && !this.courseDetailsRef.state.selectedPayment) {
      errors.selectedPayment = 'Please select a payment option.';
      this.courseDetailsRef.setState({ paymentTouched: true });
    }
    
    if (Object.keys(errors).length === 0) {
      if (this.state.currentSection < 4) {
        this.setState({ currentSection: this.state.currentSection + 1 }, () => {
          window.scrollTo(0, 0);
        });
      } 
    } else {
      this.setState({ validationErrors: errors });
    }
  };

  handleSubmit = () => {
    const { formData } = this.state;

    // Participants Details
    var name = formData.pName;
    var nric = formData.nRIC;
    var residentalStatus = formData.rESIDENTIALSTATUS;
    var race = formData.rACE;
    var gender = formData.gENDER;
    var dateOfBirth = formData.dOB.formattedDate;
    var contactNumber = formData.cNO;
    var email = formData.eMAIL;
    var postalCode = formData.postalCode;
    var educationLevel = formData.eDUCATION;
    var workStatus = formData.wORKING;

    // Course 
    var courseType = formData.type;
    var courseEngName = formData.englishName;
    var courseChiName = formData.chineseName;
    var courseLocation = formData.location;
    var coursePrice = formData.price; 
    var courseDuration = formData.duration;
    var payment = formData.payment;

    // Agreement
    var agreement = formData.agreement; // Use the corrected key

    var participantDetails = {
      participant: {
          name: name,
          nric: nric,
          residentialStatus: residentalStatus,
          race: race,
          gender: gender,
          dateOfBirth: dateOfBirth,
          contactNumber: contactNumber,
          email: email,
          postalCode: postalCode,
          educationLevel: educationLevel,
          workStatus: workStatus
      },
      course: {
          courseType: courseType,
          courseEngName: courseEngName,
          courseChiName: courseChiName,
          courseLocation: courseLocation,
          coursePrice: coursePrice,
          courseDuration: courseDuration,
          payment: payment
      },
      agreement: agreement,
      status: "Pending"
    };

    console.log('Participants Details', participantDetails);
    
    // Example of sending data to the server using Axios
    axios.post('https://moses-ecss-backend.azurewebsites.net/courseregistration', {"participantDetails": participantDetails, "purpose": "insert"})
    //axios.post('http://localhost:3001/courseregistration', {"participantDetails": participantDetails, "purpose": "insert"})
      .then((response) => {
        console.log('Form submitted successfully', response.data);
        if(response.data)
        {
          window.close(); 
          //alert("Success");
        }
        else
        {
          //alert("Failure");
        }
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
      });
  };

  validateForm = () => {
    const { currentSection, formData } = this.state;
    const errors = {};

    // Validate fields for PersonalInfo section
    if (currentSection === 1) {
      if (!formData.pName) {
        errors.pName = 'Name is required.';
      }
      if (!formData.location) {
        errors.location = 'Location is required.';
      }
      if (!formData.nRIC) {
        errors.nRIC = 'NRIC Number is required.';
      }
      if (!formData.rESIDENTIALSTATUS) {
        errors.rESIDENTIALSTATUS = 'Residential Status is required.';
      }
      if (!formData.rACE) {
        errors.rACE = 'Race is required.';
      }
      if (!formData.gENDER) {
        errors.gENDER = 'Gender is required.';
      }
      if (!formData.dOB) {
        errors.dOB = 'Date of Birth is required.';
      }
      if (!formData.cNO) {
        errors.cNO = 'Contact No. is required.';
      }
      if (!formData.eMAIL) {
        errors.eMAIL = 'Email is required.';
      }
      if (!formData.postalCode) {
        errors.postalCode = 'Postal Code is required.';
      }
      if (!formData.eDUCATION) {
        errors.eDUCATION = 'Education Level is required.';
      }
      if (!formData.wORKING) {
        errors.wORKING = 'Work Status is required.';
      }
    }
    else if (currentSection === 3) {
      if (!formData.agreement) {
        errors.agreement = 'Please choose the declaration';
      }
    }

    return errors;
  };

  handleBack = () => {
    if (this.state.currentSection > 0) {
      this.setState({ currentSection: this.state.currentSection - 1 });
    }
  };

  render() {
    const { currentSection, formData, validationErrors } = this.state;

    return (
      <div className="formwholepage">
        <div className="form-page">
          <div className="form-container">
            {currentSection === 0 && <FormDetails />}
            {currentSection === 1 && (
              <PersonalInfo data={formData} onChange={this.handleDataChange} errors={validationErrors} />
            )}
            {currentSection === 2 && 
              <CourseDetails 
                ref={(ref) => this.courseDetailsRef = ref} 
                courseEnglishName={formData.englishName} 
                courseChineseName={formData.chineseName} 
                courseLocation={formData.location} 
                coursePrice={formData.price} 
                courseType={formData.type}
                courseDuration={formData.duration}
                payment={formData.payment}
                onChange={this.handleDataChange}
              />
            }
            {currentSection === 3 && <AgreementDetailsSection ref={(ref) => this.agreementDetailsRef = ref} agreement={formData.agreement} onChange={this.handleDataChange} errors={validationErrors}/>}
            {currentSection === 4 && <SubmitDetailsSection />}
          </div>
  
          {/* Conditionally render the button container */}
          {currentSection < 4 && (
            <div className="button-container">
              <button onClick={this.handleBack} disabled={currentSection === 0}>Back</button>
              <button onClick={this.handleNext}>
                {currentSection === 4 ? 'Submit' : 'Next'} 
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default FormPage;
