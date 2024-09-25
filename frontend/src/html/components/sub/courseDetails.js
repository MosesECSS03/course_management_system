import React, { Component } from 'react';
import '../../../css/sub/courseDetails.css';

class CourseDetailsSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPayment: ''
    };
  }

  handlePaymentChange = (event) => {
    this.setState({ selectedPayment: event.target.value });
  };

  render() {
    return (
      <div className="course-details-section">
        <div className="input-group">
          <label htmlFor="courseName">Course Name</label>
          <span className="course-detail-text" id="courseName">
            English Name: {this.props.courseEnglishName}
          </span>
          <br />
          <span className="course-detail-text" id="courseName">
            Chinese Name: {this.props.courseChineseName}
          </span>
        </div>
        <div className="input-group">
          <label htmlFor="courseLocation">Course Location</label>
          <span className="course-detail-text" id="courseLocation">
            {this.props.courseLocation}
          </span>
        </div>
        <div className="input-group">
          <label htmlFor="coursePrice">Course Price</label>
          <span className="course-detail-text" id="coursePrice">
            {this.props.coursePrice}
          </span>
        </div>
        <div className="input-group">
          <label htmlFor="courseType">Course Type</label>
          <span className="course-detail-text" id="courseType">
            {this.props.courseType}
          </span>
        </div>
        
        {/* Payment Options Section */}
        <div className="input-group">
          <label>Payment Options</label>
          <div>
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
        </div>
      </div>
    );
  }
}

export default CourseDetailsSection;
