var Scraper = require('images-scraper');
const fs = require('fs');
const http = require('http');
const qs = require('querystring');
const data = require('./results.json');

const google = new Scraper({
  puppeteer: {
    headless: false,
  },
});

console.log('first', data);
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
        res.end('Form data received!');
//         res.end(`
//   <html>
//     <body>
//       <h1>Search Results:</h1>
//       ${markup}
//     </body>
//   </html>
// `);

})();
    });
  } else {
    res.end(`
      <html>
        <body>
          <form method="POST" id="myForm">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name"><br>
            <button type="submit" id="submitBtn"> Ok </button>
            </form>
        </body>
      </html>
    `);
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// new
// const Scraper = require('images-scraper');
// const fs = require('fs');
// const readline = require('readline');

// const google = new Scraper({
//   puppeteer: {
//     headless: false,
//   },
// });

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// rl.question('Enter search query: ', async (query) => {
//   const results = await google.scrape(query, 200);
//   console.log('results', results);
//   fs.writeFile('results.json', JSON.stringify(results), (err) => {
//     if (err) throw err;
//     console.log('Results saved to file!');
//   });
//   rl.close();
// });

// const Scraper = require('images-scraper');
// const fs = require('fs');
// const readline = require('readline');

// const google = new Scraper({
//   puppeteer: {
//     headless: false,
//   },
// });

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// rl.question('Enter search query: ', async (query) => {
//   const results = await google.scrape(query, 200);
//   console.log('results', results);
//   fs.writeFile('results.json', JSON.stringify(results), (err) => {
//     if (err) throw err;
//     console.log('Results saved to file!');
//   });
//   rl.close();
// });
