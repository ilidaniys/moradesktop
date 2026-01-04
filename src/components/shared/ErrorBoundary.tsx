"use client";

import { AlertTriangle } from "lucide-react";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-destructive/20 bg-destructive/10 flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border p-8">
          <AlertTriangle className="text-destructive h-12 w-12" />
          <h2 className="text-destructive text-xl font-medium">
            Something went wrong
          </h2>
          <p className="text-destructive/90 max-w-md text-center text-sm">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mt-4 rounded-md px-4 py-2 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
