  import React, { Component } from 'react';
  import axios from 'axios';
  import '../../../css/sub/course.css';

  class CoursesSection extends Component {
    constructor(props) {
      super(props);
      this.state = {
        courses: [], // All fetched courses
        filteredCourses: [], // Courses filtered based on user inputs
        loading: false,
        hideAllCells: false,
        dataFetched: false,
        clearTable: false,
        currentPage: 1, // Add this
        entriesPerPage: 10 // Add this
      };
      this.tableRef = React.createRef();
    }

    handleEntriesPerPageChange = (e) => {
      this.setState({
        entriesPerPage: parseInt(e.target.value, 10),
        currentPage: 1 // Reset to the first page when changing entries per page
      });
    }

    getPaginatedCourses() {
      const { filteredCourses } = this.state;
      const { currentPage, entriesPerPage } = this.props;
      const indexOfLastCourse = currentPage * entriesPerPage;
      const indexOfFirstCourse = indexOfLastCourse - entriesPerPage;
      return filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    }
  

    async fetchCourses(courseType) {
      try {
        this.setState({ loading: true });
        var response = await axios.post(`http://localhost:3002/courses/`, { "courseType": courseType });
        console.log("Responses:", response)
        //var response = await axios.post(`https://moses-ecss-data.azurewebsites.net/courses/`, { "courseType": courseType });
        var courses = response.data.courses;
        //console.log("From Django:", response);

        // Extract locations and languages
        var locations = await this.getAllLocations(courses);
        var languages = await this.getAllLanguages(courses);

        this.props.passDataToParent(locations, languages);

        // Update state with fetched data
        this.setState({
          courses: courses,
          filteredCourses: courses, // Initially, show all fetched courses
          loading: false,
          hideAllCells: false,
          dataFetched: true,
          locations: locations, // Set locations in state
          languages: languages  // Set languages in state
        });

        this.props.closePopup();
        await this.props.getTotalNumberofCourses(courses.length);

        // Scroll to the leftmost position
        if (this.tableRef.current) {
          this.tableRef.current.scrollLeft = 0;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
        this.props.closePopup();
      }
    }

    

    // Method to get all locations
    getAllLocations = async(courses)  => {
      return [...new Set(courses.map(course => {
        var nameDetails = this.courseNameAndDetails(course.name);
        return nameDetails.location;
      }))];
    }

    // Method to get all languages
    getAllLanguages= async(courses)  =>  {
      return [...new Set(courses.map(course => {
        var courseDetails = this.getSelectedDetails(course.short_description);
        return courseDetails.language;
      }))];
    }

    filterCourses() 
    {
      var {section} = this.props;
      if(section === "courses")
      {
        const { courses } = this.state;
        const { selectedLanguage, selectedLocation, searchQuery } = this.props;
        console.log("Props:", this.props);
       
          // Reset filtered courses to all courses if the search query is empty
          if (!searchQuery && selectedLanguage === "All Languages" && selectedLocation === "All Locations") {
            this.setState({ filteredCourses: courses });
            return;
          }
        
          const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase().trim() : '';

        
          const filteredCourses = courses.filter(course => {
            const nameDetails = this.courseNameAndDetails(course.name);
            const courseDetails = this.getSelectedDetails(course.short_description);
        
            // Normalize fields
            const courseName = course.name.toLowerCase().trim();
            const courseDescription = course.short_description.toLowerCase().trim();
            const location = nameDetails.location.toLowerCase().trim();
            const language = courseDetails.language.toLowerCase().trim();
            const startDate = courseDetails.startDate.toLowerCase().trim();
            const endDate = courseDetails.endDate.toLowerCase().trim();
            const startTime = courseDetails.startTime.toLowerCase().trim();
            const endTime = courseDetails.endTime.toLowerCase().trim();
        
            // Match 'All Languages' and 'All Locations'
            const matchesLanguage = selectedLanguage === "All Languages" || selectedLanguage === "所有语言" || selectedLanguage === "" || !selectedLanguage ? true : language === selectedLanguage.toLowerCase().trim();
            var matchesLocation = selectedLocation === "All Locations" || selectedLocation === "所有地点" || selectedLocation === "" || !selectedLocation ? true : location === selectedLocation.toLowerCase().trim();
        
            // Match search query against multiple fields
          const matchesSearchQuery = normalizedSearchQuery
              ? (courseName.includes(normalizedSearchQuery) ||
                courseDescription.includes(normalizedSearchQuery) ||
                language.includes(normalizedSearchQuery) ||
                startDate.includes(normalizedSearchQuery) ||
                endDate.includes(normalizedSearchQuery) ||
                startTime.includes(normalizedSearchQuery) ||
                endTime.includes(normalizedSearchQuery))
              : true;
            return matchesLanguage && matchesLocation && matchesSearchQuery;
          });
        
          this.setState({ filteredCourses });
        }
    }

    // Function to get CSRF token from cookies
    getCsrfToken = async () => {
      const name = 'csrftoken';
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${name}=`)) {
          return cookie.substring(name.length + 1);
        }
      }
      return null;
    };

    // Axios instance with CSRF token attached
    axiosInstance = axios.create({
      baseURL: 'http://localhost:3002',  // Your Django backend URL
      //baseURL: 'https://moses-ecss-data.azurewebsites.net/',  // Your Django backend URL
      withCredentials: true            // Ensure cookies are sent with requests
    });

    componentDidMount = async () => 
    {
      this.axiosInstance.interceptors.request.use(config => {
        const csrfToken = this.getCsrfToken();
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken;  // Attach CSRF token to headers
        }
        return config;
      });
      var { courseType } = this.props;
      if (courseType && !this.state.dataFetched) {
        await this.fetchCourses(courseType);
      }
    }
  

    
    
    
   /* async componentDidMount() {
      var { courseType } = this.props;
      if (courseType && !this.state.dataFetched) {
        await this.fetchCourses(courseType);
      }
    }*/

      componentDidUpdate(prevProps)
       {

        var { courseType, selectedLanguage, selectedLocation, searchQuery, language } = this.props;

        // Check if any of the relevant props have changed
        if (
          courseType !== prevProps.courseType || 
          language !== prevProps.language
        ) {
          this.setState({ filteredCourses: [] });
          this.fetchCourses(courseType);
        }
        else if (
          selectedLanguage !== prevProps.selectedLanguage ||
          selectedLocation !== prevProps.selectedLocation ||
          searchQuery !== prevProps.searchQuery 
        ) {
          this.filterCourses(); // Filter courses based on updated props
        }
      }

    courseNameAndDetails(product_name) {
      var regex = /<br\s*\/?>/gi;
      var array = product_name.split(regex);
      if (array.length === 3) {
        array[2] = array[2].replace(/[()]/g, '');
        return { "engName": array[1], "chiName": array[0], "location": array[2] };
      }
      if (array.length === 2) {
        array[1] = array[1].replace(/[()]/g, '');
        return { "engName": array[0], "chiName": array[0], "location": array[1] };
      }
    }

    changeMonthToNumber(month) {
      const monthMap = {
        'January': 1,
        'February': 2,
        'March': 3,
        'April': 4,
        'May': 5,
        'June': 6,
        'July': 7,
        'August': 8,
        'September': 9,
        'October': 10,
        'November': 11,
        'December': 12,
        '一月': 1,
        '二月': 2,
        '三月': 3,
        '四月': 4,
        '五月': 5,
        '六月': 6,
        '七月': 7,
        '八月': 8,
        '九月': 9,
        '十月': 10,
        '十一月': 11,
        '十二月': 12,
      };
    
      return monthMap[month] || 0; // Return 0 for invalid month
    }

    convertTo24HourWithHrs(time12) {
      const [time, modifier] = time12.split(/(am|pm)/i); // Split by 'am' or 'pm'
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier.toLowerCase() === "pm" && hours < 12) {
        hours += 12; // Convert PM hours
      } else if (modifier.toLowerCase() === "am" && hours === 12) {
        hours = 0; // Midnight case
      }
      console.log("24 hr Format:", hours);
      // Return formatted time as "HHmm hrs"
      return { hours, minutes }; // Return hours and minutes as an object
    }
    
        

    getSelectedDetails(short_description, vacancy) {
      let array = short_description.split('<p>');
      if (array[0] === '') {
        array.shift(); // Remove the empty string at the start
      }

      array = array.flatMap(element => element.split('</p>'));
      array = array.filter(element => element.trim() !== '');

      var noOfLesson = array.find(item => item.toLowerCase().includes("lesson")).split("<br />")[1].replace(/\n|<b>|<\/b>/g, "").charAt(0);
      var language = array.flatMap(item => item.replace(/\n|<b>|<\/b>/g, "")).find(item => item.toLowerCase().includes("language")).split("<br />").pop().trim();
      var vacancies = array.flatMap(item => item.replace(/\n|<b>|<\/b>/g, "")).find(item => item.toLowerCase().includes("vacancy")).split("<br />").pop().trim().split("/")[2];
      var vacanciesMatch = vacancies.match(/\d+/);
      var startDate = array.flatMap(item => item.replace(/\<strong>|\<\/strong>|\n|<b>|<\/b>/g, "")).find(item => item.toLowerCase().includes("start date")).split("<br />").pop().trim();
      var startDates = startDate.split(" ");
      var day = parseInt(startDates[0])
      var month = this.changeMonthToNumber(startDates[1])
      var year = parseInt(startDates[2]);
      var endDate = array.flatMap(item => item.replace(/\<strong>|\<\/strong>|\n|<b>|<\/b>/g, "")).find(item => item.toLowerCase().includes("end date")).split("<br />").pop().trim();
      var endDates = endDate.split(" ");
      var day1 = parseInt(endDates[0])
      var month1 = this.changeMonthToNumber(endDates[1])
      var year1 = parseInt(endDates[2]);
      let timing = array.flatMap(item => item.replace(/\<strong>|\<\/strong>|\n|<b>|<\/b>/g, "")).find(item => item.toLowerCase().includes("lesson schedule")).split("<br />").pop().trim().split(",")[1].trim();
      let startTime = '';
      let endTime = '';
      
      if (timing) {
        if (timing.includes("&#8211;")) {
          [startTime, endTime] = timing.split("&#8211;").map(t => t.trim());
        }
        if (timing.includes("–")) {
          [startTime, endTime] = timing.split("–").map(t => t.trim());
        }
      }
      const startDateTime = new Date(year, month, day);
      const { hours: startHours, minutes: startMinutes } = this.convertTo24HourWithHrs(startTime);
      startDateTime.setHours(startHours);
      startDateTime.setMinutes(startMinutes);
      startDateTime.setSeconds(0);
      //console.log("Start Date Time:", startDateTime);
      
      const endDateTime = new Date(year1, month1, day1);
      const { hours: endHours, minutes: endMinutes } = this.convertTo24HourWithHrs(endTime); // Fix here
      endDateTime.setHours(endHours);
      endDateTime.setMinutes(endMinutes);
      endDateTime.setSeconds(0);
      console.log("End Date Time:", endDateTime);
      
      //console.log("Today Date:", startDateTime < new Date());
      console.log("Start Date:", startDate, year, month, day, startTime, startHours);

      if(vacancy === 0)
      {
        var status = "Full";
      }
      else if (startDateTime > new Date()) 
      {
        var status = "Available";
      } 
      else if (startDateTime <= new Date() && endDateTime >= new Date()) {
        var status = "Ongoing";
      } 
      else if (endDateTime < new Date()) {
        var status ="Ended";
      } 

      return { noOfLesson, language, vacancies: vacanciesMatch, startDate, endDate, startTime, endTime, status };
    }

    translateLanguage(language, targetLang) {
      var translations = {
        'en': {
          'English': 'English',
          'Mandarin': 'Mandarin',
          'English and Mandarin': 'English and Mandarin'
        },
        'zh': {
          'English': '英文',
          'Mandarin': '中文',
          'English and Mandarin': '英文和中文'
        }
      };
    
      return translations[targetLang][language] || language;
    }

    formatDateToChinese(dateStr) {
      var monthMap = {
        'January': '1月',
        'February': '2月',
        'March': '3月',
        'April': '4月',
        'May': '5月',
        'June': '6月',
        'July': '7月',
        'August': '8月',
        'September': '9月',
        'October': '10月',
        'November': '11月',
        'December': '12月'
      };
      
      var [day, month, year] = dateStr.split(' ');
      var monthChinese = monthMap[month];
      
      return `${year}年${monthChinese}${day}日`;
    }

    formatTimeToChinese(timeStr) {
      var time = timeStr.slice(0, -2);
      var period = timeStr.slice(-2).toUpperCase();
      var hours = parseInt(time.slice(0, -2), 10);
      var minutes = parseInt(time.slice(-2), 10);
      
      if (hours === 12 && minutes === 0 && period === 'PM') {
        return `中午12点`;
      }
      
      let displayHours = hours % 12 || 12;
      let formattedTime = `${displayHours}点${minutes > 0 ? minutes + '分' : ''}`;
      var periodChinese = period === 'AM' ? '上午' : '下午';
      
      return `${periodChinese}${formattedTime}`;
    }

    formatStatusToChinese(status)
    {
      if (status === "Available") {
       return "可用"; // "Available"
      } 
      else if (status === "Ongoing"){
       return "进行中"; // "Ongoing"
      } 
      else if ("Ended") {
        return "已结束"; // "Ended"
      } 
    }

    render() {
      const { hideAllCells, clearTable, currentPage, entriesPerPage } = this.state;
      const paginatedCourses = this.getPaginatedCourses(); // Get paginated courses
    
      return (
        <div className="nsa-course-container">
          <div className="nsa-course-heading">
            <h1>{this.props.language === 'zh' ? (this.props.courseType === 'NSA' ? 'NSA 课程' : 'ILP 课程') : (this.props.courseType === 'NSA' ? 'NSA Course' : 'ILP Course')}</h1>
            <div className="table-wrapper" ref={this.tableRef}>
              {clearTable ? "" : (
                <table>
                  <thead>
                    <tr>
                      <th>{this.props.language === 'zh' ? '课程 ID' : 'Course ID'}</th>
                      <th>{this.props.language === 'zh' ? '课程名称' : 'Course Name'}</th>
                      <th>{this.props.language === 'zh' ? '中心位置' : 'Centre Location'}</th>
                      <th>{this.props.language === 'zh' ? '课程价格' : 'Course Price'}</th>
                      <th>{this.props.language === 'zh' ? '课时数量' : 'No Of Lesson'}</th>
                      <th>{this.props.language === 'zh' ? '语言' : 'Language'}</th>
                      <th>{this.props.language === 'zh' ? '空位' : 'Vacancies'}</th>
                      <th>{this.props.language === 'zh' ? '预计空位' : 'Projected Vacancies'}</th>
                      <th>{this.props.language === 'zh' ? '状态' : 'Status'}</th>
                      <th>{this.props.language === 'zh' ? '开始日期' : 'Start Date'}</th>
                      <th>{this.props.language === 'zh' ? '结束日期' : 'End Date'}</th>
                      <th>{this.props.language === 'zh' ? '开始时间' : 'Start Time'}</th>
                      <th>{this.props.language === 'zh' ? '结束时间' : 'End Time'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCourses.map((course, index) => {
                      var nameDetails = this.courseNameAndDetails(course.name);
                      var courseDetails = this.getSelectedDetails(course.short_description, course.stock_quantity);
                      var coursePrice = parseFloat(course.regular_price);
    
                      return (
                        <tr key={index}>
                          <td>{!hideAllCells && course.id}</td>
                          <td>{!hideAllCells && (this.props.language === 'zh' ? nameDetails.chiName : nameDetails.engName)}</td>
                          <td>{!hideAllCells && nameDetails.location}</td>
                          <td>{!hideAllCells && (coursePrice <= 0 ? this.props.language !== 'zh'? "Free" : "免费 ":`$${coursePrice.toFixed(2)}`)}</td>
                          <td>{!hideAllCells && parseInt(courseDetails.noOfLesson)}</td>
                          <td>{!hideAllCells && this.translateLanguage(courseDetails.language, this.props.language)}</td>
                          <td>{!hideAllCells && course.stock_quantity}</td>
                          <td>{!hideAllCells && parseInt(courseDetails.vacancies)}</td>
                          <td>{!hideAllCells && (this.props.language === 'zh' ? this.formatStatusToChinese(courseDetails.status) : courseDetails.status)}</td>
                          <td>{!hideAllCells && (this.props.language === 'zh' ? this.formatDateToChinese(courseDetails.startDate) : courseDetails.startDate)}</td>
                          <td>{!hideAllCells && (this.props.language === 'zh' ? this.formatDateToChinese(courseDetails.endDate) : courseDetails.endDate)}</td>
                          <td>{!hideAllCells && (this.props.language === 'zh' ? this.formatTimeToChinese(courseDetails.startTime) : courseDetails.startTime)}</td>
                          <td>{!hideAllCells && (this.props.language === 'zh' ? this.formatTimeToChinese(courseDetails.endTime) : courseDetails.endTime)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      );
    }
    
  }

  export default CoursesSection;
