export const SocialLoginConfigUAT = {
  storageLayerUrl: "https://tkey-metadata.tala.xyz",
  serviceProviders: {
    google: {
      name: "google",
      hostUrl: "https://tkey-google-provider.tala.xyz",
      loginPath: "/login",
    },
    tiki: {
      name: "tiki",
      hostUrl: "https://tkey-google-provider.tala.xyz",
      loginPath: "/login",
    },
  },
};

export const SocialLoginConfigPROD = {
  storageLayerUrl: "https://tkey-metadata.tiki.vn",
  serviceProviders: {
    google: {
      name: "google",
      hostUrl: "https://tkey-google-provider.tiki.vn",
      loginPath: "/login",
    },
    tiki: {
      name: "tiki",
      hostUrl: "https://tkey-google-provider.tiki.vn",
      loginPath: "/login",
    },
  },
};