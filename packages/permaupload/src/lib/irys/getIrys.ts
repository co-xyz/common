import { WebIrys } from "@irys/sdk";
import { type Address, type Client } from "viem";
import { type Config } from "wagmi";
import { signTypedData } from "@wagmi/core";

export const getWebIrys = async ({
  address,
  config,
}: {
  address?: Address;
  config: Config;
}): Promise<WebIrys | undefined> => {
  const network = "mainnet";
  const token = "ethereum";
  // Optional RPC URLs
  const rpcUrl = "";

  const client = config.getClient() as Client;

  try {
    // @ts-expect-error injected
    client._signTypedData = async (domain, types, message) => {
      message["Transaction hash"] =
        "0x" + Buffer.from(message["Transaction hash"]).toString("hex");
      const result = await signTypedData(config, {
        domain,
        message,
        types,
        primaryType: "Bundlr",
      });

      return result;
    };

    // @ts-expect-error injected
    client.getAddress = async () => address;
    // @ts-expect-error injected
    client.getSigner = () => client;

    // Create a wallet object
    const wallet = { rpcUrl: rpcUrl, name: "viem", provider: client };
    // Use the wallet object

    const webIrys = new WebIrys({ network, token, wallet });
    await webIrys.ready();
    return webIrys;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
