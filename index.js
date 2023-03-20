var Scraper = require('images-scraper');
const fs = require('fs');
const http = require('http');
const qs = require('querystring');

const google = new Scraper({
  puppeteer: {
    headless: false,
  },
});

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      // do something with the form data
      (async () => {
        const formData = qs.parse(body);
        const results = await google.scrape(formData.name, 200);
        // console.log('results', results);
        // console.log(formData);
        const markup = results
          .map((item, key) => {
            return `
            <div>
              <img src="${item.url}" width="100" height="100">
            </div>
          `;
          })
          .join('');

        fs.writeFile('results.json', JSON.stringify(results), (err) => {
          if (err) throw err;
          console.log('Results saved to file!');
        });

        const downloadLink = `<a href="/download" download>Download Results</a>`;
        const homeLink = `<a href="/">Go to Home Page</a>`;

        res.end(`
          <html>
            <body>
              <h1>Search Results download as JSON:${downloadLink} ${homeLink}
              </h1>
              <div style="display: flex;
              flex-wrap: wrap;  gap: 15px;
              ">
              ${markup}
              </div>
            </body>
          </html>
        `);
      })();
    });
  } else if (req.url === '/download') {
    // Trigger the download of the results.json file
    const file = __dirname + '/results.json';
    const stream = fs.createReadStream(file);
    stream.on('open', () => {
      res.setHeader('Content-disposition', 'attachment; filename=results.json');
      stream.pipe(res);
    });
    stream.on('error', (err) => {
      res.setHeader('Content-type', 'text/html');
      res.end(`<html><body><h1>Error</h1><p>${err.message}</p></body></html>`);
    });
  } else {
    res.end(`
      <html>
      <head>
      <style>
        body {
          background: url("https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=755&q=80") no-repeat;
          height:100vh;
          background-size:cover;
          display: flex;
          justify-content: center;
          align-items: center;
          background-position: center;
        }
        .box{
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .input-box {
          border: none;
          border-radius: 5px;
          background-color: #fff;
          padding: 10px;
          font-size: 16px;
          box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
          margin-bottom: 10px;
          width: 300px;
        }
        .input-box:focus {
          outline: none;
          box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
        }
        .submit-btn {
          background-color: #4CAF50;
          color: #fff;
          border: none;
          border-radius: 5px;
          padding: 10px 20px;
          font-size: 16px;
          box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .submit-btn:hover {
          background-color: #3e8e41;
          box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
        }
      </style>
    </head>
        <body>
          <form method="POST" id="myForm" class="box">
            <input type="text" id="name" name="name" class="input-box">
            <button onClick="this.disabled=true;
            this.value='Sending…';
            this.form.submit();"
             id="submitBtn" class="submit-btn"> Get Data </button>
            </form>
        </body>
      </html>
    `);
  }
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});
