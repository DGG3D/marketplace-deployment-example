import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3, aws_ec2 as ec2, aws_ecs as ecs, aws_ecr as ecr, aws_logs as logs, CfnOutput } from "aws-cdk-lib";
import { Peer, Port } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class RapidcompactMarketplaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const containerImage = ecs.ContainerImage.fromRegistry(
      "709825985650.dkr.ecr.us-east-1.amazonaws.com/darmstadt-graphics-group-gmbh/rapidcompact-renewal:0.0.4"
    );

    const name = "RCMarketplace";
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true,
    });

    const inputBucket = new s3.Bucket(this, "InputBucket", {});
    const outputBucket = new s3.Bucket(this, "OutputBucket", {});
    const cluster = new ecs.Cluster(this, name + "Cluster", { vpc });

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
      retention: logs.RetentionDays.ONE_MONTH,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, name + "Task", { executionRole, taskRole });
    const container = new ecs.ContainerDefinition(this, name + "Container", {
      image: containerImage,
      taskDefinition: taskDefinition,
      logging: ecs.LogDrivers.awsLogs({
        logGroup: logGroup,
        streamPrefix: "ecs",
      }),
      memoryLimitMiB: 512,
      cpu: 256,
    });

    // SecurityGroup and Subnet for the ECS task-run command
    const securityGroup = new cdk.aws_ec2.SecurityGroup(this, "TaskRunSG", { vpc, allowAllOutbound: true });
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443), "Allow HTTPS access");
    new CfnOutput(this, "SecurityGroupOutput", {
      value: securityGroup.securityGroupId,
    });
    new CfnOutput(this, "SubnetOutput", {
      value: vpc.publicSubnets[0].subnetId,
    });
    new CfnOutput(this, "InputBucketOutput", {
      value: inputBucket.bucketName,
    });
    new CfnOutput(this, "OutputBucketOutput", {
      value: outputBucket.bucketName,
    });
    new CfnOutput(this, "ClusterOutput", {
      value: cluster.clusterName,
    });
    new CfnOutput(this, "ContainerOutput", {
      value: container.containerName,
    });
    new CfnOutput(this, "TaskDefinitionOutput", {
      value: taskDefinition.family,
    });
  }
}
