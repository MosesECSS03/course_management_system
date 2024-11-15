const PDFDocument = require('pdfkit');
const axios = require('axios');
const sharp = require('sharp'); // Import sharp for image processing
const path = require('path');

class PdfGenerator {
    constructor() {}
    
    getCurrentDateTime() {
        const now = new Date();

        // Define an array of full month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Get day, month, year, hours, and minutes
        const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits
        const month = monthNames[now.getMonth()]; // Get full month name using the month index
        const year = now.getFullYear();

        const hours = String(now.getHours()).padStart(2, '0'); // 24-hour format
        const minutes = String(now.getMinutes()).padStart(2, '0'); // Ensure two digits
        const seconds = String(now.getSeconds()).padStart(2, '0'); // Ensure two digits

        // Format date and time
        const formattedDate = `${day} ${month.substring(0,3)} ${year}`; // Full month name
        const formattedTime = `${hours}:${minutes}:${seconds}`;

        return {
            date: formattedDate,
            time: formattedTime,
        };
    }

    async addHeader(doc) {
        const imagePath = "https://ecss.org.sg/wp-content/uploads/2024/10/Screenshot-2024-10-15-112239.jpg";

        try {
            // Fetch the image as a buffer
            const response = await axios.get(imagePath, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);

            // Use sharp to get the image dimensions
            const { width, height } = await sharp(imageBuffer).metadata();

            // Set the left and right margins in points
            const leftMargin = 2.54 * 28.35; // 2.54 cm to points
            const rightMargin = 15.93; // Right margin in points

            // Calculate the effective image width
            const imageWidth = doc.page.width - leftMargin - rightMargin; // Full width minus margins
            const imageHeight = (height / width) * imageWidth; // Maintain aspect ratio

            // Add the image to the document with the left margin
            doc.image(imageBuffer, leftMargin, doc.y, {
                width: imageWidth, // Set the image width to the page width minus margins
                height: imageHeight, // Set the height to maintain the aspect ratio
                align: 'center', // Center the image horizontally
                valign: 'top' // Align the image to the top
            });

            // Move down for spacing below the image
            doc.moveDown(10); // Adjust this for more or less spacing

        } catch (error) {
            console.error('Error fetching the image:', error);
            // Optionally add a placeholder image or handle the error gracefully
        }
    }

    addFooter = async(doc, currentPage, totalPages) =>
    {
        console.log("Add Footer");
        const imagePath = "https://ecss.org.sg/wp-content/uploads/2024/10/ok.png";

        const response = await axios.get(imagePath, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);

        // Use sharp to get the image dimensions
        const { width, height } = await sharp(imageBuffer).metadata();

        // Set the left and right margins in points
        const leftMargin = 0.00 // 2.54 cm to points

        const imageWidth = doc.page.width - leftMargin; // Full width minus margins
        const imageHeight = (height / width) * imageWidth; // Maintain aspect ratio

        const footerYPosition = doc.page.height-50; 

        // Add the image to the document with the left margin
        doc.image(imageBuffer, leftMargin, footerYPosition , {
                width: imageWidth, // Set the image width to the page width minus margins
                height: imageHeight, // Set the height to maintain the aspect ratio
                align: 'center', // Center the image horizontally
                valign: 'top' // Align the image to the top
            });

    }
    

