import React, { Component } from 'react';
import '../../../css/sub/courseDetails.css';

class CourseDetailsSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPayment: '',
      paymentTouched: false,
    };
  }

  /*handlePaymentChange = (event) => {
    this.setState({ 
      selectedPayment: event.target.value,
      paymentTouched: true, // Update when user interacts with the payment option
    });
  };*/

   // Handle payment selection and call onChange prop
   handlePaymentChange = (event) => {
    const selectedPayment = event.target.value;
    this.setState({ 
      selectedPayment,
      paymentTouched: true,
    });

    // Pass the selected payment option back to the parent
    this.props.onChange({
      ...this.props.formData,
      payment: selectedPayment,
    });
  };


  render() 
  {
    const { selectedPayment, paymentTouched } = this.state;
    
    return (
      <div className="course-details-section">
        <div className="input-group1">
          <label htmlFor="courseType">Course Type</label>
          <span className="course-detail-text" id="courseType">
            {this.props.courseType}
          </span>
        </div>
        <div className="input-group1">
          <label htmlFor="courseName">Course Name</label>
          <span className="course-detail-text" id="courseName">
            English Name: {this.props.courseEnglishName}
          </span>
          <br />
          <span className="course-detail-text" id="courseName">
            Chinese Name: {this.props.courseChineseName}
          </span>
        </div>
        <div className="input-group1">
          <label htmlFor="courseLocation">Course Location</label>
          <span className="course-detail-text" id="courseLocation">
            {this.props.courseLocation}
          </span>
        </div>
        <div className="input-group1">
          <label htmlFor="coursePrice">Course Price</label>
          <span className="course-detail-text" id="coursePrice">
            {this.props.coursePrice}
          </span>
        </div>
        <div className="input-group1">
          <label htmlFor="courseDuration">Course Duration</label>
          <span className="course-detail-text" id="courseDuration">
            {this.props.courseDuration}
          </span>
        </div>

        
        {/* Payment Options Section */}
        <div className="input-group1">
          <label>Payment Options</label>
          <div className="payment-options">
            <label>
              <input
                type="radio"
                value="Cash"
                checked={this.state.selectedPayment === 'Cash'}
                onChange={this.handlePaymentChange}
              />
              Cash
            </label>
            <label>
              <input
                type="radio"
                value="SkillsFuture"
                checked={this.state.selectedPayment === 'SkillsFuture'}
                onChange={this.handlePaymentChange}
              />
              SkillsFuture
            </label>
            <label>
              <input
                type="radio"
                value="PayNow"
                checked={this.state.selectedPayment === 'PayNow'}
                onChange={this.handlePaymentChange}
              />
              PayNow
            </label>
          </div>
          {!selectedPayment && paymentTouched && (
            <span className="error-message1">Please select a payment option.</span>
          )}
        </div>
      </div>
    );
  }
}

export default CourseDetailsSection;
