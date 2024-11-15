import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../css/sub/personalInfo.css';

// Custom input for the DatePicker component
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
  // Handle text input change
  handleChange = (e) => {
    const { name, value } = e.target;
    this.props.onChange({ [name]: value });
  };

  // Handle date change for DatePicker
  handleDateChange = (date) => {
    if (date) {
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      const chineseDate = `${date.getFullYear()}年${(date.getMonth() + 1)}月${date.getDate()}日`;
      this.props.onChange({ dOB: { formattedDate, chineseDate } });
    } else {
      this.props.onChange({ dOB: { formattedDate: '', chineseDate: '' } });
    }
  };

  render() {
    const { data, errors } = this.props; // Receive errors from parent

    // Define the sections and their respective fields
    const sections = [
      { name: 'pName', label: 'Name 姓名', placeholder: 'Name 姓名 (As in NRIC 与身份证相符)', isSelect: false },
      { name: 'nRIC', label: 'NRIC Number', placeholder: 'NRIC Number 身份证号码', isSelect: false },
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

    return (
      <div>
        {sections.map((section) => (
          <div key={section.name} className="input-group1">
            <label htmlFor={section.name}>{section.label}</label>
            {section.isSelect ? (
              section.isDate ? (
                <>
                  <DatePicker
                    selected={data.dOB ? new Date(data.dOB.formattedDate.split('/').reverse().join('-')) : null}
                    onChange={this.handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    customInput={<CustomInput />}
                    placeholderText="DD/MM/YYYY"
                    style={{ fontSize: '2em' }}
                  />
                  <br/>
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
                value={data[section.name] || ''} // Ensure to provide a value
                onChange={this.handleChange} // Ensure onChange is set
                className="personal-info-input1"
              />
            )}
            {errors[section.name] && <span className="error-message1">{errors[section.name]}</span>}
          </div>
        ))}
      </div>
    );
  }
}

export default PersonalInfo;
