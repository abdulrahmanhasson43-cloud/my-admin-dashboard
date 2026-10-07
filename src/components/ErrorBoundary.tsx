import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** When this value changes while an error is showing, the boundary tries again (e.g. the route changed). */
  resetKey?: string;
  /** What to show instead of the crashed part; `reset` clears the error and renders the children again. */
  renderFallback: (reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary — without one, a single render error anywhere unmounts the
 * whole app and leaves a blank white screen (on a cashier's phone, mid-sale).
 * With one, only the crashed part is replaced by a fallback.
 *
 * It has to be a class: React offers no hook for catching render errors.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('A screen crashed while rendering', error, info.componentStack);
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey) this.reset();
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    return this.state.hasError ? this.props.renderFallback(this.reset) : this.props.children;
  }
}
