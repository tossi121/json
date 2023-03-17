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
        <body>
          <form method="POST" id="myForm">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name"><br>
            <button onClick="this.disabled=true;
            this.value='Sending…';
            this.form.submit();"
             id="submitBtn"> Ok </button>
            </form>
        </body>
      </html>
    `);
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
