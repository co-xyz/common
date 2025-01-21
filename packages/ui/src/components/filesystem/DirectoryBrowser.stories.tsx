import { type Meta, type StoryFn } from "@storybook/react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { type Chain } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DirectoryBrowser } from "./DirectoryBrowser.js";
import { Button } from "@ui/lib/shadcn/button.js";
import {
  StorageProvider,
  ArweaveProvider,
  useStorage,
} from "@co-xyz/permaupload";
import { IRYS_ARWEAVE_SUPPORTED_CHAINS } from "@co-xyz/permaupload/constants";

const queryClient = new QueryClient();

const config = createConfig({
  chains: IRYS_ARWEAVE_SUPPORTED_CHAINS as [Chain],
  transports: Object.fromEntries(
    IRYS_ARWEAVE_SUPPORTED_CHAINS.map((chain) => [chain.id, http()])
  ),
});

const Providers = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <StorageProvider>
        <ArweaveProvider>{children}</ArweaveProvider>
      </StorageProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

const Component = () => {
  return <DirectoryBrowser />;
};

const meta: Meta<typeof Component> = {
  title: "FileSystem/DirectoryBrowser",
  component: Component,
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;

const Template: StoryFn<typeof Component> = () => <Component />;

export const Default: StoryFn<typeof Component> = Template.bind({});
Default.args = {};