    async addBody(doc, dataArray, currentPage, totalPages, name, receiptNo) 
    {
        const leftMargin = 2.54 * 28.35; // 2.54 cm to points
        const rightMargin = 15.93; // Right margin in points

        const fontPathBold = path.join(__dirname, '../../fonts/ARIALBD.TTF'); // Path to yourbold font file
        const fontPathRegular = path.join(__dirname, '../../fonts/ARIAL.TTF'); // Path to your regular font file
        const fontPathTimesRegular = path.join(__dirname, '../../fonts/timesNewRoman.ttf'); // Path to your Times New Roman font file

        // Set the font to Arial Bold and add the title "RECEIPT"
        if(receiptNo.split("-")[0].trim() !== "SFC")
        {
            doc.font(fontPathBold).fontSize(16).text('RECEIPT', {
                align: 'center' // Center the text
            });
        }
        else
        {
            doc.font(fontPathBold).fontSize(16).text('INVOICE', {
                align: 'center' // Center the text
            });
        }

        

        // Move down for spacing after the title
        doc.moveDown(2); // Adjust the space after the title

        var receiptText = "";

        if(receiptNo.split("-")[0].trim() !== "SFC")
        {
            receiptText = `Receipt No   : ${receiptNo}`;
        }
        else
        {
            receiptText = `Invoice No   : ${receiptNo}`;
        }

        // Store the current y position
        let currentY = doc.y;

        // Add the receipt number on the left side and keep the cursor position
        doc.font(fontPathTimesRegular).fontSize(12).text(receiptText, leftMargin, currentY, {
            continued: true // Keep the position to allow text on the same line
        });

        // Now add the page parts on the same line on the right
        const rightX = doc.page.width - rightMargin - 300; // Adjust this value to align the page number properly

        const pageParts = [
            { text: 'Page ', font: fontPathRegular },
            { text: `${currentPage}`, font: fontPathBold },
            { text: ' of ', font: fontPathRegular },
            { text: `${totalPages}`, font: fontPathBold }
        ];

        // Iterate over the page parts to add them to the document
        for (const part of pageParts) {
            doc.font(part.font).fontSize(12).text(part.text, rightX, currentY, {
                continued: true // This ensures each part stays on the same line
            });
        }

        // Finish the line without continued option
        doc.text('', rightX, currentY, {
            continued: false // End the line here
        });

        // Move down for spacing after the receipt number and current page
        doc.moveDown(1); // Adjust this to ensure the spacing before the date

        // Add a new line before adding the date text
        var getCurrentDateTime = this.getCurrentDateTime();
        const dateText = `Date              : ${getCurrentDateTime.date}`;

        // Add the date on a new line
        doc.font(fontPathTimesRegular).fontSize(12).text(dateText, leftMargin, doc.y, {
            align: 'left' // Align the date to the left
        });
        
        doc.moveDown(1);
         // Add a new line before adding the date text
         const participantName = `Name            : ${dataArray[0].participant.name}`;
 
         // Add the date on a new line
         doc.font(fontPathTimesRegular).fontSize(12).text(participantName, leftMargin, doc.y, {
             align: 'left' // Align the date to the left
         });

         doc.moveDown(1);

         this.createTable(doc, dataArray);

         console.log(name);
        var staffName = `Issue By: ${name}`;

        doc.font(fontPathTimesRegular).fontSize(12).text(staffName, leftMargin, doc.y, {
            align: 'right' // Align the date to the left
        });
        doc.moveDown(5);
    }

