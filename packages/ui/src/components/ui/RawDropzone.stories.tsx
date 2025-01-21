import { RawDropzone } from "./rawDropzone.js";
import { type Meta, type StoryFn } from "@storybook/react";

const meta: Meta<typeof RawDropzone> = {
  title: "RawDropzone",
  component: RawDropzone,
  argTypes: {},
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
  args: {
    onFolderSelect: (files: FileList) => {
      console.log("Selected files:", files);
    },
  },
};

export default meta;

const Template: StoryFn<typeof RawDropzone> = (args: any) => (
  <RawDropzone {...args} />
);

export const Default: StoryFn<typeof RawDropzone> = Template.bind({});
Default.args = {};

export const Disabled: StoryFn<typeof RawDropzone> = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const CustomClassName: StoryFn<typeof RawDropzone> = Template.bind({});
CustomClassName.args = {
  className: "h-96 max-w-xl bg-secondary",
};
