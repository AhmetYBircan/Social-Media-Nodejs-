function generateMailHtml(mailInfo) {
    return `
      <html>
        <head>
          <style>
            /* Your CSS styles can be added here */
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #f8f8f8;
            }
            .mailContainerWrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              height: 80%;
            }
            .mailContainer {
              background-color: #f0f0f0;
              padding: 30px;
              border: 1px solid #ccc;
              border-radius: 10px;
              width: 60%;
            }
            .userName {
              font-size: 30px;
              margin-bottom: 20px;
              color: black;
            }
            .mailText {
              margin-bottom: 30px;
              color: black;
            }
            .teamSocial {
              background-color: #f0f0f0;
              padding: 10px;
              border-radius: 5px;
            }
            .teamSocialText {
              color: black;
            }
          </style>
        </head>
        <body>
          <div class="mailContainerWrapper">
            <div class="mailContainer">
              <div class="userName">Hello ${mailInfo.userName}!</div>
              <div class="mailText">${mailInfo.mailText}</div>
              <div class="teamSocial">
                <span class="teamSocialText">Team Social</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  
module.exports = generateMailHtml