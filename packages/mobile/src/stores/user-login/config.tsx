export const SocialLoginConfigUAT = {
  storageLayerUrl: "https://tkey-metadata.tala.xyz",
  serviceProviders: {
    apple: {
      name: "apple",
      hostUrl: "https://tkey-apple-provider.tala.xyz",
      loginPath: "/login",
    },
    google: {
      name: "google",
      hostUrl: "https://tkey-google-provider.tala.xyz",
      loginPath: "/login",
    },
    tiki: {
      name: "tiki",
      hostUrl: "https://account.tala.xyz",
      loginPath: "/login",
    },
  },
};

export const SocialLoginConfigPROD = {
  storageLayerUrl: "https://tkey-metadata.tiki.vn",
  serviceProviders: {
    apple: {
      name: "apple",
      hostUrl: "https://tkey-apple-provider.tiki.vn",
      loginPath: "/login",
    },
    google: {
      name: "google",
      hostUrl: "https://tkey-google-provider.tiki.vn",
      loginPath: "/login",
    },
    tiki: {
      name: "tiki",
      hostUrl: "https://account.tiki.vn",
      loginPath: "/login",
    },
  },
};