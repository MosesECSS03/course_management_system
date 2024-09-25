import React, { Component } from 'react';
import '../../css/formPage.css';
import FormDetails from './sub/formDetailsSection'; // Import the FormDetails component
import PersonalInfo from './sub/personalInfoSection'; // Import PersonalInfo component
import CourseDetails from './sub/courseDetails'; // Import CourseDetails component
import AgreementDetailsSection from './sub/agreementDetails';
import SubmitDetailsSection from './sub/submitDetails';

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
        courseDate: ''
      },
      validationErrors: {}
    };
  }

  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    const englishName = queryParams.get('engName')?.trim() || '';
    const chineseName = queryParams.get('chiName')?.split(":")[1].trim() || '';
    const location = queryParams.get('location')?.trim() || '';
    const price = queryParams.get('price')?.trim() || '';
    const type = queryParams.get('type')?.trim() || '';

    console.log(englishName, chineseName, "Location:", location, price);

    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        englishName,
        chineseName,
        location, 
        price, 
        type
      }
    }));
  }

  handleDataChange = (newData) => {
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        ...newData,
      },
      validationErrors: {}, // Clear errors when data changes
    }));
  };

  handleNext = () => {
    const errors = this.validateForm(); // Call the validation method
    if (Object.keys(errors).length === 0) { // No errors
      if (this.state.currentSection < 4) { // Adjust based on sections
        this.setState({ currentSection: this.state.currentSection + 1 }, () => {
          window.scrollTo(0, 0); // Scroll to top after state update
        });
      }
    } else {
      this.setState({ validationErrors: errors }); // Store errors in state
    }
  };

  validateForm = () => {
    const { currentSection, formData } = this.state;
    const errors = {};

    // Validate fields for PersonalInfo section
    if (currentSection === 1) {
      if (!formData.englishName) {
        errors.englishName = 'English Name is required.';
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

    return errors;
  };

  handleBack = () => {
    if (this.state.currentSection > 0) {
      this.setState({ currentSection: this.state.currentSection - 1 });
    }
  };

  render() {
    const { currentSection, formData, validationErrors } = this.state;
    if (currentSection === 4) {
      // Set a timeout to close the page after rendering SubmitDetailsSection
      setTimeout(() => {
        window.close(); // Close the current tab/window
      }, 5000);
    }
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
                courseEnglishName={formData.englishName} 
                courseChineseName={formData.chineseName} 
                courseLocation={formData.location} 
                coursePrice={formData.price} 
                courseType={formData.type}
              />
            }
            {currentSection === 3 && <AgreementDetailsSection />}
            {currentSection === 4 && <SubmitDetailsSection />} {/* Added SubmitDetailsSection */}
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
