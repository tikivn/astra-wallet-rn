export type Allowances = {
  allowances: Allowance[];
  // pagination: {}
};

export type Allowance = {
  granter: string;
  grantee: string;
  allowance: {
    type_url: string;
    value: string;
  };
};
