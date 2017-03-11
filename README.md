Lambda proxy to internal services

You have to deploy the lambda, and set an API gateway resource that points to it. Also, you'll need to give access rights to your private service to the lambda.

Your choice is between:

- `proxy.js` which gives you access to one precise endpoint in one service. Limiting to one endpoint reduces the chances that you're opening something you didn't want to by mistake.
- `multiproxy.js` which gives you access to the whole VPC, and requires that you set the host and path in the API Gateway endpoint. This allows one lambda function to act as a proxy to multiple endpoints, so you can create multiple endpoints in Gateway.

# Setup the lambda function

## proxy.js

You need to setup the following environment variables in the lambda:

- `TARGET_HOSTNAME`: Hostname of the proxied service
- `TARGET_PATH`: resource path of the proxied services
- `TARGET_METHOD`: POST, GET, PUT, etc.
- `HEADERS`: a JSON list of headers to forward from the request, e.g.: ["Authorization", "Content-Type"]

## multiproxy.js

No configuration is required in the function.

## Connectivity

In the "Configuration" section of the lambda, select the VPC you want the lambda to proxy, then add the corresponding subnets and security groups. Then save.

# Setup the gateway

## proxy.js

In the resource, add a body mapping template that follows this example for `application/json`, to put the headers into the body:

```json
{
  "body" : $input.json('$'),
  "headers": {
    #foreach($header in $input.params().header.keySet())
    "$header": "$util.escapeJavaScript($input.params().header.get($header))" #if($foreach.hasNext),#end
    #end
  }
}
```

## multiproxy.js

In the resource, add a body mapping template that follows this example for `application/json`, then you need to select the headers you need and configure the target:

```json
{
  "body" : $input.json('$'),
  "target" : {
    "hostname": "something-private.mydomain.com",
    "path": "/path/to/resource",
    "method": "GET|PUT|POST|PATCH|WHATEVER"
  },
  "headers": {
    "Example-Header": $input.params().header.get("Example-Header"),
    "Other-Header": $input.params().header.get("Other-Header")
  }
}
```
