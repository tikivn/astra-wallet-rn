import React, { FunctionComponent, useContext, useState } from "react";
import { AlertModal } from "./modal";

export type AlertModalContextProps = Omit<
  React.ComponentProps<typeof AlertModal>,
  "isOpen" | "close" | "children" | "onConfirm"
>;

export interface AlertModal {
  /**
   * alert requests users to choose to continue procedure or cancel it.
   * If users choose to cancel, this will return false.
   * @param props
   */
  alert(props: AlertModalContextProps): Promise<boolean>;
}

export const AlertModalContext = React.createContext<AlertModal | null>(null);

export const AlertModalProvider: FunctionComponent = ({ children }) => {
  const [waitingAlerts, setWaitingAlerts] = useState<
    (AlertModalContextProps & {
      key: string;
      resolver: (result: boolean) => void;
    })[]
  >([]);

  const onConfirm = (
    alert: AlertModalContextProps & {
      key: string;
      resolver: (result: boolean) => void;
    },
    yes: boolean
  ) => {
    return () => {
      const selectedIndex = waitingAlerts.findIndex(
        (waiting) => waiting.key === alert.key
      );
      if (selectedIndex >= 0) {
        const selected = waitingAlerts[selectedIndex];
        selected.resolver(yes);
        const Alerts = waitingAlerts.slice();
        Alerts.splice(selectedIndex, 1);
        setWaitingAlerts(Alerts);
      }
    };
  };

  return (
    <AlertModalContext.Provider
      value={{
        alert(props: AlertModalContextProps): Promise<boolean> {
          return new Promise<boolean>((resolve) => {
            const key = waitingAlerts.length.toString();
            const Alerts = waitingAlerts.slice();

            Alerts.push({
              ...props,
              key,
              resolver: resolve,
            });

            setWaitingAlerts(Alerts);
          });
        },
      }}
    >
      {children}
      {waitingAlerts.map((alert) => {
        return (
          <AlertModal
            key={alert.key}
            isOpen={true}
            close={onConfirm(alert, false)}
            onConfirm={onConfirm(alert, true)}
            title={alert.title}
            paragraph={alert.paragraph}
            confirmButtonText={alert.confirmButtonText}
            type={alert.type}
          />
        );
      })}
    </AlertModalContext.Provider>
  );
};

export const useAlertModal = () => {
  const context = useContext(AlertModalContext);
  if (!context) {
    throw new Error("You forgot to use AlertModalContext");
  }
  return context;
};

export * from "./modal";