    async createTable(doc, dataArray) 
    {
        const fontPathBold = path.join(__dirname, '../../fonts/ARIALBD.TTF'); // Path to your bold font file
        const fontPathRegular = path.join(__dirname, '../../fonts/ARIAL.TTF'); // Path to your regular font file
        const fontPathTimesRegular = path.join(__dirname, '../../fonts/timesNewRoman.ttf'); // Path to your Times New Roman font file

        const leftMargin = 2.54 * 28.35; // Left margin (2.54 cm in points)
        const tableTop = doc.y; // Get the current Y position to place the table

        const columnWidths = {
            serial: 40,          // Width for S/NO column
            description: 340,    // Width for Description column
            amount: 100          // Width for Amount column
        };

        const columnPositions = {
            serial: leftMargin,                                     // First column at left margin
            description: leftMargin + columnWidths.serial,         // Second column next to first
            amount: leftMargin + columnWidths.serial + columnWidths.description  // Third column next to second
        };

        const rowHeight = 40; // Height for the table header
        const borderExternalThickness = 2; // Set the thickness of the external border
        const borderInternalThickness = 1; // Set the thickness of the internal borders
        const headerHeight = rowHeight; // Adjusted header height

        // Draw the header background and external border for the entire table
        doc.rect(leftMargin, tableTop, 
            columnWidths.serial + columnWidths.description + columnWidths.amount, 
            headerHeight)
            .fill('#FBFBFB'); // Set header background color

        // Set font and text size for the header
        doc.fontSize(12).fillColor('black').font(fontPathBold);

        // Add header column titles centered
        doc.text('S/NO', columnPositions.serial + columnWidths.serial / 8, tableTop + 12);
        doc.text('DESCRIPTION', columnPositions.description + columnWidths.description / 3 + 15, tableTop + 12);
        doc.text('AMOUNT', columnPositions.amount + columnWidths.amount / 5 + 5, tableTop + 5);
        doc.text('(S$)', columnPositions.amount + columnWidths.amount / 4 + 10, tableTop + 19);

        // Draw inner vertical borders between columns
        doc.lineWidth(borderInternalThickness)
            .moveTo(columnPositions.serial + columnWidths.serial, tableTop)
            .lineTo(columnPositions.serial + columnWidths.serial, tableTop + headerHeight)
            .stroke('black');

        doc.lineWidth(borderInternalThickness)
            .moveTo(columnPositions.description + columnWidths.description, tableTop)
            .lineTo(columnPositions.description + columnWidths.description, tableTop + headerHeight)
            .stroke('black');

        // Optional: Draw a horizontal line separating the header from the body
        doc.lineWidth(borderExternalThickness)
            .moveTo(leftMargin, tableTop + headerHeight)
            .lineTo(leftMargin + columnWidths.serial + columnWidths.description + columnWidths.amount, tableTop + headerHeight)
            .stroke('black');

        let currentY = tableTop + headerHeight; // Start position for rows immediately after the header
        doc.font(fontPathRegular).fontSize(12); // Set font for table rows

        let totalAmount = 0; 

        dataArray.forEach((item, index) => {
            // Add row content for each entry
            doc.text(index + 1, columnPositions.serial+15, currentY+12); // Serial number
            doc.text(`${item.course.courseEngName} (${item.course.courseLocation})\n${item.course.courseDuration}`, columnPositions.description + 15, currentY+6); // Description
            doc.text(item.course.coursePrice, columnPositions.amount + 30, currentY+12); // Amount

            totalAmount += parseFloat(item.course.coursePrice.substring(1));

            // Draw vertical borders dynamically between columns
            doc.lineWidth(borderInternalThickness)
                .moveTo(columnPositions.serial + columnWidths.serial, currentY)
                .lineTo(columnPositions.serial + columnWidths.serial, currentY + rowHeight)
                .stroke('black');

            doc.lineWidth(borderInternalThickness)
                .moveTo(columnPositions.description + columnWidths.description, currentY)
                .lineTo(columnPositions.description + columnWidths.description, currentY + rowHeight)
                .stroke('black');

            // Move Y position for the next row
            currentY += rowHeight;
        });

        const totalRowY = currentY; 
        doc.font(fontPathRegular).fontSize(12).text('Total:', columnPositions.description + 15, currentY + 12); // Total label
        doc.font(fontPathBold).fontSize(12).text(`$${totalAmount.toFixed(2)}`, columnPositions.amount + 30, currentY + 12); // Total amount

        // Draw vertical borders for the total row
        doc.lineWidth(borderInternalThickness)
        .moveTo(columnPositions.serial + columnWidths.serial, totalRowY) // Vertical line after S/NO
        .lineTo(columnPositions.serial + columnWidths.serial, totalRowY + rowHeight) // Extend line down
        .stroke('black');

        doc.lineWidth(borderInternalThickness)
        .moveTo(columnPositions.description + columnWidths.description, totalRowY) // Vertical line after DESCRIPTION
        .lineTo(columnPositions.description + columnWidths.description, totalRowY + rowHeight) // Extend line down
        .stroke('black');

        // Define the Y position for the top of the line (current row Y position)
        const topLineY = currentY; // Adjust as necessary based on your layout

        // Define the Y position for the bottom of the line (current row height)
        const bottomLineY = currentY + rowHeight; // This assumes rowHeight is set correctly

        doc.lineWidth(borderInternalThickness)
            .moveTo(leftMargin + columnWidths.serial + columnWidths.description, topLineY) // Starting point at the left margin
            .lineTo(leftMargin + columnWidths.serial + columnWidths.description + columnWidths.amount, topLineY) // Draw to the right
            .stroke('black'); // Draw the top line
            
        // Optional: Uncomment to draw the external border around the entire table
        doc.lineWidth(borderExternalThickness)
        .rect(leftMargin, tableTop, 
            columnWidths.serial + columnWidths.description + columnWidths.amount, 
            currentY - tableTop + rowHeight) // Adjust height for total row
        .stroke('black');


        doc.moveDown(3);
    }

