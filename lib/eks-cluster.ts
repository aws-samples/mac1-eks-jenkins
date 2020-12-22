import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

export class EKSCluster extends cdk.Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = new eks.Cluster(this, 'CDKJenkins', {
      version: eks.KubernetesVersion.V1_18,
    });

    cluster.addNodegroupCapacity('eks-node-group-jenkins', {
      instanceType: new ec2.InstanceType('t3.large'),
      minSize: 2,
      diskSize: 100,
      amiType: eks.NodegroupAmiType.AL2_X86_64,
    });

    this.cluster = cluster;
  }
}

export interface EksProps extends cdk.StackProps {
  cluster: eks.Cluster,
  myIAMRole?: iam.IRole
}
