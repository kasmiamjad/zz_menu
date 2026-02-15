const https = require('https');
const fs = require('fs');

const url = 'https://hub.saaed.app/catalogue/265/297';
const file = fs.createWriteStream("page_source.html");

https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => {
            console.log("Download completed.");
        });
    });
}).on('error', function (err) {
    fs.unlink("page_source.html");
    console.error("Error downloading:", err.message);
});
