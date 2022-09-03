import { AnalyticsClient } from "@keplr-wallet/analytics";
import rudderClient, { RUDDER_LOG_LEVEL } from '@rudderstack/rudder-sdk-react-native';

export class StackityAnalyticsStore<
  E extends Record<
    string,
    Readonly<string | number | boolean | undefined | null>
  >,
  U extends Record<
    string,
    Readonly<string | number | boolean | undefined | null>
  >
> {
  constructor(
    readonly analyticsClient: StackityAnalyticsClient,
    protected readonly middleware: {
      logEvent?: (
        eventName: string,
        eventProperties?: E
      ) => {
        eventName: string;
        eventProperties?: E;
      };
    } = {}
  ) { }

  async setup(env: string | undefined) {
    await this.analyticsClient.setup(env);
  }

  setUserId(userId: string | null) {
    this.analyticsClient.setUserId(userId);
  }

  setUserProperties(userProperties: U): void {
    this.analyticsClient.setUserProperties(userProperties);
  }

  logEvent(eventName: string, eventProperties?: E): void {
    if (this.middleware.logEvent) {
      const res = this.middleware.logEvent(eventName, eventProperties);
      eventName = res.eventName;
      eventProperties = res.eventProperties;
    }

    this.analyticsClient.logEvent(eventName, eventProperties);
  }

  logPageView(pageName: string, eventProperties?: E): void {
    console.log(`${pageName} viewed`);
    const screenMapping: Record<string, string> = {
      "NewHome": "astra_hub_view_home_screen",
      "Staking.Dashboard": "astra_hub_view_staking_screen",
      "Web.Intro": "astra_hub_view_dapps_home_screen",
      "History": "astra_hub_view_history_screen",
      "Setting": "astra_hub_view_settings_screen",
      "Receive": "astra_hub_view_qrcode_screen",
    };

    if (screenMapping[pageName]) {
      this.logEvent(screenMapping[pageName], eventProperties);
    }
  }
}

export const initializeAnalyticsStore = () => {
  return new StackityAnalyticsStore(
    new StackityAnalyticsClient()
  );
};

const StackityConfigUAT = {
  dataPlaneUrl: "https://stackity.tala.xyz/api",
  controlPlaneUrl: "https://stackity.tala.xyz/config/v1",
  writeKey: "26AygoRfKYU4pvUnVrRa1UKM4cx",
};


const StackityConfigPROD = {
  dataPlaneUrl: "https://stackity.tiki.vn/api",
  controlPlaneUrl: "https://stackity.tiki.vn/config/v1",
  writeKey: "270Nl390xTlkla7MIoTW0ksDV9t",
};

export class StackityAnalyticsClient implements AnalyticsClient {
  async setup(env: string | undefined = "uat") {
    const { dataPlaneUrl, controlPlaneUrl, writeKey } = env?.toLowerCase() === "uat"
      ? StackityConfigUAT
      : StackityConfigPROD;

    console.log("__TRACKING__ setup with", { dataPlaneUrl, controlPlaneUrl, writeKey });

    const config = {
      dataPlaneUrl,
      controlPlaneUrl,
      trackAppLifecycleEvents: false,
      recordScreenViews: false,
      logLevel: RUDDER_LOG_LEVEL.DEBUG
    };
    await rudderClient.setup(writeKey, config);
  }

  setUserId(userId: string | null) {
    rudderClient.identify(userId || "", {}, {});
  }

  logEvent(eventName: string, eventProperties?: Record<string, Readonly<string | number | boolean | undefined | null>>) {
    console.log("__TRACKING__ track eventName:", eventName, ", eventProperties:", eventProperties);
    rudderClient.track(eventName, eventProperties);
  }

  setUserProperties(properties: Record<string, Readonly<string | number | boolean | undefined | null>>) {
    console.log("__TRACKING__ set userProperties:", properties);
    rudderClient.identify(properties, {});
  }
}