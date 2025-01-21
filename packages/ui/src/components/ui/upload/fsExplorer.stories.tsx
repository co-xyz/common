import { type Meta, type StoryFn } from "@storybook/react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { type Chain } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { FsExplorer } from "./FsExplorer.js";
import { IRYS_ARWEAVE_SUPPORTED_CHAINS } from "@co-xyz/permaupload/constants";
import { ArweaveProvider, StorageProvider } from "@co-xyz/permaupload";

const queryClient = new QueryClient();
const config = createConfig({
  chains: IRYS_ARWEAVE_SUPPORTED_CHAINS as [Chain],
  transports: Object.fromEntries(
    IRYS_ARWEAVE_SUPPORTED_CHAINS.map((chain) => [chain.id, http()])
  ),
});

// Create a wrapper component that provides all necessary contexts
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <StorageProvider>
          <ArweaveProvider>{children}</ArweaveProvider>
        </StorageProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const meta: Meta<typeof FsExplorer> = {
  title: "FsPlayground",
  component: FsExplorer,
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

const Template: StoryFn<typeof FsExplorer> = () => <FsExplorer />;

export const Default: StoryFn<typeof FsExplorer> = Template.bind({});
Default.args = {};
