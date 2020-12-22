import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import { Role } from '@aws-cdk/aws-iam';

export class S3Stack extends cdk.Stack {
    public readonly myBucket: s3.Bucket;
    public readonly myRole: iam.IRole;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    
        const bucket = new s3.Bucket(this, 'BuildArtifacts', {
            versioned: false, 
            publicReadAccess: false
        });

        const role = new iam.Role(this, 'S3JenkinsRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            description: 'This role allows Jenkins Workers to publish artifacts to S3',
        });

        role.addToPolicy(new iam.PolicyStatement({
            resources: [bucket.bucketArn],
            actions: ['s3:*'],
        }));

        this.myRole = role;

    }
}

export interface S3Props extends cdk.StackProps {
    myS3Bucket: s3.IBucket;
}

export interface IAMProps extends cdk.StackProps {
    myIAMRole: iam.IRole;
}