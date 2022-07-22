import { checkPremiumUsername } from "@calcom/ee/modules/common/lib/checkPremiumUsername";
import { IS_SELF_HOSTED } from "@calcom/lib/constants";

import { checkRegularUsername } from "./checkRegularUsername";

export const checkUsername = IS_SELF_HOSTED ? checkRegularUsername : checkPremiumUsername;
