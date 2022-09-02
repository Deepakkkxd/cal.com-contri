import dynamic from "next/dynamic";

import { DynamicComponent } from "../../_components/DynamicComponent";

export const AppSetupMap = {
  "apple-calendar": dynamic(() => import("../../applecalendar/pages/setup")),
  "exchange2013-calendar": dynamic(() => import("../../exchange2013calendar/pages/setup")),
  "exchange2016-calendar": dynamic(() => import("../../exchange2016calendar/pages/setup")),
  "caldav-calendar": dynamic(() => import("../../caldavcalendar/pages/setup")),
  zapier: dynamic(() => import("../../zapier/pages/setup")),
  closecom: dynamic(() => import("../../closecomothercalendar/pages/setup")),
  "apple-calendar-V2": dynamic(() => import("../../applecalendar/pages/v2/setup")),
  "exchange2013-calendar-V2": dynamic(() => import("../../exchange2013calendar/pages/v2/setup")),
  "exchange2016-calendar-V2": dynamic(() => import("../../exchange2016calendar/pages/v2/setup")),
  "caldav-calendar-V2": dynamic(() => import("../../caldavcalendar/pages/v2/setup")),
  "zapier-V2": dynamic(() => import("../../zapier/pages/v2/setup")),
  "closecom-V2": dynamic(() => import("../../closecomothercalendar/pages/v2/setup")),
};

export const AppSetupPage = (props: { slug: string }) => {
  return <DynamicComponent<typeof AppSetupMap> componentMap={AppSetupMap} {...props} />;
};

export default AppSetupPage;
