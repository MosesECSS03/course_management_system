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

    async addBody(doc, receiptNumber, currentPage, totalPages) {
        const leftMargin = 2.54 * 28.35; // 2.54 cm to points
        const rightMargin = 15.93; // Right margin in points

        const fontPathBold = path.join(__dirname, '../../fonts/ARIALBD.TTF'); // Path to your bold font file
        const fontPathRegular = path.join(__dirname, '../../fonts/ARIAL.TTF'); // Path to your regular font file
        const fontPathTimesRegular = path.join(__dirname, '../../fonts/timesNewRoman.ttf'); // Path to your Times New Roman font file

        // Set the font to Arial Bold and add the title "RECEIPT"
        doc.font(fontPathBold).fontSize(16).text('RECEIPT', {
            align: 'center' // Center the text
        });

        // Move down for spacing after the title
        doc.moveDown(2); // Adjust the space after the title

        // Prepare the receipt number text
        const receiptText = `Receipt No : ${receiptNumber}`;

        // Store the current y position
        let currentY = doc.y;

        // Add the receipt number on the left side and keep the cursor position
        doc.font(fontPathTimesRegular).fontSize(12).text(receiptText, leftMargin, currentY, {
            continued: true // Keep the position to allow text on the same line
        });

        // Now add the page parts on the same line on the right
        const rightX = doc.page.width - rightMargin - 225; // Adjust this value to align the page number properly

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
        const dateText = `Date          : ${getCurrentDateTime.date}`;

        // Add the date on a new line
        doc.font(fontPathTimesRegular).fontSize(12).text(dateText, leftMargin, doc.y, {
            align: 'left' // Align the date to the left
        });
        
        doc.moveDown(1);
         // Add a new line before adding the date text
         const participantName = `Name         : Participant Name`;
 
         // Add the date on a new line
         doc.font(fontPathTimesRegular).fontSize(12).text(participantName, leftMargin, doc.y, {
             align: 'left' // Align the date to the left
         });

         doc.moveDown(1);
         this.createTable(doc);
    }

    async createTable(doc) 
    {
        const fontPathBold = path.join(__dirname, '../../fonts/ARIALBD.TTF'); // Path to your bold font file
        const fontPathRegular = path.join(__dirname, '../../fonts/ARIAL.TTF'); // Path to your regular font file
        const fontPathTimesRegular = path.join(__dirname, '../../fonts/timesNewRoman.ttf'); // Path to your Times New Roman font file
        
        // Define column positions and widths
        const leftMargin = 2.54 * 28.35; // Left margin (2.54 cm in points)
        const tableTop = doc.y; // Get the current Y position to place the table

        const columnWidths = {
            serial: 80,          // Width for S/NO column
            description: 300,    // Width for Description column
            amount: 120          // Width for Amount column
        };

        const columnPositions = {
            serial: leftMargin,                                     // First column at left margin
            description: leftMargin + columnWidths.serial,         // Second column next to first
            amount: leftMargin + columnWidths.serial + columnWidths.description  // Third column next to second
        };

        const rowHeight = 40; // Height for the table header
        const borderExternalThickness = 1.5; // Set the thickness of the external border
        const borderInternalThickness = 1; // Set the thickness of the internal borders
        const headerBgColor = '#FBFBFB'; // Set header background color
        const headerHeight = rowHeight + 30;

        // Draw the thick external border for the entire table
        doc.rect(leftMargin, tableTop, 
            columnWidths.serial + columnWidths.description + columnWidths.amount, 
            rowHeight)
        .fill(headerBgColor)

        // Draw the thick external border for the header
    doc.lineWidth(borderExternalThickness)
    .rect(leftMargin, tableTop, 
        columnWidths.serial + columnWidths.description + columnWidths.amount, 
        headerHeight) // Height for the header
             .stroke('black')

            

        // Set font and text size for the header
        doc.fontSize(12).fillColor('black').font(fontPathBold);

        // Add header column titles centered
        doc.text('S/NO', columnPositions.serial + columnWidths.serial / 4 + 5, tableTop + 12);
        doc.text('DESCRIPTION', columnPositions.description + columnWidths.description / 3 + 15, tableTop + 12);
        doc.text('AMOUNT', columnPositions.amount + columnWidths.amount / 4 + 5, tableTop + 5);
        doc.text('(S$)', columnPositions.amount + columnWidths.amount / 3 + 10, tableTop + 19);

        // Draw inner vertical borders between columns
        doc.lineWidth(borderInternalThickness)
            .moveTo(columnPositions.serial + columnWidths.serial, tableTop)
            .lineTo(columnPositions.serial + columnWidths.serial, tableTop + rowHeight)
            .stroke('black');

        doc.lineWidth(borderInternalThickness)
            .moveTo(columnPositions.description + columnWidths.description, tableTop)
            .lineTo(columnPositions.description + columnWidths.description, tableTop + rowHeight)
            .stroke('black');

        // Optional: Draw a horizontal line separating the header from the body
        doc.lineWidth(borderExternalThickness)
            .moveTo(leftMargin, tableTop + rowHeight)
            .lineTo(leftMargin + columnWidths.serial + columnWidths.description + columnWidths.amount, tableTop + rowHeight)
            .stroke('black');

        // Move the document cursor down after the header row
        doc.moveDown(3); // Adjust as needed to leave space after the header
}

    async addContent(doc, receiptNumber) {
        await this.addHeader(doc); // Add header to the document

        let currentPage = 1; // Initialize current page
        let totalPages = 1; // Initialize total pages

        // Add body content
        await this.addBody(doc, receiptNumber, currentPage, totalPages);

        // Example of adding content that might create new pages
        for (let i = 0; i < 5; i++) { // Simulate adding content that spans multiple page
            // Check if the current content will overflow and create a new page
            if (doc.y > doc.page.height - 50) { // Assuming 50 points is a safe margin for new page
                doc.addPage(); // Add a new page
                currentPage++; // Increment current page count
                await this.addBody(doc, receiptNumber, currentPage, totalPages); // Add the body again with updated page numbers
                totalPages++; // Increment total pages count
            }
        }

        // Finalize the total pages
        // Here, if you know beforehand the total pages, you can set totalPages accordingly.
    }


    async generateReceipt(res, receiptNumber) {
        try {
            // Set headers for PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');

            const doc = new PDFDocument();

            // Add error listener
            doc.on('error', (err) => {
                console.error('Error while generating PDF:', err);
                res.status(500).json({ error: 'Error generating PDF' });
            });

            doc.pipe(res);
            await this.addContent(doc, receiptNumber); // Await the content addition

            // Finalize the document
            doc.end();

            res.on('finish', () => {
                console.log('PDF response sent successfully.');
            });

        } catch (error) {
            console.error('Error in PDF generation:', error);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
}

module.exports = PdfGenerator;
