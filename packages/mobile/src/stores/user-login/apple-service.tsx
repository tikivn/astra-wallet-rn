import * as AppleAuthentication from "expo-apple-authentication";

export const loginWithApple = async (url: string) => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("Token is not provided");
    }

    const identityTokenSplit = credential.identityToken.split(".");
    if (identityTokenSplit.length !== 3) {
      throw new Error("Invalid token");
    }

    const payload = JSON.parse(
      Buffer.from(identityTokenSplit[1], "base64").toString()
    );

    const email = payload.email as string | undefined;
    if (!email) {
      throw new Error("Email is not provided");
    }
    // const sub = payload.sub as string | undefined;
    // if (!sub) {
    //   throw new Error("Subject is not provided");
    // }

    const response = await fetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email
        }),
      }
    );

    if (response.ok) {
      const socialLoginData = await response.json();
      const { email, shareB } = socialLoginData;
      if (email && shareB) {
        return {
          type: "success",
          socialLoginData
        };
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  }

  return {
    type: "fail"
  };
};
