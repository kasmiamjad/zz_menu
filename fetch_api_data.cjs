const https = require('https');
const fs = require('fs');

const url = 'https://hub.saaed.app/api/product-catalogue/265/297/products?page=1';
const file = fs.createWriteStream("api_products.json");

https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => {
            console.log("Download completed.");
        });
    });
}).on('error', function (err) {
    fs.unlink("api_products.json");
    console.error("Error downloading:", err.message);
});
