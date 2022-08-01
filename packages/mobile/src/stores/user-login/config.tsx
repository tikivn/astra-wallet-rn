export const SocialLoginConfigUAT = {
  storageLayerUrl: "https://tkey-metadata.tala.xyz",
  serviceProviders: {
    apple: {
      name: "apple",
      hostUrl: "https://tkey-provider.tala.xyz",
      loginPath: "/apple/login",
    },
    google: {
      name: "google",
      hostUrl: "https://tkey-provider.tala.xyz",
      loginPath: "/google/login",
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
      hostUrl: "https://tkey-provider.tiki.vn",
      loginPath: "/apple/login",
    },
    google: {
      name: "google",
      hostUrl: "https://tkey-provider.tiki.vn",
      loginPath: "/google/login",
    },
    tiki: {
      name: "tiki",
      hostUrl: "https://account.tiki.vn",
      loginPath: "/login",
    },
  },
};