export type Grants = {
  grants: Grant[];
  // pagination: {}
};

export type Grant = {
  authorization: {
    type_url: string;
    value: string;
  };
  expiration: string;
};
