import React, { Component } from 'react';
import axios from 'axios';
import '../../../css/sub/accounts.css';

class AccountsSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [], // All fetched courses
      filteredAccounts: [], // Courses filtered based on user 
      accessRights: [], // All fetched courses
      filteredAccessRights: [],
      loading: false,
      hideAllCells: false,
      dataFetched: false,
      clearTable: false,
      currentPage: 1, // Add this
      entriesPerPage: 10 // Add this
    };
    this.tableRef = React.createRef();
  }

  async fetchAccounts() 
  {
    try {
      this.setState({ loading: true });
      var response = await axios.post(`https://moses-ecss-backend.azurewebsites.net/accountDetails`, { "purpose": "retrieve"});
      //var response = await axios.post(`http://localhost:3001/accountDetails`, { "purpose": "retrieve"});
      console.log(response.data.result);
      var roles = this.getAllRoles(response.data.result);

      await this.props.getTotalNumberofAccounts(response.data.result.length);
      this.props.passDataToParent(roles);
      this.props.closePopup();
      
        // Update state with fetched data
        this.setState({
            accounts: response.data.result, // All fetched courses
            filteredAccounts: response.data.result, // Courses filtered based on user inputs
            loading: false,
            hideAllCells: false,
            dataFetched: true,
            roles:roles // Set locations in state
          });
  
    } catch (error) {
      console.error('Error fetching data:', error);
      this.setState({ loading: false });
      this.props.closePopup();
    }
  }

  async fetchAccessRights() 
  {
    try {
      this.setState({ loading: true });
      var response = await axios.post(`https://moses-ecss-backend.azurewebsites.net/accessRights`, { "purpose": "retrieve"});
      //var response = await axios.post(`https://localhost:3001/accessRights`, { "purpose": "retrieve"});
      console.log("Fetch Access Rights:",response.data.result);
      var roles = this.getAllRolesAccessRight(response.data.result);

      await this.props.getTotalNumberofAccounts(response.data.result.length);
      this.props.passDataToParent(roles);
      this.props.closePopup();
      
        // Update state with fetched data
        this.setState({
            accessRights: response.data.result, // All fetched courses
            filteredAccessRights: response.data.result, // Courses filtered based on user inputs
            loading: false,
            hideAllCells: false,
            dataFetched: true,
            roles:roles // Set locations in state
          });
  
    } catch (error) {
      console.error('Error fetching data:', error);
      this.setState({ loading: false });
      this.props.closePopup();
    }
  }


  getAllRoles(accounts) {
    return [...new Set(accounts.map(account => {
      return (account.role);
    }))];
  }

  getAllRolesAccessRight(accessRights) {
    return [...new Set(accessRights.map(accessRights => {
      return (accessRights["Account Details"]["Role"]);
    }))];
  }
  
  async componentDidMount() {
    var { accountType } = this.props;
   // console.log("ComponentDidMount:", accountType);
    if (accountType && !this.state.dataFetched && accountType === "Accounts") {
      await this.fetchAccounts();
    }
    else if (accountType && !this.state.dataFetched && accountType === "Access Rights") 
    {
      await this.fetchAccessRights();
    }
  }

  
  componentDidUpdate(prevProps)
  {
   var { accountType, selectedAccountType, language, searchQuery } = this.props;
    //console.log("Component Did Update:", accountType, prevProps.accountType, accountType !== prevProps.accountType);
   // Check if any of the relevant props have changed
   if (
     accountType !== prevProps.accountType ||
     language !== prevProps.language 
   ) {
      if(accountType === "Accounts")
     {
        this.fetchAccounts();
     }
     else if(accountType === "Access Rights")
     {
         this.fetchAccessRights();
        //this.props.closePopup();
     }
   }
   else if ( 
    selectedAccountType !== prevProps.selectedAccountType || 
    searchQuery !== prevProps.searchQuery 
  ) {
        if(accountType === "Accounts")
        {
            this.filterAccounts();
        }
        else if(accountType === "Access Rights")  
        {
            this.filterAccessRights();
           //this.props.closePopup();
        }
  }
  else if (prevProps.key !== this.props.key) {
    this.filterAccounts();
  }
 }

  getPaginatedDetails() {
    const { filteredAccounts } = this.state;
    const { currentPage, entriesPerPage } = this.props;
    const indexOfLastCourse = currentPage * entriesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - entriesPerPage;
    return filteredAccounts.slice(indexOfFirstCourse, indexOfLastCourse);
  }

  getPaginatedAccessDetails()
  {
    //console.log("getPaginatedAccessDetails()", this.props);
    const { filteredAccessRights } = this.state;
    const { currentPage, entriesPerPage } = this.props;
    const indexOfLastCourse = currentPage * entriesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - entriesPerPage;
    //console.log(filteredAccessRights.slice(indexOfFirstCourse, indexOfLastCourse))
    return filteredAccessRights.slice(indexOfFirstCourse, indexOfLastCourse);
  }

 filterAccounts() {
    const { section } = this.props;

    if (section === "accounts") {
        const { accounts } = this.state;
        const { selectedAccountType, searchQuery} = this.props;

        // Reset filtered courses to all courses if the search query is empty
        if (selectedAccountType === "All Roles") {
            this.setState({ filteredAccounts: accounts });
            return;
        }

        const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase().trim() : '';

        const filteredDetails = accounts.filter(data => {
            // Extract participant propertie
           // console.log("Data:", data);
            var name = data.name.toLowerCase().trim() || "";
            var email = data.email.toLowerCase().trim() || "";
            var password = data.password.toLowerCase().trim() || "";
            var role = data.role.toLowerCase().trim() || "";
            var date_created = data.date_created.toLowerCase().trim() || "";
            var time_created = data.time_created.toLowerCase().trim() || "";
            var first_time_log_in = data.first_time_log_in.toLowerCase().trim() || "";
            var date_log_in = data.date_log_in.toLowerCase().trim() || "";
            var time_log_in = data.time_log_in.toLowerCase().trim() || "";
            var date_log_out = data.date_log_out.toLowerCase().trim() || "";
            var time_log_out = data.time_log_out.toLowerCase().trim() || "";

            const matchesRoles = selectedAccountType === "All Roles" || 
            selectedAccountType === "所有语言" || 
            selectedAccountType === "" || 
            !selectedAccountType 
            ? true 
            : role === selectedAccountType.toLowerCase().trim();

            const matchesSearchQuery = normalizedSearchQuery
                  ? (name.includes(normalizedSearchQuery) ||
                     email.includes(normalizedSearchQuery) ||
                     password.includes(normalizedSearchQuery) ||
                     role.includes(normalizedSearchQuery) ||
                     date_created.includes(normalizedSearchQuery) ||
                     time_created.includes(normalizedSearchQuery) ||
                     first_time_log_in.includes(normalizedSearchQuery)||
                     date_log_in.includes(normalizedSearchQuery) ||
                     time_log_in.includes(normalizedSearchQuery) ||
                     date_log_out.includes(normalizedSearchQuery) ||
                     time_log_out.includes(normalizedSearchQuery))
                  : true;

            return matchesRoles && matchesSearchQuery;;
        });
        //console.log(filteredDetails);

        // If filteredDetails is empty, set registerationDetails to an empty array
       this.setState({ filteredAccounts: filteredDetails.length > 0 ? filteredDetails : [] });
    }
}

