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
	--cluster CLUSTER_NAME \
	--task-definition TASK_DEFINITION_NAME \
	--launch-type FARGATE \
	--network-configuration "awsvpcConfiguration={subnets=[SUBNET],securityGroups=[SECURITYGROUP],assignPublicIp=DISABLED}" \
	--overrides '{"containerOverrides":[{"name":"CONTAINER_NAME", "command":["/bin/sh", "-c", "aws s3 cp s3://INPUT-BUCKET/INPUT_FILENAME . && /rpdx/rpdx -i INPUT_FILENAME -e OUTPUT_FILENAME && aws s3 cp OUTPUT_FILENAME s3://OUTPUT_BUCKET/OUTPUT_FILENAME"]}]}'
```

Note that you have to replace the following strings based on your setup: *CLUSTER_NAME* (of the cluster we created), *TASK_DEFINITION_NAME* (name of the task definition we created in step 5), *CONTAINER_NAME* (the name of the container to run the task on, see step 5), *SUBNET* (the ID of the subnet to run the task in, see step 6), *SECURITYGROUP* (the security group to run the task with, see step 7), *INPUT_BUCKET*, *OUTPUT_BUCKET*, *INPUT_FILENAME* (make sure your input bucket contains your input file with this name), *OUTPUT_FILENAME* (you can choose this freely as it will be created on the output bucket).

## Useful CDK commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
