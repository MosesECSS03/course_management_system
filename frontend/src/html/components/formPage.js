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
    console.log("QueryParams:", queryParams);
    const englishName = queryParams.get('engName')?.trim() || '';
    console.log("English:", englishName);
    const param = queryParams.get('chiName');
    var chineseName = "";
    if (param.includes('Protected')) {
      chineseName = param.split(':')[1].trim();
    } 
    else
    {
      chineseName =  param.trim();
    }
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

    if (currentSection === 3 && !this.agreementDetailsRef.state.selectedChoice) {
      errors.agreement = 'Please choose the declaration.';
      this.agreementDetailsRef.setState({ isSelected: true });
    }


    if (Object.keys(errors).length === 0) {
      if (this.state.currentSection < 4) {
        this.setState({ currentSection: this.state.currentSection + 1 }, () => {
          window.scrollTo(0, 0);
        });
      } 
      if (this.state.currentSection === 3) {
        // Call handleSubmit if on the last section
        this.handleSubmit();
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

    if (currentSection === 1) {
      if (!formData.pName) {
        errors.pName = 'Name is required. 姓名是必填项。';
      }
      if (!formData.location) {
        errors.location = 'Location is required. 地点是必填项。';
      }
      if (!formData.nRIC) {
        errors.nRIC = 'NRIC Number is required. 身份证号码是必填项。';
      }
      if (!formData.rESIDENTIALSTATUS) {
        errors.rESIDENTIALSTATUS = 'Residential Status is required. 居民身份是必填项。';
      }
      if (!formData.rACE) {
        errors.rACE = 'Race is required. 种族是必填项。';
      }
      if (!formData.gENDER) {
        errors.gENDER = 'Gender is required. 性别是必填项。';
      }
      if (!formData.dOB) {
        errors.dOB = 'Date of Birth is required. 出生日期是必填项。';
      }
      if (!formData.cNO) {
        errors.cNO = 'Contact No. is required. 联系号码是必填项。';
      }
      if (!formData.eMAIL) {
        errors.eMAIL = 'Email is required. 电子邮件是必填项。';
      }
      if (!formData.postalCode) {
        errors.postalCode = 'Postal Code is required. 邮政编码是必填项。';
      }
      if (!formData.eDUCATION) {
        errors.eDUCATION = 'Education Level is required. 教育水平是必填项。';
      }
      if (!formData.wORKING) {
        errors.wORKING = 'Work Status is required. 工作状态是必填项。';
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
              <button onClick={this.handleBack} disabled={currentSection === 0}>Back 返回</button>
              <button onClick={this.handleNext}>
                {currentSection === 4 ? 'Submit 提交' : 'Next 下一步'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default FormPage;
