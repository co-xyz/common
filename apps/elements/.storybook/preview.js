import "ui/style";

/** @type { import('@storybook/react').Preview } */
const preview = {
  tags: ["autodocs"],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
