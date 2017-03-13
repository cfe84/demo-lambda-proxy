var https = require('https');

var config = {
    hostname: process.env.TARGET_HOSTNAME,
    path: process.env.TARGET_PATH,
    method: process.env.TARGET_METHOD,
    headers: JSON.parse(`{"headers": ${process.env.HEADERS}}`).headers
};

exports.handler = (event, context, callback) => {
    if (! ("headers" in event))
        return callback("Missing headers in event body, you need to set body mapping in gateway.");
    if (! ("body" in event))
        return callback("Missing body in event body, you need to set body mapping in gateway.");
    
    var headers = { };
    config.headers.forEach(
        (header) => {
            if (! (header in event.headers))
                return callback(`Missing header "${header}"`);
            else
                headers[header] = event.headers[header];
        });
    
    var options = {
        hostname: config.hostname,
        port: 443,
        path: config.path,
        method: config.method,
        headers
    };
   
    var req = https.request(options, (res) => {
    
        var data = '';
        res.on('data', (d) => {
            data += d;
        });
        
        res.on('end', (e) => {
            if(res.statusCode < 400){
                console.log("Success for event: " + JSON.stringify(event.body));
                callback(null, data);
            }
            else {
                callback(data);
            }
        });
        
    });
    
    req.on('error', (err) => {
        console.log("Error in the lambda proxy: " + err);
        callback(err);
    });
    
    req.write(JSON.stringify(event.body));
    req.end();

};
1
