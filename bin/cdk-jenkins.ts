#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EKSCluster } from '../lib/eks-cluster';
import { S3Stack } from '../lib/s3-stack';
import { EC2Stack } from '../lib/ec2-stack';
import { JenkinsHelm } from '../lib/jenkins-helm-stack';

const app = new cdk.App();

const primaryCluster = new EKSCluster(app, 'EKSCluster', {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
    }
});

const s3bucket = new S3Stack(app, 'JenkinsBucket', {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
    }
});

new EC2Stack(app, 'JenkinsWorker', {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
    },
    cluster: primaryCluster.cluster,
    myIAMRole: s3bucket.myRole,
}); 

new JenkinsHelm(app, 'JenkinsHelm', {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
    },
    cluster: primaryCluster.cluster,
}); 
