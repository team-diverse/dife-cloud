const { Stack } = require('aws-cdk-lib');
const { Vpc, SubnetType } = require('aws-cdk-lib/aws-ec2');
const { Construct } = require('constructs');


class DifeCloudStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'DifeCloudVPC', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        }
      ]
    });
  }
}

module.exports = { DifeCloudStack }