    drawRowBorders(doc, leftMargin, columnWidths, currentY, borderThickness, color)
    {
        // Draw left border for the row
        doc.lineWidth(borderThickness)
            .moveTo(leftMargin, currentY) // Start at the left margin
            .lineTo(leftMargin, currentY + 40) // Draw line from top to bottom of the row
            .stroke(color);

        // Draw right border for the row
        doc.lineWidth(borderThickness)
            .moveTo(leftMargin + columnWidths.serial + columnWidths.description + columnWidths.amount, currentY) // Start at the right edge
            .lineTo(leftMargin + columnWidths.serial + columnWidths.description + columnWidths.amount, currentY + 40) // Draw line down
            .stroke(color);

        // Draw top border for the row (optional)
        if (currentY === leftMargin + 40) { // Draw only for the first row
            doc.lineWidth(borderThickness)
                .moveTo(leftMargin, currentY) // Start at the left margin
                .lineTo(leftMargin + columnWidths.serial + columnWidths.description + columnWidths.amount, currentY) // Draw a line across the top of the row
                .stroke(color);
        }

        // Draw bottom border for the row
        doc.lineWidth(borderThickness)
            .moveTo(leftMargin, currentY + 40) // Start at the bottom left
            .lineTo(leftMargin + columnWidths.serial + columnWidths.description + columnWidths.amount, currentY + 40) // Draw a line across the bottom of the row
            .stroke(color);
        
        // Draw internal vertical borders between columns dynamically
        // Between Serial and Description columns
        doc.lineWidth(borderThickness)
            .moveTo(leftMargin + columnWidths.serial, currentY) // Start at the current row position
            .lineTo(leftMargin + columnWidths.serial, currentY + 40) // Extend to the next row position
            .stroke(color);

        // Between Description and Amount columns
        doc.lineWidth(borderThickness)
            .moveTo(leftMargin + columnWidths.serial + columnWidths.description, currentY) // Start at the current row position
            .lineTo(leftMargin + columnWidths.serial + columnWidths.description, currentY + 40) // Extend to the next row position
            .stroke(color);
    }

    async addContent(doc, dataArray, name, receiptNo) {
        console.log("Add Content:", name);
        
        // Initial header addition for the first page
        await this.addHeader(doc, receiptNo); // Add header to the first page
    
        let currentPage = 1; // Initialize current page
        let totalPages = 1; // Initialize total pages
    
        // Add body content for the first page
        await this.addBody(doc, dataArray, currentPage, totalPages, name, receiptNo);
    
        // Example of adding content that might create new pages
        for (let i = 0; i < 5; i++) { // Simulate adding content that spans multiple pages
            // Check if the current content will overflow and create a new page
            if (doc.y > doc.page.height - 50) { // Assuming 50 points is a safe margin for new page
                doc.addPage(); // Add a new page
                currentPage++; // Increment current page count
                totalPages++; // Increment total pages count
                
                // Add header to the new page
                await this.addHeader(doc); 
    
                // Add body content to the new page
                await this.addBody(doc, dataArray, currentPage, totalPages, name, receiptNo);
            }
            
            // Optionally add footer if needed (after body content)
            await this.addFooter(doc, currentPage, totalPages);
        }
    
        // Finalize the total pages if necessary
        // e.g. doc.text(`Total Pages: ${totalPages}`, ...);
    }
    

    async generateReceipt(res, dataArray, name, receiptNo) {
        return new Promise((resolve, reject) => {
            try {
                console.log("Staff Name:", name);
                // Set headers for PDF
                const filename = `Moses.pdf`; 
    
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
                // Set cache headers to allow permanent access
                res.setHeader('Cache-Control', 'public, max-age=315360000'); // Cache for 10 years (in seconds)
                res.setHeader('Expires', new Date(Date.now() + 315360000 * 1000).toUTCString()); // Expires in 10 years
    
                // Log headers just before sending the response
                console.log('Sending headers:', {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `inline; filename="${filename}"`,
                    'Cache-Control': 'public, max-age=315360000',
                    'Expires': new Date(Date.now() + 315360000 * 1000).toUTCString()
                });
    
                const doc = new PDFDocument();
    
                // Add error listener
                doc.on('error', (err) => {
                    console.error('Error while generating PDF:', err);
                    res.status(500).json({ error: 'Error generating PDF' });
                });
    
                doc.pipe(res);
                
                // Ensure addContent is called correctly with await
                this.addContent(doc, dataArray, name, receiptNo)
                    .then(() => {
                        // Finalize the document
                        doc.end();
    
                        // Listen for the finish event to resolve the promise
                        res.on('finish', () => {
                            console.log('PDF response sent successfully.');
                            resolve('PDF response sent successfully.');
                        });
                    })
                    .catch(err => {
                        console.error('Error adding content to PDF:', err);
                        reject('Error adding content to PDF');
                    });
            } catch (error) {
                console.error('Error in PDF generation:', error);
                reject('An unexpected error occurred'); 
            }
        });
    }
}    

module.exports = PdfGenerator;
