# RapidCompact via Marketplace Subscription

This is an example CDK stack written in TypeScript to deploy RapidCompact licensed via the AWS Marketplace.

**NOTE: Make sure you have an active subscription of RapidCompact on the AWS Marketplace: https://aws.amazon.com/marketplace/pp/prodview-zdg4blxeviyyi**

This stack will create two buckets for your assets:
- input bucket
- output bucket

If you already have either of those and want to use them make sure to adjust bucket configuration in `lib/rapidcompact-marketplace-stack.ts`. Depending on your workload you'll also want to adjust the container specs in the same file.

## Useful CDK commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
