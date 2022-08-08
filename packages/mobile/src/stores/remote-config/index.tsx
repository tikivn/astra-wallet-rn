// import remoteConfig from '@react-native-firebase/remote-config';

//
// TODO: khanh.vo: Use Firebase Remote Config or Other Remote Config
//
export class RemoteConfigStore {
  constructor() {
    remoteConfig()
      .setDefaults({
        feature_dapps_enabled: true,
        feature_swap_enabled: false,
        feature_socialLogin_enabled: true,
      })
      .then(() => {
        remoteConfig()
          .setConfigSettings({
            minimumFetchIntervalMillis: 30000,
          })
          .then(() => remoteConfig().fetchAndActivate());
      });
  }

  async fetch() {
    await remoteConfig().fetch(300);
    console.log("__DEBUG__ remote config fetching completed!!!");
  }

  async fetchAndActivate() {
    return await remoteConfig().fetchAndActivate();
  }

  getBool(key: string) {
    return remoteConfig().getValue(key) as boolean;
  }

  getString(key: string) {
    return remoteConfig().getValue(key) as string;
  }
}

//
// Mock Remote Config
//
class MockRemoteConfig {
  defaults: Record<string, any> = {};

  async setDefaults(defaults: Record<string, any>) {
    this.defaults = defaults;

    return this.defaults;
  }

  async setConfigSettings(settings: { minimumFetchIntervalMillis: number }) {
    return this;
  }

  async fetch(duration: number) {
    return false;
  }

  async fetchAndActivate() {
    return false;
  }

  getValue(key: string) {
    return this.defaults[key];
  }
}

const mockRemoteConfig = new MockRemoteConfig();

const remoteConfig = () => {
  return mockRemoteConfig;
};
