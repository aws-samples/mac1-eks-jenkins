import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as autoscaling from '@aws-cdk/aws-autoscaling';

import { EksProps } from './cdk-cosmic-stack'; 
import { IAMProps} from './s3-stack';
import { SubnetType } from '@aws-cdk/aws-ec2';

export class EC2Stack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: EksProps) {
        super(scope, id, props);

        const mySecurityGroup = new ec2.SecurityGroup(this, 'CDKJenkinsSecurityGroup', {
            vpc: props.cluster.vpc,
            description: 'Allow ssh access to Jenkins instances from anywhere',
            allowAllOutbound: true 
        });
        mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow public ssh access')

        const instance = new ec2.Instance(this, 'CDKJenkinsWorker', {
            instanceType: new ec2.InstanceType("mac1.metal"),
            machineImage: ec2.MachineImage.genericLinux({
                         'us-west-2': 'ami-0241089f401e28a27',
                         'us-east-1': 'ami-0e813c305f63cecbd',
                         'us-east-2': 'ami-00692c69a6f9c6ea1',
                         'eu-west-1': 'ami-0174e969a3db591be',
                         'ap-southeast-1': 'ami-03d18538f88718c75'
                     }),
            // instanceType: new ec2.InstanceType("t3.small"),
            // machineImage: new ec2.AmazonLinuxImage(),
            securityGroup: mySecurityGroup,
            role: props.myIAMRole,
            vpc: props.cluster.vpc,
            vpcSubnets: {
                        subnetType: ec2.SubnetType.PUBLIC,
                    },
            keyName: "jenkins-worker",
        });

        //Install JDK
        instance.addUserData("su - ec2-user -c '/usr/local/bin/brew install --cask corretto'");

        const cfnInstance = instance.node.defaultChild as ec2.CfnInstance;
        cfnInstance.addPropertyOverride('Tenancy', 'host');

        new cdk.CfnOutput(this, 'MacOS Worker IP', { value: instance.instancePublicIp });

        // let testASG = new autoscaling.AutoScalingGroup(this, "ASG", {
        //     vpc: props.cluster.vpc,
        //     // instanceType: ec2.InstanceType.of(
        //     //   ec2.InstanceClass.T3,
        //     //   ec2.InstanceSize.SMALL
        //     // ),
        //     instanceType: new ec2.InstanceType("mac1.metal"),
        //     role: props.myIAMRole,
        //     securityGroup: mySecurityGroup,
        //     associatePublicIpAddress: true,
        //     keyName: "proberts",
        //     // machineImage: new ec2.AmazonLinuxImage(),
        //     machineImage: ec2.MachineImage.genericLinux({
        //         'us-west-2': 'ami-08e53f24366a4840c',
        //     }),
        //     vpcSubnets: {
        //         subnetType: ec2.SubnetType.PUBLIC,
        //     },
        //     updatePolicy: autoscaling.UpdatePolicy.replacingUpdate(),
        //     minCapacity: 1,
        //     maxCapacity: 2,
        //     groupMetrics: [autoscaling.GroupMetrics.all()],
        //     healthCheck: autoscaling.HealthCheck.elb({
        //       grace: cdk.Duration.seconds(30),
        //     }),
        // });
        
    }
}
