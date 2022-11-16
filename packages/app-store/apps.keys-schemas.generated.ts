/**
    This file is autogenerated using the command `yarn app-store:build --watch`.
    Don't modify this file manually.
**/
import { appKeysSchema as routing_forms_keys_schema } from "./ee/routing-forms/zod";
import { appKeysSchema as fathom_keys_schema } from "./fathom/zod";
import { appKeysSchema as ga4_keys_schema } from "./ga4/zod";
import { appKeysSchema as giphy_keys_schema } from "./giphy/zod";
import { appKeysSchema as office365calendar_keys_schema } from "./office365calendar/zod";
import { appKeysSchema as office365video_keys_schema } from "./office365video/zod";
import { appKeysSchema as qr_code_keys_schema } from "./qr_code/zod";
import { appKeysSchema as rainbow_keys_schema } from "./rainbow/zod";
import { appKeysSchema as stripepayment_keys_schema } from "./stripepayment/zod";

export const appKeysSchemas = {
  "routing-forms": routing_forms_keys_schema,
  fathom: fathom_keys_schema,
  ga4: ga4_keys_schema,
  giphy: giphy_keys_schema,
  office365calendar: office365calendar_keys_schema,
  office365video: office365video_keys_schema,
  qr_code: qr_code_keys_schema,
  rainbow: rainbow_keys_schema,
  stripe: stripepayment_keys_schema,
};
