// require('dotenv').config();
// const { google } = require('googleapis');

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GMAIL_CLIENT_ID,
//   process.env.GMAIL_CLIENT_SECRET,
//   'http://localhost/oauth2callback'
// );

// const GMAIL_SCOPES = ['https://mail.google.com/'];

// const url = oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   scope: GMAIL_SCOPES,
// });

// console.log('Authorize this app by visiting this url:', url);

// // After authorization, you'll be redirected to a page with a code.
// // Enter that code here:
// const readline = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// readline.question('Enter the code from that page here: ', (code) => {
//   oauth2Client.getToken(code, (err, tokens) => {
//     if (err) {
//       console.error('Error getting oAuth tokens:', err);
//       return;
//     }
//     console.log('Refresh Token:', tokens.refresh_token);
//     readline.close();
//   });
// });