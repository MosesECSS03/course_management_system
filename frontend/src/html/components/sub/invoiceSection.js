import React, { Component } from 'react';
import axios from 'axios';
import '../../../css/sub/invoiceSection.css';

class InvoiceSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            months: [], // To store the months from invoice data
            selectedMonth: '', // To store the selected month
            courses: [], // To store courses data for the selected month
            totalPrice: '', // To store the total price for the selected month
            totalPriceInWords: '', // To store total price in words
        };
        this.tableRef = React.createRef();
    }

    // Fetch invoice data when the component mounts
    componentDidMount = async () => {
        await this.fetchInvoiceDetails();
    };

    // Fetch invoice data from API
    fetchInvoiceDetails = async () => {
        try {
            const response = await axios.post('http://localhost:3002/invoice_report/');
            const invoice = response.data.invoice; // Assuming invoice is the main key here
            console.log("Invoice Details:", invoice);

            // Get months dynamically from the invoice data
            const months = Object.keys(invoice);
            this.setState({ months, invoiceData: invoice });
        } catch (error) {
            console.error('Error fetching invoice details:', error);
        }
    };

    // Handle month selection change
    handleInvoiceChange = (event) => {
        const selectedMonth = event.target.value;
        this.setState({ selectedMonth });

        const { invoiceData } = this.state;

        // Check if the selected month exists in the data
        if (selectedMonth && invoiceData[selectedMonth]) {
            console.log('Selected Month:', selectedMonth);
            console.log('Selected Month Data:', invoiceData[selectedMonth]);

            // Log total price and total price in words
            const totalPrice = invoiceData[selectedMonth].total_price;
            const totalPriceInWords = invoiceData[selectedMonth].total_price_in_words;
            console.log('Total Price:', totalPrice);
            console.log('Total Price in Words:', totalPriceInWords);

            // Store the courses, total price, and total price in words in the state
            const courses = invoiceData[selectedMonth].courses;
            this.setState({
                courses,
                totalPrice,
                totalPriceInWords
            });
        } else {
            console.log('No data found for selected month');
            this.setState({
                courses: [],
                totalPrice: '',
                totalPriceInWords: ''
            });
        }
    };

    generateInvoice = async () => {
        const { courses, months, totalPrice, totalPriceInWords } = this.state;
    
        // Check if both arrays have elements
        if (courses.length > 0 || months.length > 0) {
            try {
                const response = await axios.post('http://localhost:3001/invoice', { purpose: 'generateInvoice', details: courses, totalPrice: totalPrice, totalPriceInWords: totalPriceInWords}, { responseType: 'blob' });
                 
                // Extract filename from Content-Disposition header
                  const contentDisposition = response.headers['content-disposition'];
                  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                  let filename = filenameMatch && filenameMatch[1] ? filenameMatch[1].replace(/['"]/g, '') : 'unknown.pdf';

                  console.log(`Filename: ${filename}`);

                  // Create a Blob for the PDF
                  const blob = new Blob([response.data], { type: 'application/pdf' });
                  const url = window.URL.createObjectURL(blob);

                  // Open PDF in a new tab
                  const pdfWindow = window.open();
                  pdfWindow.location.href = url;

            } catch (error) {
                console.error('Error generating invoice:', error);
            }
        } else {
            console.log("Cannot generate invoice: Courses or months are empty");
        }
    };

    render() {
        const { months, selectedMonth, courses, totalPrice, totalPriceInWords } = this.state;

        return (
            <div className='invoice-section'>
                <h1>Invoice</h1>
                <div id="invoiceSelectBox">
                    <label htmlFor="monthDropdown">Choose a Month:</label>
                    <select
                        id="monthDropdown"
                        value={selectedMonth}
                        onChange={this.handleInvoiceChange} // Fixed to call correct function
                    >
                        <option value="" disabled>Select a Month</option>
                        {months.map((month, index) => (
                            <option key={index} value={month}>
                                {month}
                            </option>
                        ))}
                    </select>
                    <div className="button-row6">
                        <button onClick={() => this.generateInvoice()}>Generate Invoice</button>             
                    </div>
                </div>

                {/* Table for displaying courses and details */}
                {selectedMonth && (
                    <>
                        <div className="table-wrapper" ref={this.tableRef}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Location</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Individual Price</th>
                                        <th>Number of People Paid</th>
                                        <th>Total Price for Course</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course, index) => {
                                        // Calculate total price for each course
                                        const individualPrice = parseFloat(course.details.price.replace('$', '').replace(',', ''));
                                        const numberOfPeoplePaid = course.details.count;
                                        const totalPriceForCourse = (individualPrice * numberOfPeoplePaid).toFixed(2);

                                        return (
                                            <tr key={index}>
                                                <td>{course.course}</td>
                                                <td>{course.location}</td>
                                                <td>{course.details.startDate}</td>
                                                <td>{course.details.endDate}</td>
                                                <td>{course.details.price}</td>
                                                <td>{numberOfPeoplePaid}</td>
                                                <td>${totalPriceForCourse}</td>
                                            </tr>
                                        );
                                    })}
                                      <tr>
                                        <td colspan="5"></td>
                                            <th>Total</th>
                                            <td>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {totalPrice}
                                                </span>
                                                <br />
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {totalPriceInWords}
                                                </span>
                                            </td>
                                        </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        );
    }
}

export default InvoiceSection;
