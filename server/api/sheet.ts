import { defineEventHandler } from 'h3';
import { google } from 'googleapis';

// Function to read data from Google Sheets
const readData = async () => {
  const auth = await google.auth.getClient({
    credentials: {
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_email: process.env.GOOGLE_CLIENT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Fetch data from both column J and column H
  const rangeJ = 'J2:J500'; // Column J
  const rangeH = 'H2:H500'; // Column H

  try {
    // Get data from both columns
    const responseJ = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID!,
      range: rangeJ,
    });

    const responseH = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID!,
      range: rangeH,
    });

    const dataJ = responseJ.data.values?.map(row => Number(row[0])) || [];
    const dataH = responseH.data.values?.map(row => Number(row[0])) || [];

    // Filter numbers in column J that exist in column H and are within the range 1-300
    const validNumbers = dataJ.filter(num => dataH.includes(num) && num >= 1 && num <= 300);

    return { data: validNumbers }; // Return the valid numbers
  } catch (error) {
    console.error('The API returned an error: ', error);
    throw new Error('Failed to fetch data from Google Sheets');
  }
};

// Define the event handler for GET requests
export default defineEventHandler(async (event) => {
  if (event.req.method === 'GET') {
    return await readData(); // Handle GET request to read data
  }
});
