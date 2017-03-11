Lambda proxy to internal services

You have to deploy the lambda, and set an API gateway resource that points to it. Also, you'll need to give access rights to your private service to the lambda.

# Setup the lambda

You need to setup the following environment variables in the lambda:

- `TARGET_HOSTNAME`: Hostname of the proxied service
- `TARGET_PATH`: resource path of the proxied services
- `TARGET_METHOD`: POST, GET, PUT, etc.
- `HEADERS`: a JSON list of headers to forward from the request, e.g.: ["Authorization", "Content-Type"]

In the "Configuration" section of the lambda, select the VPC you want the lambda to proxy, then add the corresponding subnets and security groups. Then save.

# Setup the gateway

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
