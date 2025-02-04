import React, { Component } from 'react';
import { DatePicker } from "@heroui/date-picker";
import 'react-day-picker/style.css'; // Import default styles
import '../../../css/sub/personalInfo.css'; // Custom styles

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
      manualDate: '', // Store the manual input for backspace handling
    };
  }

  // Handle text input change
  handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`${name}: ${value}`);
    this.props.onChange({ [name]: value });
  };

  handleChange1 = (e, field) => {
    if(field === "DOB")
    {
      const { name, value } = e.target;
      console.log(`${name}: ${value}`);
      this.setState({manualDate: value});
      this.props.onChange({ [name]: value });
    }
  };


  // Handle backspace dynamically
  handleBackspace = (event) => {
    if (event.key === "Backspace") {
      const inputDate = this.state.manualDate;
      const newLength = inputDate.length - 1;

      if (newLength <= 0) {
        this.setState({ manualDate: '' });
        this.props.onChange({ dOB: { formattedDate: '', chineseDate: '' } });
      } else {
        this.setState({ manualDate: inputDate.substring(0, newLength) });
      }
    }
  };

  handleDateChange = (date) => {
    console.log("Handle Date Change:", date);
  
    if (date) {
      // Format the date as dd/mm/yyyy
      const formattedDate = `${date.day.toString().padStart(2, '0')}/${(date.month + 1).toString().padStart(2, '0')}/${date.year}`;
  
      // Format the date as yyyy年mm月dd日 for Chinese format
      //const chineseDate = `${date.getFullYear()}年${(date.getMonth() + 1)}月${date.getDate()}日`;
  
      // Update the state with the selected date and formatted dates
      this.setState({ selectedDate: date, manualDate: formattedDate });
  
      // Optionally, pass the formatted date back to parent (if needed)
      this.props.onChange({ dOB: { formattedDate} });
    } else {
      // If no date is selected, clear the date
      this.setState({ selectedDate: null, manualDate: '' });
  
      // Optionally, pass empty values to parent
      this.props.onChange({ dOB: { formattedDate: ''} });
    }
  };

  // Toggle the calendar visibility
  toggleCalendar = (e) => {
    this.setState((prevState) => ({ showCalendar: !prevState.showCalendar }));
  };

  // Close the calendar
  closeCalendar = () => {
    this.setState({ showCalendar: false });
  };

  render() {
    const { data = {}, errors } = this.props; // Default value for data is an empty object

    // Define the sections and their respective fields
    const sections = [
      { name: 'pName', label: 'Name 姓名', placeholder: 'Name 姓名 (As in NRIC 与身份证相符)', isSelect: false, isRadio: false },
      { name: 'nRIC', label: 'NRIC Number 身份证号码', placeholder: 'NRIC Number 身份证号码', isSelect: false, isRadio: false },
      { name: 'rESIDENTIALSTATUS', label: 'Residential Status 居民身份', placeholder: 'Residential Status 居民身份', isSelect: true, isRadio: true },
      { name: 'rACE', label: 'Race 种族', placeholder: 'Race 种族', isSelect: true, isRadio: true },
      { name: 'gENDER', label: 'Gender 性别', placeholder: 'Gender 性别', isSelect: true, isRadio: true },
      { name: 'dOB', label: 'Date of Birth 出生日期', placeholder: 'Date of Birth 出生日期', isSelect: true, isDate: true },
      { name: 'cNO', label: 'Contact No. 联络号码', placeholder: 'Contact No. 联络号码', isSelect: false, isRadio: false },
      { name: 'eMAIL', label: 'Email 电子邮件', placeholder: 'Enter "N/A" if no email 如果没有电子邮件，请输入“N/A”', isSelect: false, isRadio: false },
      { name: 'postalCode', label: 'Postal Code 邮区', placeholder: 'Postal Code 邮区', isSelect: false, isRadio: false },
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
      let earliestYear = 1934; // You can make this dynamic
  
      // Generate the years in ascending order, from earliestYear to latestYear
      const years = Array.from({ length: latestYear - earliestYear + 1 }, (_, i) => earliestYear + i);
  
      const maxDate = new Date();
      console.log("Last Year:", maxDate.getFullYear()-55);
      maxDate.setFullYear(maxDate.getFullYear() - 55);

    return (
      <div>
        {sections.map((section) => (
          <div key={section.name} className="input-group1">
            <label htmlFor={section.name}>{section.label}</label>
            {section.isRadio ? (
              <div className="radio-group1">
                {optionMappings[section.name]?.map((option) => (
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
            ) : section.isSelect && section.isDate ? (
              <>
                <input
                  id={section.name}
                  name={section.name}
                  type="text"
                  className="personal-info-input"
                  //value={data[section.name] || ''}
                  value={this.state.manualDate || ''}
                  onClick={(e) => { e.stopPropagation(); this.toggleCalendar(e); }}
                  placeholder="dd/mm/yyyy"
                  onChange={(e) => { e.stopPropagation(); this.handleChange1(e, "DOB"); }} // Ensure onChange is set
                />
                {this.state.showCalendar && (
                  // Set the max date to 55 years before today
                  // Inside your DatePicker
                  <DatePicker
                    selected={this.state.selectedDate}
                    onChange={this.handleDateChange}
                    minDate={maxDate} // Limit date selection to 55 years ago
                    showCalendar={this.state.showCalendar}
                    onCalendarToggle={() => this.setState({ showCalendar: !this.state.showCalendar })}
                    month={this.state.selectedDate}
                  />
                )}
              </>
            ) : (  
              <input
                type="text"
                id={section.name}
                name={section.name}
                placeholder={section.placeholder}
                value={data[section.name] || ''} // Ensure we use empty string as fallback
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
