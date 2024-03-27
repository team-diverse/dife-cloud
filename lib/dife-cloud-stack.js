const { Stack, RemovalPolicy } = require("aws-cdk-lib");
const {
    Vpc,
    SubnetType,
    Instance,
    InstanceType,
    InstanceClass,
    InstanceSize,
    MachineImage,
    SecurityGroup,
    Peer,
    Port,
} = require("aws-cdk-lib/aws-ec2");
const {
    DatabaseInstance,
    DatabaseInstanceEngine,
    MysqlEngineVersion,
} = require("aws-cdk-lib/aws-rds");
const { Bucket } = require("aws-cdk-lib/aws-s3");
const { Construct } = require("constructs");

class DifeCloudStack extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        const vpc = new Vpc(this, "DifeCloudVPC", {
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: "DifePublicSubnet",
                    subnetType: SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: "DifePrivateSubnet",
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });

        const rdsInstance = new DatabaseInstance(this, "DifeRDS", {
            engine: DatabaseInstanceEngine.mysql({
                version: MysqlEngineVersion.VER_8_0,
            }),
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            vpc,
            vpcSubnets: {
                subnetType: SubnetType.PRIVATE_ISOLATED,
            },
            deletionProtection: true,
        });

        const bastionSG = new SecurityGroup(this, "DifeBastionEC2SG", {
            vpc,
            description: "Security Group for the bastion host",
            allowAllOutbound: true,
        });

        bastionSG.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(22),
            "Allow SSH access from anywhere"
        );

        const bastion = new Instance(this, "DifeBastionEC2", {
            instanceType: new InstanceType("t3.micro"),
            machineImage: MachineImage.latestAmazonLinux2(),
            securityGroup: bastionSG,
            vpc,
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC,
            },
        });

        rdsInstance.connections.allowFrom(
            bastionSG,
            Port.tcp(3306),
            "Allow MySQL access from bastion host"
        );

        const bucket = new Bucket(this, "DifeBucket", {
            removalPolicy: RemovalPolicy.RETAIN,
            bucketName: "dife-bucket",
        });

        });
    }
}

module.exports = { DifeCloudStack };
