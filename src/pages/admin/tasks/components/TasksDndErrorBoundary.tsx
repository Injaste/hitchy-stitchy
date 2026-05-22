import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

// Catches @dnd-kit "cannot find tree" errors thrown when the sortable context
// unmounts mid-drag (filter change, query refetch, etc.). Renders fallback
// (columns without DnD) momentarily, then auto-resets so the next drag works.
class TasksDndErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(error: Error): State | null {
    if (error.message?.toLowerCase().includes("tree")) {
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (!error.message?.toLowerCase().includes("tree")) {
      throw error;
    }
    this.resetTimer = setTimeout(() => this.setState({ hasError: false }), 50);
  }

  componentWillUnmount() {
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default TasksDndErrorBoundary;
