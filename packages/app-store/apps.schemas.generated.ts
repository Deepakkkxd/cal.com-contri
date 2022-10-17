/**
    This file is autogenerated using the command `yarn app-store:build --watch`.
    Don't modify this file manually.
**/
import { appDataSchema as routing_forms_schema } from "./ee/routing-forms/zod";
import { appDataSchema as fathom_schema } from "./fathom/zod";
import { appDataSchema as giphy_schema } from "./giphy/zod";
import { appDataSchema as qr_code_schema } from "./qr_code/zod";
import { appDataSchema as rainbow_schema } from "./rainbow/zod";
import { appDataSchema as stripepayment_schema } from "./stripepayment/zod";

export const appDataSchemas = {
  "routing-forms": routing_forms_schema,
  fathom: fathom_schema,
  giphy: giphy_schema,
  qr_code: qr_code_schema,
  rainbow: rainbow_schema,
  stripe: stripepayment_schema,
};
