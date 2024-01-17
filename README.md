# Lambda Logs Extension

This Extension intercepts the Lambda logs and sends them to a JSON endpoint.

## Configuration

- Add the Lambda Layer by ARN to your Lambda function
- Set the environment variable `JSON_LOGS_ENDPOINT` to the endpoint where you want to send the logs to
- Set the environment Variable `JSON_LOGS_HEADERS` to a JSON string containing the headers you want to send to the endpoint (or keep empty). You can use this for authentication.
- Set the following environment variables to the value you want:
  - SERVICE_NAME (Falls back to AWS_LAMBDA_FUNCTION_NAME)
  - SERVICE_NAMESPACE
  - SERVICE_VERSION
  - DEPLOYMENT_ENVIRONMENT