filterAccessRights() 
{
    const { section } = this.props;

    if (section === "accounts") {
        const { accessRights } = this.state;
        const { selectedAccountType, searchQuery} = this.props;

        // Reset filtered courses to all courses if the search query is empty
        if (selectedAccountType === "All Roles") {
            this.setState({ filteredAccessRights: accessRights });
            return;
        }

        const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase().trim() : '';

        const filteredDetails = accessRights.filter(data => {
            // Extract participant propertie
           // console.log("Data:", data);
            var name = data["Account Details"]["Name"].toLowerCase().trim() || "";
            var role = data["Account Details"]["Role"].toLowerCase().trim() || "";

            const matchesRoles = selectedAccountType === "All Roles" || 
            selectedAccountType === "所有语言" || 
            selectedAccountType === "" || 
            !selectedAccountType 
            ? true 
            : role === selectedAccountType.toLowerCase().trim();

            const matchesSearchQuery = normalizedSearchQuery
                  ? (name.includes(normalizedSearchQuery) ||
                     role.includes(normalizedSearchQuery))
                  : true;

            return matchesRoles && matchesSearchQuery;
        });
        //console.log(filteredDetails);

        // If filteredDetails is empty, set registerationDetails to an empty array
       this.setState({ filteredAccessRights: filteredDetails.length > 0 ? filteredDetails : [] });
    }
}

accountInfo = async(account) =>
{
  //console.log("Account Information:", account._id);
  this.props.edit(account._id)
}

