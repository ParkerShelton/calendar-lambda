# Calendar Lambda

A simple AWS Lambda function that receives a date and person identifier and stores it in DynamoDB.

## Structure
- `lambda_function.py`: Main Lambda handler that processes the date input and saves to DynamoDB
- `requirements.txt`: Project dependencies

## Setup
1. Create a DynamoDB table named `calendar` with partition key `id` (string)
2. Deploy the Lambda function to AWS
3. Ensure the Lambda has appropriate IAM permissions to access DynamoDB

## Input Format
The Lambda expects a JSON input with a `date` field in ISO format and a `person` field:
```json
{
    "date": "2025-01-28",
    "person": "e"  // 'e' for Emmy, 'm' for Millie, 'b' for both
}
```

## Person Codes
- `e`: Emmy
- `m`: Millie
- `b`: Both Girls

## Response Format
```json
{
    "message": "Date saved successfully",
    "id": "uuid-string",
    "date": "2025-01-28",
    "person": "Emmy"  // Full name will be returned
}
