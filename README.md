# okta-aws-sync

okta-aws-sync helps sync roles from AWS IAM to Groups in Okta in near real-time using CloudWatch Rules Trigger on IAM events. This can be used to further automate the AWS Dynamic Role mapping functionality

(More to come -
Delete Role, Update Role, Group Rules)

## Requirements

* AWS CLI already configured with Administrator permission
* [NodeJS 8.10+ installed](https://nodejs.org/en/download/)
* install SAM CLI - https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html 

## Setup process

clone this repo and run the following commands

```bash
cd sync-role
npm install
```

### Building the project

This project uses AWS Serverless Application Model (AWS SAM) for https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html

```bash
cd ..
sam build
```

By default, this command writes built artifacts to `.aws-sam/build` folder.


## Packaging and deployment

AWS Lambda NodeJS runtime requires a flat folder with all dependencies including the application. SAM will use `CodeUri` property to know where to look up for both application and dependencies:

```yaml
...
    FirstFunction:
        Type: AWS::Serverless::Function
        Properties:
            CodeUri: sync-roles/
            ...
```

Firstly, we need a `S3 bucket` where we can upload our Lambda functions packaged as ZIP before we deploy anything - If you don't have a S3 bucket to store code artifacts then this is a good time to create one:

```bash
aws s3 mb s3://BUCKET_NAME
```

Next, run the following command to package our Lambda function to S3:

```bash
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket REPLACE_THIS_WITH_YOUR_S3_BUCKET_NAME
    --region us-east-1
```

Next, the following command will create a Cloudformation Stack and deploy your SAM resources.

```bash
sam deploy \
    --template-file packaged.yaml \
    --stack-name okta-aws-sync \
    --capabilities CAPABILITY_IAM
    --region us-east-1 
    --profile yourlocalawsProfileName
```

> **See [Serverless Application Model (SAM) HOWTO Guide](https://github.com/awslabs/serverless-application-model/blob/master/HOWTO.md) for more details in how to get started.**

## After deployment is complete:

Set up your api key [apiKey] and orgurl [orgURL] in the lambda env variable. Recommend encryption with KMS for key. 

## Cloud Watch Event Rule: 
Create a Cloud watch event Rule with the following Event pattern: This pattern with source: aws.iam only works in us-east region 


{
  "source": [
    "aws.iam"
  ],
  "detail-type": [
    "AWS API Call via CloudTrail"
  ],
  "detail": {
    "eventSource": [
      "iam.amazonaws.com"
    ],
    "eventName": [
      "CreateRole"
    ]
  }
}

For your Cloud watch event rule target - select the lambda function we just deployed

**NOTE**: This will be added to the SAM Application configuration in the future so you don't have to manually set it up.
For additional IAM events like update and delete, we will add them to the eventRule in the future

## Testing

create a role in AWS and it should show up as a groupin Okta


Create IAM role in AWS East region. The Cloudwatch event rule will trigger the ;ambda function and the role will show up as a group in Okta. 