import { SSTConfig } from "sst";
import { Code, LayerVersion } from "aws-cdk-lib/aws-lambda";
import { StackContext, Api, EventBus, FunctionProps } from "sst/constructs";

export function Default({ stack }: StackContext) {
  const layer = new LayerVersion(stack, "LogsCollectorLambdaLayer", {
    code: Code.fromAsset("lambda"),
    description: "Logs collector layer",
  });

  stack.addOutputs({
    LayerArn: layer.layerVersionArn,
  });
}

export default {
  config(_input) {
    return {
      name: "logs-lambda-layer",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(Default);
  },
} satisfies SSTConfig;
