# AWS Lambda Consumer Code to consume messages from AWS SQS

Run below 'sls' commands from root folder to package, deploy and remove serverless lambda application for AWS

# To package serverless application using webpack.
>sls package

# To deploy sls application into AWS.
>sls deploy

# To remove sls application from AWS.
>sls remove

# To deploy only the function (instead of entire application) for any code modification
>sls deploy function -f functionName (check serverless.yml file for function-name)