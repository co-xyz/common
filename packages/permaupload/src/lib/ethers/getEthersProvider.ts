import { type Config, getConnectorClient } from "@wagmi/core";
import { providers } from "ethers";
import type { Client, Chain, Transport, Address } from "viem";

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  return provider;
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export async function getEthersProvider(
  config: Config,
  { account, chainId }: { account?: Address; chainId?: number } = {}
) {
  const client = await getConnectorClient(config, { account, chainId });
  if (!client) return;
  return clientToProvider(client);
}
