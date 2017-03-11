var https = require('https');

exports.handler = (event, context, callback) => {
    var config = event.target;
    
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
