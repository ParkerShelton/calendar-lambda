import sys
import os
import json
import boto3
import uuid
from datetime import datetime
from dateutil import parser

# Add utils directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
utils_dir = os.path.join(current_dir, 'utils')
sys.path.append(utils_dir)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('calendar')

def lambda_handler(event, context):
    try:
        # Validate input
        if not isinstance(event, dict) or 'date' not in event or 'person' not in event:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Please provide both date and person (e/m/b) in the request body'})
            }
        
        # Validate person field
        person = event['person'].lower()
        if person not in ['e', 'm', 'b']:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': "Person must be 'e' (Emmy), 'm' (Millie), or 'b' (both)"})
            }
        
        # Parse and validate the date
        try:
            input_date = parser.parse(event['date']).date().isoformat()
        except ValueError:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid date format. Please provide date in YYYY-MM-DD format'})
            }
        
        # Generate a unique ID for the record
        record_id = str(uuid.uuid4())
        
        # Map person code to full name
        person_map = {
            'e': 'Emmy',
            'm': 'Millie',
            'b': 'Both Girls'
        }
        
        # Save to DynamoDB
        table.put_item(
            Item={
                'id': record_id,
                'date': input_date,
                'person': person,
                'person_name': person_map[person],
                'created_at': datetime.utcnow().isoformat()
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Date saved successfully',
                'id': record_id,
                'date': input_date,
                'person': person_map[person]
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
