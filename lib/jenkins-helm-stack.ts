import * as cdk from '@aws-cdk/core';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as eks from '@aws-cdk/aws-eks';
import { EksProps } from './eks-cluster'; 

export class JenkinsHelm extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: EksProps) {
        super(scope, id, props);

        let cluster = props.cluster;

        const jenkins_values = yaml.safeLoadAll(fs.readFileSync(`${__dirname}/manifests/jenkins-values.yaml`, 'utf8'));

            new eks.HelmChart(this, 'JenkinsHelm', {
            cluster,
            repository: "https://charts.jenkins.io", 
            chart: "jenkins", 
            release: "jenkins", 
            namespace: "jenkins", 
            values: JSON.parse(JSON.stringify(jenkins_values[0])),
            
        });

    }
}
