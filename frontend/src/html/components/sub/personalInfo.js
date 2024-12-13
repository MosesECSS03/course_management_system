import React, { Component } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css'; // Import default styles
import '../../../css/sub/personalInfo.css';

// Custom input for the DayPicker component
const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
  <input
    className="personal-info-input"
    value={value}
    onClick={onClick}
    ref={ref}
    placeholder="dd/mm/yyyy"
  />
));

class PersonalInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCalendar: false, // Initialize the showCalendar state
      selectedDate: new Date(1800, 0, 1), // Store the selected date
    };
  }

  // Handle text input change
  handleChange = (e) => {
    const { name, value } = e.target;
    this.props.onChange({ [name]: value });
  };


// Handle backspace dynamically
handleBackspace = (event) => {
  if (event.key === "Backspace") {
    // Check if the input is empty, and if not, update the state dynamically
    const inputDate = this.state.manualDate;
    const newLength = inputDate.length - 1;
    
    if (newLength <= 0) {
      this.setState({ manualDate: '' });
      this.props.onChange({ dOB: { formattedDate: '', chineseDate: '' } });
    } else {
      // Dynamically remove the last entered part of the date (backspace behavior)
      this.setState({ manualDate: inputDate.substring(0, newLength) });
    }
  }
};


  // Handle date change for DayPicker
  handleDateChange = (date) => {
    if (date) {
      // Format the date as dd/mm/yyyy
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      const chineseDate = `${date.getFullYear()}年${(date.getMonth() + 1)}月${date.getDate()}日`;
      // Update both formatted and chinese date values
      this.props.onChange({ dOB: { formattedDate, chineseDate } });
      this.setState({ selectedDate: date }); // Update selected date in state
    } else {
      this.props.onChange({ dOB: { formattedDate: '', chineseDate: '' } });
    }
    this.setState({ showCalendar: false }); // Close calendar after selecting a date

  };

  // Handle month change
  handleMonthChange = (event) => {
    const { selectedDate } = this.state;
    const newMonth = parseInt(event.target.value, 10); // Get selected month (0-based)
    const newDate = new Date(selectedDate.getFullYear(), newMonth, selectedDate.getDate());
  
    // Format the date as dd/mm/yyyy
    const formattedDate = `${newDate.getDate().toString().padStart(2, '0')}/${(newDate.getMonth() + 1).toString().padStart(2, '0')}/${newDate.getFullYear()}`;
    const chineseDate = `${newDate.getFullYear()}年${(newDate.getMonth() + 1)}月${newDate.getDate()}日`;
  
    // Update local state to reflect the new selected date
    this.setState({ selectedDate: newDate });
  
    // Update the parent component with the new formatted date and chinese date
    this.props.onChange({ dOB: { formattedDate, chineseDate } });
    this.setState({ showCalendar: false }); // Close calendar after selecting a date
  };

  // Handle year change
  handleYearChange = (event) => {
    const { selectedDate } = this.state;
    const newYear = parseInt(event.target.value, 10); // Get selected year
    const newDate = new Date(newYear, selectedDate.getMonth(), selectedDate.getDate());

    // Format the date as dd/mm/yyyy
    const formattedDate = `${newDate.getDate().toString().padStart(2, '0')}/${(newDate.getMonth() + 1).toString().padStart(2, '0')}/${newDate.getFullYear()}`;
    const chineseDate = `${newDate.getFullYear()}年${(newDate.getMonth() + 1)}月${newDate.getDate()}日`;

    // Update local state to reflect the new selected date
    this.setState({ selectedDate: newDate });

    // Update the parent component with the new formatted date and chinese date
    this.props.onChange({ dOB: { formattedDate, chineseDate } });
    this.setState({ showCalendar: false }); // Close calendar after selecting a date
  };
  
  // Toggle the calendar visibility
  toggleCalendar = () => {
    this.setState((prevState) => ({ showCalendar: !prevState.showCalendar }));
  };

  // Close the calendar
  closeCalendar = () => {
    this.setState({ showCalendar: false });
  };

  render() {
    const { data, errors } = this.props; // Receive errors from parent

    // Define the sections and their respective fields
    const sections = [
      { name: 'pName', label: 'Name 姓名', placeholder: 'Name 姓名 (As in NRIC 与身份证相符)', isSelect: false },
      { name: 'nRIC', label: 'NRIC Number 身份证号码', placeholder: 'NRIC Number 身份证号码', isSelect: false },
      { name: 'rESIDENTIALSTATUS', label: 'Residential Status 居民身份', placeholder: 'Residential Status 居民身份', isSelect: true, isRadio: true },
      { name: 'rACE', label: 'Race 种族', placeholder: 'Race 种族', isSelect: true, isRadio: true },
      { name: 'gENDER', label: 'Gender 性别', placeholder: 'Gender 性别', isSelect: true, isRadio: true },
      { name: 'dOB', label: 'Date of Birth 出生日期', placeholder: 'Date of Birth 出生日期', isSelect: true, isDate: true },
      { name: 'cNO', label: 'Contact No. 联络号码', placeholder: 'Contact No. 联络号码', isSelect: false },
      { name: 'eMAIL', label: 'Email 电子邮件', placeholder: 'Enter "N/A" if no email 如果没有电子邮件，请输入“N/A”', isSelect: false },
      { name: 'postalCode', label: 'Postal Code 邮区', placeholder: 'Postal Code 邮区', isSelect: false },
      { name: 'eDUCATION', label: 'Education Level 最高教育水平', placeholder: 'Education Level 最高教育水平', isSelect: true, isRadio: true },
      { name: 'wORKING', label: 'Work Status 工作状态', placeholder: 'Work Status 工作状态', isSelect: true, isRadio: true }
    ];

    // Define additional options for radio buttons
    const residentalStatusOptions = ['SC 新加坡公民', 'PR 永久居民'];
    const genderOptions = ['M 男', 'F 女'];
    const educationOptions = [
      'Primary 小学',
      'Secondary 中学',
      'Post-Secondary (Junior College/ITE) 专上教育',
      'Diploma 文凭',
      "Bachelor's Degree 学士学位",
      "Master's Degree 硕士",
      'Others 其它',
    ];
    const workingStatusOptions = [
      'Retired 退休',
      'Employed full-time 全职工作',
      'Self-employed 自雇人',
      'Part-time 兼职',
      'Unemployed 失业',
    ];
    const raceOptions = ['Chinese 华', 'Indian 印', 'Malay 马', 'Others 其他'];

    // Map section names to respective radio button options
    const optionMappings = {
      gENDER: genderOptions,
      eDUCATION: educationOptions,
      rACE: raceOptions,
      wORKING: workingStatusOptions,
      rESIDENTIALSTATUS: residentalStatusOptions,
    };

    // Get all months and years for selection
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentYear = new Date().getFullYear();
    const latestYear = currentYear - 50; // 50 years before the current year
  
    // Assume earliestYear comes from an external source, such as input, settings, etc.
    let earliestYear = 1800; // You can make this dynamic

    // Generate the years in ascending order, from earliestYear to latestYear
    const years = Array.from({ length: latestYear - earliestYear + 1 }, (_, i) => earliestYear + i);

    return (
      <div>
        {sections.map((section) => (
          <div key={section.name} className="input-group1">
            <label htmlFor={section.name}>{section.label}</label>
            {section.isSelect ? (
              section.isDate ? (
                <>
                  <input
                    type="text"
                    className="personal-info-input"
                    value={data.dOB?.formattedDate || ''}
                    onClick={this.toggleCalendar} // Toggle calendar visibility
                    placeholder="dd/mm/yyyy"
                  />
                  {this.state.showCalendar && (
                    <div className="calendar-popup">
                       {/* Month and Year Select Dropdowns */}
                       <div className="month-year-selection">
                        <select
                          value={this.state.selectedDate.getMonth()}
                          onChange={this.handleMonthChange}
                        >
                          {months.map((month, index) => (
                            <option key={index} value={index}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <select
                          value={this.state.selectedDate.getFullYear()}
                          onChange={this.handleYearChange}
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                        <DayPicker
                          selected={data.dOB ? new Date(data.dOB.formattedDate.split('/').reverse().join('-')) : null}
                          onDayClick={this.handleDateChange}
                          month={this.state.selectedDate}
                          maxDate={new Date(new Date().getFullYear() - 50, 0, 1)}  
                          disabled={(date) => date.toDateString() === new Date().toDateString()}  // Disable today's date
                        />
                        <button type="button" onClick={this.closeCalendar}>Close</button>
                    </div>
                  )}
                  <br />
                </>
              ) : (
                section.isRadio && (
                  <div className="radio-group1">
                    {optionMappings[section.name].map((option) => (
                      <label key={option} className="radio-option1">
                        <input
                          type="radio"
                          name={section.name}
                          value={option}
                          checked={data[section.name] === option}
                          onChange={this.handleChange} // Ensure this is set
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )
              )
            ) : (
              <input
                type="text"
                id={section.name}
                name={section.name}
                placeholder={section.placeholder}
                value={section.name === 'dOB' ? data.dOB?.formattedDate : data[section.name] || ''} // Make sure to display formatted date in the textbox
                onChange={this.handleChange} // Ensure onChange is set
                className="personal-info-input1"
              />
            )}
            {errors[section.name] && <span className="error-message3">{errors[section.name]}</span>}
          </div>
        ))}
      </div>
    );
  }
}

export default PersonalInfo;
