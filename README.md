# RapidCompact via Marketplace Subscription

This is an example CDK stack written in TypeScript to deploy RapidCompact licensed via the AWS Marketplace.

**NOTE: Make sure you have an active subscription of RapidCompact on the AWS Marketplace: https://aws.amazon.com/marketplace/pp/prodview-zdg4blxeviyyi**

This stack will create two buckets for your assets:
- input bucket
- output bucket

If you already have either of those and want to use them make sure to adjust bucket configuration in `lib/rapidcompact-marketplace-stack.ts`. Depending on your workload you'll also want to adjust the container specs in the same file.

## Launching an RapidCompact Task
After you have successfully deployed this stack you can launch your tasks to optimize your assets in the following way.
```bash
aws ecs run-task \
        --cluster CLUSTER-NAME \
        --task-definition TASK-DEFINITION-NAME \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[SUBNET],securityGroups=[SECURITYGROUP],assignPublicIp=ENABLED}" \
        --overrides '{"containerOverrides":[{"command":["/bin/sh", "-c", "aws s3 cp INPUT-S3PATH . && /rpdx/rpdx -i INPUT-FILENAME -e OUTPUT-FILENAME && aws s3 cp OUTPUT-FILENAME s3://OUTPUT-BUCKET/OUTPUT-FILENAME"]}]}'
```

*Note that you have to replace the following strings based on your setup: `CLUSTER-NAME` (of the cluster we created), `TASK-DEFINITION-NAME` (name of the task definition we created), `SUBNET` (the subnet you want this task to run in), `SECURITYGROUP` (the security group you want this task to run with), `INPUT-BUCKET`, `OUTPUT-BUCKET`, `INPUT-FILENAME`, `OUTPUT-FILENAME`.*

## Useful CDK commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