accessRightInfo = async(accessRight) =>
{
    console.log("Access Rights  :", accessRight);
    this.props.updateAccessRights(accessRight);
}

  render() 
  {
    const { hideAllCells, clearTable, currentPage, entriesPerPage, accounts, filteredAccounts, accessRights, filteredAccessRights, accountType } = this.state;
    var paginatedDetails = this.getPaginatedDetails();
    var paginatedDetails1 = this.getPaginatedAccessDetails();

      //console.log(filteredAccessRights);
      //paginatedDetails = this.getPaginatedAccessDetails();
    return (
      <div className="accounts-container">
        <div className="accounts-heading">
          <h1>{this.props.language === 'zh' ? (this.props.courseType === 'NSA' ? 'NSA 课程' : 'ILP 课程') : (this.props.accountType === 'Accounts' ? 'Accounts Table' : 'Access Rights Table')}</h1>
          <div className="table-wrapper" ref={this.tableRef}>
            { this.props.accountType === 'Accounts'? (
              <table>
                <thead>
                  <tr>
                    <th>{this.props.language === 'zh' ? '' : 'Name'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Email'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Password'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Account Type'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Date Created'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Time Created'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'First Time Log In'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Date Log In'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Time Log In'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Date Log Out'}</th>
                    <th>{this.props.language === 'zh' ? '' : 'Time Log Out'}</th>
                  </tr>
                </thead>
                <tbody>
                {paginatedDetails.map((account, index) => { 
                      return (
                        <tr key={index} onClick={() => this.accountInfo(account)}>
                          <td>{account.name}</td>
                          <td>{account.email}</td>
                          <td>{account.password}</td>
                          <td>{account.role}</td>
                          <td>{account.date_created}</td>
                          <td>{account.time_created}</td>
                          <td>{account.first_time_log_in}</td>
                          <td>{account.date_log_in}</td>
                          <td>{account.time_log_in}</td>
                          <td>{account.date_log_out}</td>
                          <td>{account.time_log_out}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ): (
                <table>
                  <thead>
                    <tr>
                      <th colspan="2">{this.props.language === 'zh' ? '' : 'Account Details'}</th>
                      <th colspan="2">{this.props.language === 'zh' ? '' : 'Accounts'}</th>
                      <th colspan="5">{this.props.language === 'zh' ? '' : 'Courses'}</th>
                      <th colspan="3">{this.props.language === 'zh' ? '' : 'Registration And Payment'}</th>
                      <th colspan="4">{this.props.language === 'zh' ? '' : 'QR Code'}</th>
                    </tr>
                    <tr>
                      <th>{this.props.language === 'zh' ? '' : 'Name'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Role'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Account Table'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Access Rights Table'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Upload Courses'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'NSA Courses'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'ILP Courses'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Update Courses'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Delete Courses'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Registration And Payment Table'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Inovice Table'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Create QR Code'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'QR Code Table'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Update QR Code'}</th>
                      <th>{this.props.language === 'zh' ? '' : 'Delete QR Code'}</th>
                    </tr>
                  </thead>
                  <tbody>
                  {paginatedDetails1.map((accessRight, index) => { 
                      return (
                        <tr key={index} onClick={() => this.accessRightInfo(accessRight)}>
                          <td>{accessRight["Account Details"]["Name"]}</td> 
                          <td>{accessRight["Account Details"]["Role"]}</td>
                          <td><input type="checkbox" checked={accessRight["Account"]["Account Table"]} disabled readOnly/></td> 
                          <td><input type="checkbox" checked={accessRight["Account"]["Account Table"]} disabled readOnly/></td> 
                          <td><input type="checkbox" checked={accessRight["Courses"]["Upload Courses"]} disabled readOnly/></td> 
                          <td><input type="checkbox" checked={accessRight["Courses"]["NSA Courses"]} disabled readOnly/></td>
                          <td><input type="checkbox" checked={accessRight["Courses"]["ILP Courses"]} disabled readOnly/></td> 
                          <td><input type="checkbox" checked={accessRight["Courses"]["Update Courses"]} disabled readOnly/></td>
                          <td><input type="checkbox" checked={accessRight["Courses"]["Delete Courses"]} disabled readOnly/></td>
                          <td><input type="checkbox" checked={accessRight["Registration And Payment"]["Registration And Payment Table"]} disabled readOnly/></td>
                          <td><input type="checkbox" checked={accessRight["Registration And Payment"]["Invoice Table"]} disabled readOnly/></td>
                          <td><input type="checkbox" checked={accessRight["QR Code"]["Create QR Code"]} disabled readOnly/></td>
                          <td><input type="checkbox" checked={accessRight["QR Code"]["QR Code Table"]} disabled readOnly/></td>
                          <td><input type="checkbox" checked={accessRight["QR Code"]["Update QR Code"]} disabled readOnly/></td>
                          <td><input type="checkbox" checked={accessRight["QR Code"]["Delete QR Code"]} disabled readOnly/></td>
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

export default AccountsSection;
