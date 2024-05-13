import * as cdk from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3/lib";
import { Construct } from "constructs";

export class RapidcompactMarketplaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const name = "RCMarketplace";

    new cdk.aws_ecs.Cluster(this, name + "Cluster", {});

    const inputBucket = new Bucket(this, "InputBucket", {});
    const outputBucket = new Bucket(this, "OutputBucket", {});

    const executionRole = new cdk.aws_iam.Role(this, "EcsTaskExecutionRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
      ],
    });

    const taskRole = new cdk.aws_iam.Role(this, "EcsTaskRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });
    taskRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["aws-marketplace:RegisterUsage", "aws-marketplace:MeterUsage"],
        resources: ["*"],
      })
    );
    taskRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["s3:*"],
        resources: [
          inputBucket.bucketArn,
          inputBucket.bucketArn + "/*",
          outputBucket.bucketArn,
          outputBucket.bucketArn + "/*",
        ],
      })
    );

    const logGroup = new cdk.aws_logs.LogGroup(this, name + "LogGroup", {
      logGroupName: name + "Logs",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const taskDefinition = new cdk.aws_ecs.FargateTaskDefinition(this, name + "Task", { executionRole, taskRole });
    taskDefinition.addContainer(name + "Container", {
      image: cdk.aws_ecs.ContainerImage.fromRegistry(
        "709825985650.dkr.ecr.us-east-1.amazonaws.com/darmstadt-graphics-group-gmbh/rapidcompact-renewal:0.0.4"
      ),
      logging: cdk.aws_ecs.LogDrivers.awsLogs({
        logGroup: logGroup,
        streamPrefix: "ecs",
      }),
      memoryLimitMiB: 512,
      cpu: 256,
    });
  }
}
