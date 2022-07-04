import React, { FunctionComponent, useContext, useState } from "react";
import { ToastModal } from "./modal";

export type ToastModalContextProps = Omit<
  React.ComponentProps<typeof ToastModal>,
  "isOpen" | "close" | "children"
>;

export interface ToastModal {
  /**
   * toast requests users to choose to continue procedure or cancel it.
   * If users choose to cancel, this will return false.
   * @param props
   */
  makeToast(props: ToastModalContextProps): Promise<boolean>;
}

export const ToastModalContext = React.createContext<ToastModal | null>(null);

export const ToastModalProvider: FunctionComponent = ({ children }) => {
  const [waitingToasts, setWaitingToasts] = useState<
    (ToastModalContextProps & {
      key: string;
      resolver: (result: boolean) => void;
    })[]
  >([]);

  const onDismiss = (
    toast: ToastModalContextProps & {
      key: string;
      resolver: (result: boolean) => void;
    }
  ) => {
    return () => {
      const selectedIndex = waitingToasts.findIndex(
        (waiting) => waiting.key === toast.key
      );
      if (selectedIndex >= 0) {
        const selected = waitingToasts[selectedIndex];
        selected.resolver(true);
        const toasts = waitingToasts.slice();
        toasts.splice(selectedIndex, 1);
        setWaitingToasts(toasts);
      }
    };
  };

  return (
    <ToastModalContext.Provider
      value={{
        makeToast(props: ToastModalContextProps): Promise<boolean> {
          return new Promise<boolean>((resolve) => {
            const key = waitingToasts.length.toString();
            const toasts = waitingToasts.slice();

            toasts.push({
              ...props,
              key,
              resolver: resolve,
            });

            setWaitingToasts(toasts);
          });
        },
      }}
    >
      {children}
      {waitingToasts.map((toast) => {
        return (
          <ToastModal
            key={toast.key}
            isOpen={true}
            close={onDismiss(toast)}
            title={toast.title}
            type={toast.type}
            displayTime={toast.displayTime}
          />
        );
      })}
    </ToastModalContext.Provider>
  );
};

export const useToastModal = () => {
  const context = useContext(ToastModalContext);
  if (!context) {
    throw new Error("You forgot to use ToastModalContext");
  }
  return context;
};

export * from "./modal";
