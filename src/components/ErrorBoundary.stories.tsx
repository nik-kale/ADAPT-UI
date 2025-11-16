import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const ErrorComponent = () => {
  throw new Error('This is a test error');
};

const WorkingComponent = () => <div className="text-adapt-text-primary">Component is working fine!</div>;

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const WithoutError: Story = {
  args: {
    children: <WorkingComponent />,
  },
};

export const WithError: Story = {
  args: {
    children: <ErrorComponent />,
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <ErrorComponent />,
    fallback: (
      <div className="bg-red-500 text-white p-4 rounded">
        Custom error fallback UI
      </div>
    ),
  },
};

export const WithErrorCallback: Story = {
  args: {
    children: <ErrorComponent />,
    onError: (error, errorInfo) => {
      console.log('Error caught:', error, errorInfo);
    },
  },
};
