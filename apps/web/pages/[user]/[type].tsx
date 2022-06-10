import { useLocale } from "@calcom/lib/hooks/useLocale";

import { inferSSRProps } from "@lib/types/inferSSRProps";

import AvailabilityPage from "@components/booking/pages/AvailabilityPage";

export type AvailabilityPageProps = inferSSRProps<typeof getStaticProps>;

export default function Type(props: AvailabilityPageProps) {
  console.log("Rerender");

  const data = {
    ...props,
    isDynamicGroup: false,
    date: null,
    eventType: {
      id: 3,
      title: "30min",
      availability: [],
      description: "",
      length: 30,
      price: 0,
      currency: "usd",
      periodType: "UNLIMITED",
      periodStartDate: "Thu May 26 2022 15:23:21 GMT+0100 (British Summer Time)",
      periodEndDate: "Thu May 26 2022 15:23:21 GMT+0100 (British Summer Time)",
      periodDays: 30,
      periodCountCalendarDays: false,
      locations: [],
      schedulingType: null,
      recurringEvent: {},
      schedule: null,
      hidden: false,
      slug: "30min",
      minimumBookingNotice: 120,
      beforeEventBuffer: 0,
      afterEventBuffer: 0,
      timeZone: null,
      metadata: {},
      slotInterval: null,
      seatsPerTimeSlot: null,
      users: [{ ...props.profile }],
    },
    workingHours: [
      {
        days: [1, 2, 3, 4, 5],
        startTime: 480,
        endTime: 960,
      },
    ],
    trpcState: {
      json: {
        mutations: [],
        queries: [
          {
            state: {
              data: {
                i18n: {
                  _nextI18Next: {
                    initialI18nStore: {
                      en: {
                        common: {
                          trial_days_left: 'You have $t(day, {"count": {{days}} }) left on your PRO trial',
                          day: "{{count}} day",
                          day_plural: "{{count}} days",
                          second: "{{count}} second",
                          second_plural: "{{count}} seconds",
                          upgrade_now: "Upgrade now",
                          accept_invitation: "Accept Invitation",
                          calcom_explained:
                            "Cal.com is the open source Calendly alternative putting you in control of your own data, workflow and appearance.",
                          have_any_questions: "Have questions? We're here to help.",
                          reset_password_subject: "Cal.com: Reset password instructions",
                          event_declined_subject: "Declined: {{eventType}} with {{name}} at {{date}}",
                          event_cancelled_subject: "Cancelled: {{eventType}} with {{name}} at {{date}}",
                          event_request_declined: "Your event request has been declined",
                          event_request_declined_recurring: "Your recurring event request has been declined",
                          event_request_cancelled: "Your scheduled event was cancelled",
                          organizer: "Organizer",
                          need_to_reschedule_or_cancel: "Need to reschedule or cancel?",
                          cancellation_reason: "Reason for cancellation",
                          cancellation_reason_placeholder: "Why are you cancelling? (optional)",
                          rejection_reason: "Reason for rejecting",
                          rejection_reason_title: "Reject the booking request?",
                          rejection_reason_description:
                            "Are you sure you want to reject the booking? We'll let the person who tried to book know. You can provide a reason below.",
                          rejection_confirmation: "Reject the booking",
                          manage_this_event: "Manage this event",
                          your_event_has_been_scheduled: "Your event has been scheduled",
                          your_event_has_been_scheduled_recurring: "Your recurring event has been scheduled",
                          accept_our_license:
                            "Accept our license by changing the .env variable <1>NEXT_PUBLIC_LICENSE_CONSENT</1> to '{{agree}}'.",
                          remove_banner_instructions:
                            "To remove this banner, please open your .env file and change the <1>NEXT_PUBLIC_LICENSE_CONSENT</1> variable to '{{agree}}'.",
                          error_message: "The error message was: '{{errorMessage}}'",
                          refund_failed_subject: "Refund failed: {{name}} - {{date}} - {{eventType}}",
                          refund_failed:
                            "The refund for the event {{eventType}} with {{userName}} on {{date}} failed.",
                          check_with_provider_and_user:
                            "Please check with your payment provider and {{user}} how to handle this.",
                          a_refund_failed: "A refund failed",
                          awaiting_payment_subject:
                            "Awaiting Payment: {{eventType}} with {{name}} on {{date}}",
                          meeting_awaiting_payment: "Your meeting is awaiting payment",
                          help: "Help",
                          price: "Price",
                          paid: "Paid",
                          refunded: "Refunded",
                          pay_later_instructions:
                            "You have also received an email with this link, if you want to pay later.",
                          payment: "Payment",
                          missing_card_fields: "Missing card fields",
                          pay_now: "Pay now",
                          codebase_has_to_stay_opensource:
                            "The codebase has to stay open source, whether it was modified or not",
                          cannot_repackage_codebase: "You can not repackage or sell the codebase",
                          acquire_license: "Acquire a commercial license to remove these terms by emailing",
                          terms_summary: "Summary of terms",
                          open_env: "Open .env and agree to our License",
                          env_changed: "I've changed my .env",
                          accept_license: "Accept License",
                          still_waiting_for_approval: "An event is still waiting for approval",
                          event_is_still_waiting:
                            "Event request is still waiting: {{attendeeName}} - {{date}} - {{eventType}}",
                          no_more_results: "No more results",
                          load_more_results: "Load more results",
                          integration_meeting_id: "{{integrationName}} meeting ID: {{meetingId}}",
                          confirmed_event_type_subject: "Confirmed: {{eventType}} with {{name}} at {{date}}",
                          new_event_request: "New event request: {{attendeeName}} - {{date}} - {{eventType}}",
                          confirm_or_reject_request: "Confirm or reject the request",
                          check_bookings_page_to_confirm_or_reject:
                            "Check your bookings page to confirm or reject the booking.",
                          event_awaiting_approval: "An event is waiting for your approval",
                          event_awaiting_approval_recurring: "A recurring event is waiting for your approval",
                          someone_requested_an_event:
                            "Someone has requested to schedule an event on your calendar.",
                          someone_requested_password_reset:
                            "Someone has requested a link to change your password.",
                          password_reset_instructions:
                            "If you didn't request this, you can safely ignore this email and your password will not be changed.",
                          event_awaiting_approval_subject:
                            "Awaiting Approval: {{eventType}} with {{name}} at {{date}}",
                          event_still_awaiting_approval: "An event is still waiting for your approval",
                          booking_submitted_subject:
                            "Booking Submitted: {{eventType}} with {{name}} at {{date}}",
                          your_meeting_has_been_booked: "Your meeting has been booked",
                          event_type_has_been_rescheduled_on_time_date:
                            "Your {{eventType}} with {{name}} has been rescheduled to {{time}} ({{timeZone}}) on {{date}}.",
                          event_has_been_rescheduled: "Updated - Your event has been rescheduled",
                          request_reschedule_title_attendee: "Request to reschedule your booking",
                          request_reschedule_subtitle:
                            "{{organizer}} has cancelled the booking and requested you to pick another time.",
                          request_reschedule_title_organizer: "You have requested {{attendee}} to reschedule",
                          request_reschedule_subtitle_organizer:
                            "You have cancelled the booking and {{attendee}} should pick a new booking time with you.",
                          reschedule_reason: "Reason for reschedule",
                          hi_user_name: "Hi {{name}}",
                          ics_event_title: "{{eventType}} with {{name}}",
                          new_event_subject: "New event: {{attendeeName}} - {{date}} - {{eventType}}",
                          join_by_entrypoint: "Join by {{entryPoint}}",
                          notes: "Notes",
                          manage_my_bookings: "Manage my bookings",
                          need_to_make_a_change: "Need to make a change?",
                          new_event_scheduled: "A new event has been scheduled.",
                          new_event_scheduled_recurring: "A new recurring event has been scheduled.",
                          invitee_email: "Invitee Email",
                          invitee_timezone: "Invitee Time Zone",
                          event_type: "Event Type",
                          enter_meeting: "Enter Meeting",
                          video_call_provider: "Video call provider",
                          meeting_id: "Meeting ID",
                          meeting_password: "Meeting Password",
                          meeting_url: "Meeting URL",
                          meeting_request_rejected: "Your meeting request has been rejected",
                          rescheduled_event_type_subject:
                            "Rescheduled: {{eventType}} with {{name}} at {{date}}",
                          requested_to_reschedule_subject_attendee:
                            "Action Required Reschedule: Please book a new time for {{eventType}} with {{name}}",
                          rejected_event_type_with_organizer:
                            "Rejected: {{eventType}} with {{organizer}} on {{date}}",
                          hi: "Hi",
                          join_team: "Join team",
                          manage_this_team: "Manage this team",
                          team_info: "Team Info",
                          request_another_invitation_email:
                            "If you prefer not to use {{toEmail}} as your Cal.com email or already have a Cal.com account, please request another invitation to that email.",
                          you_have_been_invited: "You have been invited to join the team {{teamName}}",
                          user_invited_you: "{{user}} invited you to join the team {{team}} on Cal.com",
                          hidden_team_member_title: "You are hidden in this team",
                          hidden_team_member_message:
                            "Your seat is not paid for, either upgrade to Pro or let the team owner know they can pay for your seat.",
                          hidden_team_owner_message:
                            "You need a pro account to use teams, you are hidden until you upgrade.",
                          link_expires: "p.s. It expires in {{expiresIn}} hours.",
                          upgrade_to_per_seat: "Upgrade to Per-Seat",
                          team_upgrade_seats_details:
                            "Of the {{memberCount}} members in your team, {{unpaidCount}} seat(s) are unpaid. At ${{seatPrice}}/month per seat the estimated total cost of your membership is ${{totalCost}}/month.",
                          team_upgraded_successfully: "Your team was upgraded successfully!",
                          use_link_to_reset_password: "Use the link below to reset your password",
                          hey_there: "Hey there,",
                          forgot_your_password_calcom: "Forgot your password? - Cal.com",
                          event_type_title: "{{eventTypeTitle}} | Event Type",
                          delete_webhook_confirmation_message:
                            "Are you sure you want to delete this webhook? You will no longer receive Cal.com meeting data at a specified URL, in real-time, when an event is scheduled or canceled.",
                          confirm_delete_webhook: "Yes, delete webhook",
                          edit_webhook: "Edit Webhook",
                          delete_webhook: "Delete Webhook",
                          webhook_status: "Webhook Status",
                          webhook_enabled: "Webhook Enabled",
                          webhook_disabled: "Webhook Disabled",
                          webhook_response: "Webhook response",
                          webhook_test: "Webhook test",
                          manage_your_webhook: "Manage your webhook",
                          webhook_created_successfully: "Webhook created successfully!",
                          webhook_updated_successfully: "Webhook updated successfully!",
                          webhook_removed_successfully: "Webhook removed successfully!",
                          payload_template: "Payload Template",
                          dismiss: "Dismiss",
                          no_data_yet: "No data yet",
                          ping_test: "Ping test",
                          add_to_homescreen:
                            "Add this app to your home screen for faster access and improved experience.",
                          upcoming: "Upcoming",
                          recurring: "Recurring",
                          past: "Past",
                          choose_a_file: "Choose a file...",
                          upload_image: "Upload image",
                          upload_target: "Upload {{target}}",
                          no_target: "No {{target}}",
                          slide_zoom_drag_instructions: "Slide to zoom, drag to reposition",
                          view_notifications: "View notifications",
                          view_public_page: "View public page",
                          sign_out: "Sign out",
                          add_another: "Add another",
                          until: "until",
                          powered_by: "powered by",
                          unavailable: "Unavailable",
                          set_work_schedule: "Set your work schedule",
                          change_bookings_availability: "Change when you are available for bookings",
                          select: "Select...",
                          "2fa_confirm_current_password": "Confirm your current password to get started.",
                          "2fa_scan_image_or_use_code":
                            "Scan the image below with the authenticator app on your phone or manually enter the text code instead.",
                          text: "Text",
                          multiline_text: "Multiline Text",
                          number: "Number",
                          checkbox: "Checkbox",
                          is_required: "Is required",
                          required: "Required",
                          input_type: "Input type",
                          rejected: "Rejected",
                          unconfirmed: "Unconfirmed",
                          guests: "Guests",
                          guest: "Guest",
                          web_conferencing_details_to_follow:
                            "Web conferencing details to follow in the confirmation email.",
                          the_username: "The username",
                          username: "Username",
                          is_still_available: "is still available.",
                          documentation: "Documentation",
                          documentation_description: "Learn how to integrate our tools with your app",
                          api_reference: "API Reference",
                          api_reference_description: "A complete API reference for our libraries",
                          blog: "Blog",
                          blog_description: "Read our latest news and articles",
                          join_our_community: "Join our community",
                          join_our_slack: "Join our Slack",
                          claim_username_and_schedule_events: "Claim your username and schedule events",
                          popular_pages: "Popular pages",
                          register_now: "Register now",
                          register: "Register",
                          page_doesnt_exist: "This page does not exist.",
                          check_spelling_mistakes_or_go_back:
                            "Check for spelling mistakes or go back to the previous page.",
                          "404_page_not_found": "404: This page could not be found.",
                          getting_started: "Getting Started",
                          "15min_meeting": "15 Min Meeting",
                          "30min_meeting": "30 Min Meeting",
                          secret_meeting: "Secret Meeting",
                          login_instead: "Login instead",
                          already_have_an_account: "Already have an account?",
                          create_account: "Create Account",
                          confirm_password: "Confirm password",
                          create_your_account: "Create your account",
                          sign_up: "Sign up",
                          youve_been_logged_out: "You've been logged out",
                          hope_to_see_you_soon: "We hope to see you again soon!",
                          logged_out: "Logged out",
                          please_try_again_and_contact_us:
                            "Please try again and contact us if the issue persists.",
                          incorrect_2fa_code: "Two-factor code is incorrect.",
                          no_account_exists: "No account exists matching that email address.",
                          "2fa_enabled_instructions":
                            "Two-factor authentication enabled. Please enter the six-digit code from your authenticator app.",
                          "2fa_enter_six_digit_code":
                            "Enter the six-digit code from your authenticator app below.",
                          create_an_account: "Create an account",
                          dont_have_an_account: "Don't have an account?",
                          "2fa_code": "Two-Factor Code",
                          sign_in_account: "Sign in to your account",
                          sign_in: "Sign in",
                          go_back_login: "Go back to the login page",
                          error_during_login:
                            "An error occurred when logging you in. Head back to the login screen and try again.",
                          request_password_reset: "Request Password Reset",
                          forgot_password: "Forgot Password",
                          forgot: "Forgot?",
                          done: "Done",
                          check_email_reset_password:
                            "Check your email. We sent you a link to reset your password.",
                          finish: "Finish",
                          few_sentences_about_yourself:
                            "A few sentences about yourself. This will appear on your personal url page.",
                          nearly_there: "Nearly there",
                          nearly_there_instructions:
                            "Last thing, a brief description about you and a photo really help you get bookings and let people know who they’re booking with.",
                          set_availability_instructions:
                            "Define ranges of time when you are available on a recurring basis. You can create more of these later and assign them to different calendars.",
                          set_availability: "Set your availability",
                          continue_without_calendar: "Continue without calendar",
                          connect_your_calendar: "Connect your calendar",
                          connect_your_calendar_instructions:
                            "Connect your calendar to automatically check for busy times and new events as they’re scheduled.",
                          set_up_later: "Set up later",
                          current_time: "Current time",
                          welcome: "Welcome",
                          welcome_to_calcom: "Welcome to Cal.com",
                          welcome_instructions:
                            "Tell us what to call you and let us know what timezone you’re in. You’ll be able to edit this later.",
                          connect_caldav: "Connect to CalDav Server",
                          credentials_stored_and_encrypted: "Your credentials will be stored and encrypted.",
                          connect: "Connect",
                          try_for_free: "Try it for free",
                          create_booking_link_with_calcom: "Create your own booking link with Cal.com",
                          who: "Who",
                          what: "What",
                          when: "When",
                          where: "Where",
                          add_to_calendar: "Add to calendar",
                          other: "Other",
                          emailed_you_and_attendees:
                            "We emailed you and the other attendees a calendar invitation with all the details.",
                          emailed_you_and_attendees_recurring:
                            "We emailed you and the other attendees a calendar invitation for the first of these recurring events.",
                          emailed_you_and_any_other_attendees:
                            "You and any other attendees have been emailed with this information.",
                          needs_to_be_confirmed_or_rejected:
                            "Your booking still needs to be confirmed or rejected.",
                          needs_to_be_confirmed_or_rejected_recurring:
                            "Your recurring meeting still needs to be confirmed or rejected.",
                          user_needs_to_confirm_or_reject_booking:
                            "{{user}} still needs to confirm or reject the booking.",
                          user_needs_to_confirm_or_reject_booking_recurring:
                            "{{user}} still needs to confirm or reject each booking of the recurring meeting.",
                          meeting_is_scheduled: "This meeting is scheduled",
                          meeting_is_scheduled_recurring: "The recurring events are scheduled",
                          submitted: "Your booking has been submitted",
                          submitted_recurring: "Your recurring meeting has been submitted",
                          booking_submitted: "Your booking has been submitted",
                          booking_submitted_recurring: "Your recurring meeting has been submitted",
                          booking_confirmed: "Your booking has been confirmed",
                          booking_confirmed_recurring: "Your recurring meeting has been confirmed",
                          warning_recurring_event_payment:
                            "Payments are not supported with Recurring Events yet",
                          warning_payment_recurring_event:
                            "Recurring events are not supported with Payments yet",
                          enter_new_password: "Enter the new password you'd like for your account.",
                          reset_password: "Reset Password",
                          change_your_password: "Change your password",
                          try_again: "Try Again",
                          request_is_expired: "That Request is Expired.",
                          reset_instructions:
                            "Enter the email address associated with your account and we will send you a link to reset your password.",
                          request_is_expired_instructions:
                            "That request is expired. Go back and enter the email associated with your account and we will send you another link to reset your password.",
                          whoops: "Whoops",
                          login: "Login",
                          success: "Success",
                          failed: "Failed",
                          password_has_been_reset_login:
                            "Your password has been reset. You can now login with your newly created password.",
                          unexpected_error_try_again: "An unexpected error occurred. Try again.",
                          sunday_time_error: "Invalid time on Sunday",
                          monday_time_error: "Invalid time on Monday",
                          tuesday_time_error: "Invalid time on Tuesday",
                          wednesday_time_error: "Invalid time on Wednesday",
                          thursday_time_error: "Invalid time on Thursday",
                          friday_time_error: "Invalid time on Friday",
                          saturday_time_error: "Invalid time on Saturday",
                          error_end_time_before_start_time: "End time cannot be before start time",
                          error_end_time_next_day: "End time cannot be greater than 24 hours",
                          back_to_bookings: "Back to bookings",
                          free_to_pick_another_event_type: "Feel free to pick another event anytime.",
                          cancelled: "Cancelled",
                          cancellation_successful: "Cancellation successful",
                          really_cancel_booking: "Really cancel your booking?",
                          cannot_cancel_booking: "You cannot cancel this booking",
                          reschedule_instead: "Instead, you could also reschedule it.",
                          event_is_in_the_past: "The event is in the past",
                          error_with_status_code_occured: "An error with status code {{status}} occurred.",
                          booking_already_cancelled: "This booking was already cancelled",
                          go_back_home: "Go back home",
                          or_go_back_home: "Or go back home",
                          no_availability: "Unavailable",
                          no_meeting_found: "No Meeting Found",
                          no_meeting_found_description:
                            "This meeting does not exist. Contact the meeting owner for an updated link.",
                          no_status_bookings_yet: "No {{status}} bookings, yet",
                          no_status_bookings_yet_description:
                            "You have no {{status}} bookings. {{description}}",
                          event_between_users: "{{eventName}} between {{host}} and {{attendeeName}}",
                          bookings: "Bookings",
                          bookings_description:
                            "See upcoming and past events booked through your event type links.",
                          upcoming_bookings: "As soon as someone books a time with you it will show up here.",
                          recurring_bookings:
                            "As soon as someone books a recurring meeting with you it will show up here.",
                          past_bookings: "Your past bookings will show up here.",
                          cancelled_bookings: "Your cancelled bookings will show up here.",
                          on: "on",
                          and: "and",
                          calendar_shows_busy_between: "Your calendar shows you as busy between",
                          troubleshoot: "Troubleshoot",
                          troubleshoot_description:
                            "Understand why certain times are available and others are blocked.",
                          overview_of_day: "Here is an overview of your day on",
                          hover_over_bold_times_tip: "Tip: Hover over the bold times for a full timestamp",
                          start_time: "Start time",
                          end_time: "End time",
                          buffer_time: "Buffer time",
                          before_event: "Before event",
                          after_event: "After event",
                          event_buffer_default: "No buffer time",
                          buffer: "Buffer",
                          your_day_starts_at: "Your day starts at",
                          your_day_ends_at: "Your day ends at",
                          launch_troubleshooter: "Launch troubleshooter",
                          troubleshoot_availability:
                            "Troubleshoot your availability to explore why your times are showing as they are.",
                          change_available_times: "Change available times",
                          change_your_available_times: "Change your available times",
                          change_start_end: "Change the start and end times of your day",
                          change_start_end_buffer:
                            "Set the start and end time of your day and a minimum buffer between your meetings.",
                          current_start_date: "Currently, your day is set to start at",
                          start_end_changed_successfully:
                            "The start and end times for your day have been changed successfully.",
                          and_end_at: "and end at",
                          light: "Light",
                          dark: "Dark",
                          automatically_adjust_theme:
                            "Automatically adjust theme based on invitee preferences",
                          user_dynamic_booking_disabled:
                            "Some of the users in the group have currently disabled dynamic group bookings",
                          allow_dynamic_booking_tooltip:
                            "Group booking links that can be created dynamically by adding multiple usernames with a '+'. example: 'cal.com/bailey+peer'",
                          allow_dynamic_booking: "Allow attendees to book you through dynamic group bookings",
                          email: "Email",
                          email_placeholder: "jdoe@example.com",
                          full_name: "Full name",
                          browse_api_documentation: "Browse our API documentation",
                          leverage_our_api: "Leverage our API for full control and customizability.",
                          create_webhook: "Create Webhook",
                          booking_cancelled: "Booking Cancelled",
                          booking_rescheduled: "Booking Rescheduled",
                          booking_created: "Booking Created",
                          event_triggers: "Event Triggers",
                          subscriber_url: "Subscriber Url",
                          create_new_webhook: "Create a new webhook",
                          webhooks: "Webhooks",
                          team_webhooks: "Team Webhooks",
                          create_new_webhook_to_account: "Create a new webhook to your account",
                          new_webhook: "New Webhook",
                          receive_cal_meeting_data:
                            "Receive Cal meeting data at a specified URL, in real-time, when an event is scheduled or cancelled.",
                          receive_cal_event_meeting_data:
                            "Receive Cal meeting data at a specified URL, in real-time, when this event is scheduled or cancelled.",
                          responsive_fullscreen_iframe: "Responsive full screen iframe",
                          loading: "Loading...",
                          deleting: "Deleting...",
                          standard_iframe: "Standard iframe",
                          developer: "Developer",
                          manage_developer_settings: "Manage your developer settings.",
                          iframe_embed: "iframe Embed",
                          embed_calcom: "The easiest way to embed Cal.com on your website.",
                          integrate_using_embed_or_webhooks:
                            "Integrate with your website using our embed options, or get real-time booking information using custom webhooks.",
                          schedule_a_meeting: "Schedule a meeting",
                          view_and_manage_billing_details: "View and manage your billing details",
                          view_and_edit_billing_details:
                            "View and edit your billing details, as well as cancel your subscription.",
                          go_to_billing_portal: "Go to the billing portal",
                          need_anything_else: "Need anything else?",
                          further_billing_help:
                            "If you need any further help with billing, our support team are here to help.",
                          contact_our_support_team: "Contact our support team",
                          uh_oh: "Uh oh!",
                          no_event_types_have_been_setup: "This user hasn't set up any event types yet.",
                          edit_logo: "Edit logo",
                          upload_a_logo: "Upload a logo",
                          remove_logo: "Remove logo",
                          enable: "Enable",
                          code: "Code",
                          code_is_incorrect: "Code is incorrect.",
                          add_an_extra_layer_of_security:
                            "Add an extra layer of security to your account in case your password is stolen.",
                          "2fa": "Two-Factor Authentication",
                          enable_2fa: "Enable two-factor authentication",
                          disable_2fa: "Disable two-factor authentication",
                          disable_2fa_recommendation:
                            "If you need to disable 2FA, we recommend re-enabling it as soon as possible.",
                          error_disabling_2fa: "Error disabling two-factor authentication",
                          error_enabling_2fa: "Error setting up two-factor authentication",
                          security: "Security",
                          manage_account_security: "Manage your account's security.",
                          password: "Password",
                          password_updated_successfully: "Password updated successfully",
                          password_has_been_changed: "Your password has been successfully changed.",
                          error_changing_password: "Error changing password",
                          something_went_wrong: "Something went wrong.",
                          something_doesnt_look_right: "Something doesn't look right?",
                          please_try_again: "Please try again.",
                          super_secure_new_password: "Your super secure new password",
                          new_password: "New Password",
                          your_old_password: "Your old password",
                          current_password: "Current Password",
                          change_password: "Change Password",
                          new_password_matches_old_password:
                            "New password matches your old password. Please choose a different password.",
                          current_incorrect_password: "Current password is incorrect",
                          incorrect_password: "Password is incorrect.",
                          "1_on_1": "1-on-1",
                          "24_h": "24h",
                          use_setting: "Use setting",
                          am_pm: "am/pm",
                          time_options: "Time options",
                          january: "January",
                          february: "February",
                          march: "March",
                          april: "April",
                          may: "May",
                          june: "June",
                          july: "July",
                          august: "August",
                          september: "September",
                          october: "October",
                          november: "November",
                          december: "December",
                          monday: "Monday",
                          tuesday: "Tuesday",
                          wednesday: "Wednesday",
                          thursday: "Thursday",
                          friday: "Friday",
                          saturday: "Saturday",
                          sunday: "Sunday",
                          all_booked_today: "All booked today.",
                          slots_load_fail: "Could not load the available time slots.",
                          additional_guests: "+ Additional Guests",
                          your_name: "Your name",
                          email_address: "Email address",
                          location: "Location",
                          yes: "yes",
                          no: "no",
                          additional_notes: "Additional notes",
                          booking_fail: "Could not book the meeting.",
                          reschedule_fail: "Could not reschedule the meeting.",
                          share_additional_notes:
                            "Please share anything that will help prepare for our meeting.",
                          booking_confirmation: "Confirm your {{eventTypeTitle}} with {{profileName}}",
                          booking_reschedule_confirmation:
                            "Reschedule your {{eventTypeTitle}} with {{profileName}}",
                          in_person_meeting: "In-person meeting",
                          link_meeting: "Link meeting",
                          phone_call: "Phone call",
                          your_number: "Your phone number",
                          phone_number: "Phone Number",
                          attendee_phone_number: "Attendee Phone Number",
                          host_phone_number: "Your Phone Number",
                          enter_phone_number: "Enter phone number",
                          reschedule: "Reschedule",
                          reschedule_this: "Reschedule instead",
                          book_a_team_member: "Book a team member instead",
                          or: "OR",
                          go_back: "Go back",
                          email_or_username: "Email or Username",
                          send_invite_email: "Send an invite email",
                          role: "Role",
                          edit_role: "Edit Role",
                          edit_team: "Edit team",
                          reject: "Reject",
                          reject_all: "Reject all",
                          accept: "Accept",
                          leave: "Leave",
                          profile: "Profile",
                          my_team_url: "My team URL",
                          team_name: "Team name",
                          your_team_name: "Your team name",
                          team_updated_successfully: "Team updated successfully",
                          your_team_updated_successfully: "Your team has been updated successfully.",
                          about: "About",
                          team_description:
                            "A few sentences about your team. This will appear on your team's URL page.",
                          members: "Members",
                          member: "Member",
                          owner: "Owner",
                          admin: "Admin",
                          new_member: "New Member",
                          invite: "Invite",
                          invite_new_member: "Invite a new member",
                          invite_new_team_member: "Invite someone to your team.",
                          change_member_role: "Change team member role",
                          disable_cal_branding: "Disable Cal.com branding",
                          disable_cal_branding_description:
                            "Hide all Cal.com branding from your public pages.",
                          danger_zone: "Danger Zone",
                          back: "Back",
                          cancel: "Cancel",
                          apply: "Apply",
                          cancel_event: "Cancel event",
                          continue: "Continue",
                          confirm: "Confirm",
                          confirm_all: "Confirm all",
                          disband_team: "Disband Team",
                          disband_team_confirmation_message:
                            "Are you sure you want to disband this team? Anyone who you've shared this team link with will no longer be able to book using it.",
                          remove_member_confirmation_message:
                            "Are you sure you want to remove this member from the team?",
                          confirm_disband_team: "Yes, disband team",
                          confirm_remove_member: "Yes, remove member",
                          remove_member: "Remove member",
                          manage_your_team: "Manage your team",
                          no_teams: "You don't have any teams yet.",
                          no_teams_description:
                            "Teams allow others to book events shared between your coworkers.",
                          submit: "Submit",
                          delete: "Delete",
                          update: "Update",
                          save: "Save",
                          pending: "Pending",
                          open_options: "Open options",
                          copy_link: "Copy link to event",
                          share: "Share",
                          share_event: "Would you mind booking my cal or send me your link?",
                          copy_link_team: "Copy link to team",
                          leave_team: "Leave team",
                          confirm_leave_team: "Yes, leave team",
                          leave_team_confirmation_message:
                            "Are you sure you want to leave this team? You will no longer be able to book using it.",
                          user_from_team: "{{user}} from {{team}}",
                          preview: "Preview",
                          link_copied: "Link copied!",
                          private_link_copied: "Private link copied!",
                          link_shared: "Link shared!",
                          title: "Title",
                          description: "Description",
                          quick_video_meeting: "A quick video meeting.",
                          scheduling_type: "Scheduling Type",
                          preview_team: "Preview team",
                          collective: "Collective",
                          collective_description:
                            "Schedule meetings when all selected team members are available.",
                          duration: "Duration",
                          minutes: "Minutes",
                          round_robin: "Round Robin",
                          round_robin_description: "Cycle meetings between multiple team members.",
                          url: "URL",
                          hidden: "Hidden",
                          readonly: "Readonly",
                          one_time_link: "One-time link",
                          plan_description: "You're currently on the {{plan}} plan.",
                          plan_upgrade_invitation:
                            "Upgrade your account to the pro plan to unlock all of the features we have to offer.",
                          plan_upgrade:
                            "You need to upgrade your plan to have more than one active event type.",
                          plan_upgrade_teams: "You need to upgrade your plan to create a team.",
                          plan_upgrade_instructions: "You can <1>upgrade here</1>.",
                          event_types_page_title: "Event Types",
                          event_types_page_subtitle:
                            "Create events to share for people to book on your calendar.",
                          new_event_type_btn: "New event type",
                          new_event_type_heading: "Create your first event type",
                          new_event_type_description:
                            "Event types enable you to share links that show available times on your calendar and allow people to make bookings with you.",
                          new_event_title: "Add a new event type",
                          new_event_subtitle: "Create an event type under your name or a team.",
                          new_team_event: "Add a new team event type",
                          new_event_description: "Create a new event type for people to book times with.",
                          event_type_created_successfully:
                            "{{eventTypeTitle}} event type created successfully",
                          event_type_updated_successfully:
                            "{{eventTypeTitle}} event type updated successfully",
                          event_type_deleted_successfully: "Event type deleted successfully",
                          web3_metamask_added: "Metamask added successfully",
                          web3_metamask_disconnected: "Metamask disconnected successfully",
                          hours: "Hours",
                          your_email: "Your Email",
                          change_avatar: "Change Avatar",
                          language: "Language",
                          timezone: "Timezone",
                          first_day_of_week: "First Day of Week",
                          repeats_up_to: "Repeats up to {{count}} time",
                          repeats_up_to_plural: "Repeats up to {{count}} times",
                          every_for_freq: "Every {{freq}} for",
                          repeats_every: "Repeats every",
                          weekly: "week",
                          weekly_plural: "weeks",
                          monthly: "month",
                          monthly_plural: "months",
                          yearly: "year",
                          yearly_plural: "years",
                          plus_more: "+ {{count}} more",
                          max: "Max",
                          single_theme: "Single Theme",
                          brand_color: "Brand Color",
                          light_brand_color: "Brand Color (Light Theme)",
                          dark_brand_color: "Brand Color (Dark Theme)",
                          file_not_named: "File is not named [idOrSlug]/[user]",
                          create_team: "Create Team",
                          name: "Name",
                          create_new_team_description: "Create a new team to collaborate with users.",
                          create_new_team: "Create a new team",
                          open_invitations: "Open Invitations",
                          new_team: "New Team",
                          create_first_team_and_invite_others:
                            "Create your first team and invite other users to work together with you.",
                          create_team_to_get_started: "Create a team to get started",
                          teams: "Teams",
                          team_billing: "Team Billing",
                          upgrade_to_flexible_pro_title: "We've changed billing for teams",
                          upgrade_to_flexible_pro_message:
                            "There are members in your team without a seat. Upgrade your pro plan to cover missing seats.",
                          changed_team_billing_info:
                            "As of January 2022 we charge on a per-seat basis for team members. Members of your team who had PRO for free are now on a 14 day trial. Once their trial expires these members will be hidden from your team unless you upgrade now.",
                          create_manage_teams_collaborative:
                            "Create and manage teams to use collaborative features.",
                          only_available_on_pro_plan: "This feature is only available in Pro plan",
                          remove_cal_branding_description:
                            "In order to remove the Cal branding from your booking pages, you need to upgrade to a Pro account.",
                          edit_profile_info_description:
                            "Edit your profile information, which shows on your scheduling link.",
                          change_email_tip:
                            "You may need to log out and back in to see the change take effect.",
                          little_something_about: "A little something about yourself.",
                          profile_updated_successfully: "Profile updated successfully",
                          your_user_profile_updated_successfully:
                            "Your user profile has been updated successfully.",
                          user_cannot_found_db: "User seems logged in but cannot be found in the db",
                          embed_and_webhooks: "Embed & Webhooks",
                          enabled: "Enabled",
                          disabled: "Disabled",
                          disable: "Disable",
                          billing: "Billing",
                          manage_your_billing_info:
                            "Manage your billing information and cancel your subscription.",
                          availability: "Availability",
                          configure_availability: "Configure times when you are available for bookings.",
                          change_weekly_schedule: "Change your weekly schedule",
                          logo: "Logo",
                          error: "Error",
                          team_logo: "Team Logo",
                          add_location: "Add a location",
                          attendees: "Attendees",
                          add_attendees: "Add attendees",
                          show_advanced_settings: "Show advanced settings",
                          event_name: "Event Name",
                          event_name_tooltip: "The name that will appear in calendars",
                          meeting_with_user: "Meeting with {ATTENDEE}",
                          additional_inputs: "Additional Inputs",
                          label: "Label",
                          placeholder: "Placeholder",
                          type: "Type",
                          edit: "Edit",
                          add_input: "Add an Input",
                          disable_notes: "Hide notes in calendar",
                          disable_notes_description:
                            "For privacy reasons, additional inputs and notes will be hidden in the calendar entry. They will still be sent to your email.",
                          opt_in_booking: "Opt-in Booking",
                          opt_in_booking_description:
                            "The booking needs to be manually confirmed before it is pushed to the integrations and a confirmation mail is sent.",
                          recurring_event: "Recurring Event",
                          recurring_event_description: "People can subscribe for recurring events",
                          starting: "Starting",
                          disable_guests: "Disable Guests",
                          disable_guests_description: "Disable adding additional guests while booking.",
                          private_link: "Generate private URL",
                          copy_private_link: "Copy private link",
                          private_link_description:
                            "Generate a private URL to share without exposing your Cal username",
                          invitees_can_schedule: "Invitees can schedule",
                          date_range: "Date Range",
                          calendar_days: "calendar days",
                          business_days: "business days",
                          set_address_place: "Set an address or place",
                          set_link_meeting: "Set a link to the meeting",
                          cal_invitee_phone_number_scheduling:
                            "Cal will ask your invitee to enter a phone number before scheduling.",
                          cal_provide_google_meet_location: "Cal will provide a Google Meet location.",
                          cal_provide_zoom_meeting_url: "Cal will provide a Zoom meeting URL.",
                          cal_provide_tandem_meeting_url: "Cal will provide a Tandem meeting URL.",
                          cal_provide_video_meeting_url: "Cal will provide a video meeting URL.",
                          cal_provide_jitsi_meeting_url: "We will generate a Jitsi Meet URL for you.",
                          cal_provide_huddle01_meeting_url:
                            "Cal will provide a Huddle01 web3 video meeting URL.",
                          cal_provide_teams_meeting_url:
                            "Cal will provide a MS Teams meeting URL. NOTE: MUST HAVE A WORK OR SCHOOL ACCOUNT",
                          require_payment: "Require Payment",
                          commission_per_transaction: "commission per transaction",
                          event_type_updated_successfully_description:
                            "Your event type has been updated successfully.",
                          hide_event_type: "Hide event type",
                          edit_location: "Edit location",
                          into_the_future: "into the future",
                          within_date_range: "Within a date range",
                          indefinitely_into_future: "Indefinitely into the future",
                          add_new_custom_input_field: "Add new custom input field",
                          quick_chat: "Quick Chat",
                          add_new_team_event_type: "Add a new team event type",
                          add_new_event_type: "Add a new event type",
                          new_event_type_to_book_description:
                            "Create a new event type for people to book times with.",
                          length: "Length",
                          minimum_booking_notice: "Minimum booking notice",
                          slot_interval: "Time-slot intervals",
                          slot_interval_default: "Use event length (default)",
                          delete_event_type_description:
                            "Are you sure you want to delete this event type? Anyone who you've shared this link with will no longer be able to book using it.",
                          delete_event_type: "Delete Event Type",
                          confirm_delete_event_type: "Yes, delete event type",
                          delete_account: "Delete account",
                          confirm_delete_account: "Yes, delete account",
                          delete_account_confirmation_message:
                            "Are you sure you want to delete your Cal.com account? Anyone who you've shared your account link with will no longer be able to book using it and any preferences you have saved will be lost.",
                          integrations: "Integrations",
                          apps: "Apps",
                          app_store: "App Store",
                          app_store_description: "Connecting people, technology and the workplace.",
                          settings: "Settings",
                          event_type_moved_successfully: "Event type has been moved successfully",
                          next_step: "Skip step",
                          prev_step: "Prev step",
                          installed: "Installed",
                          active_install: "{{count}} active install",
                          active_install_plural: "{{count}} active installs",
                          globally_install: "Globally installed",
                          disconnect: "Disconnect",
                          embed_your_calendar: "Embed your calendar within your webpage",
                          connect_your_favourite_apps: "Connect your favourite apps.",
                          automation: "Automation",
                          configure_how_your_event_types_interact:
                            "Configure how your event types should interact with your calendars.",
                          select_destination_calendar: "Create events on",
                          connect_additional_calendar: "Connect additional calendar",
                          conferencing: "Conferencing",
                          calendar: "Calendar",
                          not_installed: "Not installed",
                          error_password_mismatch: "Passwords don't match.",
                          error_required_field: "This field is required.",
                          status: "Status",
                          team_view_user_availability: "View user availability",
                          team_view_user_availability_disabled:
                            "User needs to accept invite to view availability",
                          set_as_away: "Set yourself as away",
                          set_as_free: "Disable away status",
                          user_away: "This user is currently away.",
                          user_away_description:
                            "The person you are trying to book has set themselves to away, and therefore is not accepting new bookings.",
                          meet_people_with_the_same_tokens: "Meet people with the same tokens",
                          only_book_people_and_allow:
                            "Only book and allow bookings from people who share the same tokens, DAOs, or NFTs.",
                          saml_config_deleted_successfully: "SAML configuration deleted successfully",
                          account_created_with_identity_provider:
                            "Your account was created using an Identity Provider.",
                          account_managed_by_identity_provider: "Your account is managed by {{provider}}",
                          account_managed_by_identity_provider_description:
                            "To change your email, password, enable two-factor authentication and more, please visit your {{provider}} account settings.",
                          signin_with_google: "Sign in with Google",
                          signin_with_saml: "Sign in with SAML",
                          saml_configuration: "SAML configuration",
                          delete_saml_configuration: "Delete SAML configuration",
                          delete_saml_configuration_confirmation_message:
                            "Are you sure you want to delete the SAML configuration? Your team members who use SAML login will no longer be able to access Cal.com.",
                          confirm_delete_saml_configuration: "Yes, delete SAML configuration",
                          saml_not_configured_yet: "SAML not configured yet",
                          saml_configuration_description:
                            "Please paste the SAML metadata from your Identity Provider in the textbox below to update your SAML configuration.",
                          saml_configuration_placeholder:
                            "Please paste the SAML metadata from your Identity Provider here",
                          saml_configuration_update_failed: "SAML configuration update failed",
                          saml_configuration_delete_failed: "SAML configuration delete failed",
                          saml_email_required:
                            "Please enter an email so we can find your SAML Identity Provider",
                          you_will_need_to_generate:
                            "You will need to generate an access token from your old scheduling tool.",
                          import: "Import",
                          import_from: "Import from",
                          access_token: "Access token",
                          visit_roadmap: "Roadmap",
                          popular_categories: "Popular Categories",
                          trending_apps: "Trending Apps",
                          all_apps: "All Apps",
                          installed_apps: "Installed Apps",
                          empty_installed_apps_headline: "No apps installed",
                          empty_installed_apps_description:
                            "Apps enable you to enhance your workflow and improve your scheduling life significantly.",
                          empty_installed_apps_button: "Explore the App Store",
                          manage_your_connected_apps: "Manage your installed apps or change settings",
                          browse_apps: "Browse Apps",
                          features: "Features",
                          permissions: "Permissions",
                          terms_and_privacy: "Terms and Privacy",
                          published_by: "Published by {{author}}",
                          subscribe: "Subscribe",
                          buy: "Buy",
                          install_app: "Install App",
                          categories: "Categories",
                          pricing: "Pricing",
                          learn_more: "Learn more",
                          privacy_policy: "Privacy Policy",
                          terms_of_service: "Terms of Service",
                          remove: "Remove",
                          add: "Add",
                          verify_wallet: "Verify Wallet",
                          connect_metamask: "Connect Metamask",
                          create_events_on: "Create events on:",
                          missing_license: "Missing License",
                          signup_requires: "Commercial license required",
                          signup_requires_description:
                            "Cal.com, Inc. currently does not offer a free open source version of the sign up page. To receive full access to the signup components you need to acquire a commercial license. For personal use we recommend the Prisma Data Platform or any other Postgres interface to create accounts.",
                          next_steps: "Next Steps",
                          acquire_commercial_license: "Acquire a commercial license",
                          the_infrastructure_plan:
                            "The infrastructure plan is usage-based and has startup-friendly discounts.",
                          prisma_studio_tip: "Create an account via Prisma Studio",
                          prisma_studio_tip_description: "Learn how to set up your first user",
                          contact_sales: "Contact Sales",
                          error_404: "Error 404",
                          default: "Default",
                          set_to_default: "Set to Default",
                          new_schedule_btn: "New schedule",
                          add_new_schedule: "Add a new schedule",
                          delete_schedule: "Delete schedule",
                          schedule_created_successfully: "{{scheduleName}} schedule created successfully",
                          availability_updated_successfully: "{{scheduleName}} schedule updated successfully",
                          schedule_deleted_successfully: "Schedule deleted successfully",
                          default_schedule_name: "Working Hours",
                          new_schedule_heading: "Create an availability schedule",
                          new_schedule_description:
                            "Creating availability schedules allows you to manage availability across event types. They can be applied to one or more event types.",
                          requires_ownership_of_a_token:
                            "Requires ownership of a token belonging to the following address:",
                          example_name: "John Doe",
                          time_format: "Time format",
                          "12_hour": "12 hour",
                          "24_hour": "24 hour",
                          redirect_success_booking: "Redirect on booking ",
                          you_are_being_redirected:
                            'You are being redirected to {{ url }} in $t(second, {"count": {{seconds}} }).',
                          external_redirect_url: "https://example.com/redirect-to-my-success-page",
                          redirect_url_upgrade_description:
                            "In order to use this feature, you need to upgrade to a Pro account.",
                          duplicate: "Duplicate",
                          offer_seats: "Offer seats",
                          offer_seats_description:
                            "Offer seats to bookings (This disables guests & opt in bookings)",
                          seats_available: "Seats available",
                          number_of_seats: "Number of seats per booking",
                          enter_number_of_seats: "Enter number of seats",
                          you_can_manage_your_schedules:
                            "You can manage your schedules on the Availability page.",
                          booking_full: "No more seats available",
                          api_keys: "API Keys",
                          api_key_modal_subtitle:
                            "API keys allow you to make API calls for your own account.",
                          api_keys_subtitle: "Generate API keys to use for accessing your own account.",
                          create_api_key: "Create an API key",
                          personal_note: "Name this key",
                          personal_note_placeholder: "E.g. Development",
                          api_key_no_note: "Nameless API key",
                          api_key_never_expires: "This API key has no expiration date",
                          edit_api_key: "Edit API key",
                          never_expire_key: "Never expires",
                          delete_api_key: "Revoke API key",
                          success_api_key_created: "API key created successfully",
                          success_api_key_edited: "API key updated successfully",
                          create: "Create",
                          success_api_key_created_bold_tagline: "Save this API key somewhere safe.",
                          you_will_only_view_it_once:
                            "You will not be able to view it again once you close this modal.",
                          copy_to_clipboard: "Copy to clipboard",
                          enabled_after_update: "Enabled after update",
                          enabled_after_update_description: "The private link will work after saving",
                          confirm_delete_api_key: "Revoke this API key",
                          revoke_api_key: "Revoke API key",
                          api_key_copied: "API key copied!",
                          delete_api_key_confirm_title: "Permanently remove this API key from your account?",
                          copy: "Copy",
                          expire_date: "Expiration date",
                          expired: "Expired",
                          never_expires: "Never expires",
                          expires: "Expires",
                          request_reschedule_booking: "Request to reschedule your booking",
                          reason_for_reschedule: "Reason for reschedule",
                          book_a_new_time: "Book a new time",
                          reschedule_request_sent: "Reschedule request sent",
                          reschedule_modal_description:
                            "This will cancel the scheduled meeting, notify the scheduler and ask them to pick a new time.",
                          reason_for_reschedule_request: "Reason for reschedule request",
                          send_reschedule_request: "Request reschedule ",
                          edit_booking: "Edit booking",
                          reschedule_booking: "Reschedule booking",
                          former_time: "Former time",
                          confirmation_page_gif: "Gif for confirmation page",
                          search: "Search",
                          impersonate: "Impersonate",
                          user_impersonation_heading: "User Impersonation",
                          user_impersonation_description:
                            "Allows our support team to temporarily sign in as you to help us quickly resolve any issues you report to us.",
                          impersonate_user_tip: "All uses of this feature is audited.",
                          impersonating_user_warning: 'Impersonating username "{{user}}".',
                          impersonating_stop_instructions: "<0>Click Here to stop</0>.",
                          event_location_changed: "Updated - Your event changed the location",
                          location_changed_event_type_subject:
                            "Location Changed: {{eventType}} with {{name}} at {{date}}",
                          current_location: "Current Location",
                          user_phone: "Your phone number",
                          new_location: "New Location",
                          no_location: "No location defined",
                          set_location: "Set Location",
                          update_location: "Update Location",
                          location_updated: "Location updated",
                          email_validation_error: "That doesn't look like an email address",
                          place_where_cal_widget_appear:
                            "Place this code in your HTML where you want your Cal widget to appear.",
                          copy_code: "Copy Code",
                          code_copied: "Code copied!",
                          how_you_want_add_cal_site: "How do you want to add Cal to your site?",
                          choose_ways_put_cal_site:
                            "Choose one of the following ways to put Cal on your site.",
                          setting_up_zapier: "Setting up your Zapier integration",
                          generate_api_key: "Generate Api Key",
                          your_unique_api_key: "Your unique API key",
                          copy_safe_api_key:
                            "Copy this API key and save it somewhere safe. If you lose this key you have to generate a new one.",
                          zapier_setup_instructions:
                            "<0>Log into your Zapier account and create a new Zap.</0><1>Select Cal.com as your Trigger app. Also choose a Trigger event.</1><2>Choose your account and then enter your Unique API Key.</2><3>Test your Trigger.</3><4>You're set!</4>",
                          install_zapier_app: "Please first install the Zapier App in the app store.",
                          go_to_app_store: "Go to App Store",
                          calendar_error:
                            "Something went wrong, try reconnecting your calendar with all necessary permissions",
                          set_your_phone_number: "Set a phone number for the meeting",
                          calendar_no_busy_slots: "There are no busy slots",
                          display_location_label: "Display on booking page",
                          display_location_info_badge:
                            "Location will be visible before the booking is confirmed",
                          add_gif: "Add GIF",
                          search_giphy: "Search Giphy",
                          add_link_from_giphy: "Add link from Giphy",
                          add_gif_to_confirmation: "Adding a GIF to confirmation page",
                          find_gif_spice_confirmation: "Find GIF to spice up your confirmation page",
                          share_feedback: "Share feedback",
                          resources: "Resources",
                          support_documentation: "Support documentation",
                          developer_documentation: "Developer Documentation",
                          get_in_touch: "Get in touch",
                          contact_support: "Contact Support",
                          feedback: "Feedback",
                          submitted_feedback: "Thank you for your feedback!",
                          feedback_error: "Error sending feedback",
                          comments: "Comments",
                          booking_details: "Booking details",
                          or_lowercase: "or",
                          nevermind: "Nevermind",
                          go_to: "Go to: ",
                          zapier_invite_link: "Zapier Invite Link",
                          meeting_url_provided_after_confirmed:
                            "A Meeting URL will be created once the event is confirmed.",
                          attendees_name: "Attendee's name",
                          dynamically_display_attendee_or_organizer:
                            "Dynamically display the name of your attendee for you, or your name if it's viewed by your attendee",
                          event_location: "Event's location",
                          reschedule_optional: "Reason for rescheduling (optional)",
                          reschedule_placeholder: "Let others know why you need to reschedule",
                          event_cancelled: "This event is cancelled",
                          emailed_information_about_cancelled_event:
                            "We emailed you and the other attendees to let them know.",
                          this_input_will_shown_booking_this_event:
                            "This input will be shown when booking this event",
                          meeting_url_in_conformation_email: "Meeting url is in the confirmation email",
                          url_start_with_https: "URL needs to start with http:// or https://",
                          number_provided: "Phone number will be provided",
                          remove_app: "Remove App",
                          yes_remove_app: "Yes, remove app",
                          are_you_sure_you_want_to_remove_this_app:
                            "Are you sure you want to remove this app?",
                          web_conference: "Web conference",
                        },
                        vital: {
                          connected_vital_app: "Connected with",
                          vital_app_sleep_automation: "Sleeping reschedule automation",
                          vital_app_automation_description:
                            "You can select different parameters to trigger the reschedule based on your sleeping metrics.",
                          vital_app_parameter: "Parameter",
                          vital_app_trigger: "Trigger at below or equal than",
                          vital_app_save_button: "Save configuration",
                          vital_app_total_label: "Total (total = rem + light sleep + deep sleep)",
                          vital_app_duration_label: "Duration (duration = bedtime end - bedtime start)",
                          vital_app_hours: "hours",
                          vital_app_save_success: "Success saving your Vital Configurations",
                          vital_app_save_error: "An error ocurred saving your Vital Configurations",
                        },
                      },
                    },
                    initialLocale: "en",
                    userConfig: {
                      i18n: {
                        defaultLocale: "en",
                        locales: [
                          "en",
                          "fr",
                          "it",
                          "ru",
                          "es",
                          "de",
                          "pt",
                          "ro",
                          "nl",
                          "pt-BR",
                          "es-419",
                          "ko",
                          "ja",
                          "pl",
                          "ar",
                          "iw",
                          "zh-CN",
                          "zh-TW",
                          "cs",
                          "sr",
                          "sv",
                          "vi",
                        ],
                      },
                      localePath: "/Users/alex/Repositories/cal.com/apps/web/public/static/locales",
                      reloadOnPrerender: true,
                      default: {
                        i18n: {
                          defaultLocale: "en",
                          locales: [
                            "en",
                            "fr",
                            "it",
                            "ru",
                            "es",
                            "de",
                            "pt",
                            "ro",
                            "nl",
                            "pt-BR",
                            "es-419",
                            "ko",
                            "ja",
                            "pl",
                            "ar",
                            "iw",
                            "zh-CN",
                            "zh-TW",
                            "cs",
                            "sr",
                            "sv",
                            "vi",
                          ],
                        },
                        localePath: "/Users/alex/Repositories/cal.com/apps/web/public/static/locales",
                        reloadOnPrerender: true,
                      },
                    },
                  },
                },
                locale: "en",
              },
              dataUpdateCount: 1,
              dataUpdatedAt: 1654602871785,
              error: null,
              errorUpdateCount: 0,
              errorUpdatedAt: 0,
              fetchFailureCount: 0,
              fetchMeta: null,
              isFetching: false,
              isInvalidated: false,
              isPaused: false,
              status: "success",
            },
            queryKey: ["viewer.i18n"],
            queryHash: '["viewer.i18n"]',
          },
        ],
      },
      meta: {
        referentialEqualities: {
          "queries.0.state.data.i18n._nextI18Next.userConfig.i18n": [
            "queries.0.state.data.i18n._nextI18Next.userConfig.default.i18n",
          ],
          "queries.0.state.data.i18n._nextI18Next.userConfig.i18n.locales": [
            "queries.0.state.data.i18n._nextI18Next.userConfig.default.i18n.locales",
          ],
        },
      },
    },
    booking: null,
  };

  const { t } = useLocale();

  return props.away ? (
    <div className="h-screen dark:bg-neutral-900">
      <main className="mx-auto max-w-3xl px-4 py-24">
        <div className="space-y-6" data-testid="event-types">
          <div className="overflow-hidden rounded-sm border dark:border-gray-900">
            <div className="p-8 text-center text-gray-400 dark:text-white">
              <h2 className="font-cal mb-2 text-3xl text-gray-600 dark:text-white">
                😴{" " + t("user_away")}
              </h2>
              <p className="mx-auto max-w-md">{t("user_away_description")}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  ) : data.isDynamicGroup && !data.profile.allowDynamicBooking ? (
    <div className="h-screen dark:bg-neutral-900">
      <main className="mx-auto max-w-3xl px-4 py-24">
        <div className="space-y-6" data-testid="event-types">
          <div className="overflow-hidden rounded-sm border dark:border-gray-900">
            <div className="p-8 text-center text-gray-400 dark:text-white">
              <h2 className="font-cal mb-2 text-3xl text-gray-600 dark:text-white">
                {" " + t("unavailable")}
              </h2>
              <p className="mx-auto max-w-md">{t("user_dynamic_booking_disabled")}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  ) : (
    <AvailabilityPage {...data} />
  );
}

/*export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const ssr = await ssrInit(context);

  const usernameList = getUsernameList(context.query.user);

  const userParam = asStringOrNull(context.query.user);
  const typeParam = asStringOrNull(context.query.type);
  const dateParam = asStringOrNull(context.query.date);
  const rescheduleUid = asStringOrNull(context.query.rescheduleUid);

  if (!userParam || !typeParam) {
    throw new Error(`File is not named [type]/[user]`);
  }

  const eventTypeSelect = Prisma.validator<Prisma.EventTypeSelect>()({
    id: true,
    title: true,
    availability: true,
    description: true,
    length: true,
    price: true,
    currency: true,
    periodType: true,
    periodStartDate: true,
    periodEndDate: true,
    periodDays: true,
    periodCountCalendarDays: true,
    locations: true,
    schedulingType: true,
    recurringEvent: true,
    schedule: {
      select: {
        availability: true,
        timeZone: true,
      },
    },
    hidden: true,
    slug: true,
    minimumBookingNotice: true,
    beforeEventBuffer: true,
    afterEventBuffer: true,
    timeZone: true,
    metadata: true,
    slotInterval: true,
    seatsPerTimeSlot: true,
    users: {
      select: {
        avatar: true,
        name: true,
        username: true,
        hideBranding: true,
        plan: true,
        timeZone: true,
      },
    },
  });

  const users = await prisma.user.findMany({
    where: {
      username: {
        in: usernameList,
      },
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
      startTime: true,
      endTime: true,
      timeZone: true,
      weekStart: true,
      availability: true,
      hideBranding: true,
      brandColor: true,
      darkBrandColor: true,
      defaultScheduleId: true,
      allowDynamicBooking: true,
      away: true,
      schedules: {
        select: {
          availability: true,
          timeZone: true,
          id: true,
        },
      },
      theme: true,
      plan: true,
      eventTypes: {
        where: {
          AND: [
            {
              slug: typeParam,
            },
            {
              teamId: null,
            },
          ],
        },
        select: eventTypeSelect,
      },
    },
  });

  if (!users || !users.length) {
    return {
      notFound: true,
    };
  }
  const [user] = users; //to be used when dealing with single user, not dynamic group
  const isSingleUser = users.length === 1;
  const isDynamicGroup = users.length > 1;

  if (isSingleUser && user.eventTypes.length !== 1) {
    const eventTypeBackwardsCompat = await prisma.eventType.findFirst({
      where: {
        AND: [
          {
            userId: user.id,
          },
          {
            slug: typeParam,
          },
        ],
      },
      select: eventTypeSelect,
    });
    if (!eventTypeBackwardsCompat) {
      return {
        notFound: true,
      };
    }

    eventTypeBackwardsCompat.users.push({
      avatar: user.avatar,
      name: user.name,
      username: user.username,
      hideBranding: user.hideBranding,
      plan: user.plan,
      timeZone: user.timeZone,
    });

    user.eventTypes.push(eventTypeBackwardsCompat);
  }

  let [eventType] = user.eventTypes;

  if (isDynamicGroup) {
    eventType = getDefaultEvent(typeParam);
    eventType["users"] = users.map((user) => {
      return {
        avatar: user.avatar as string,
        name: user.name as string,
        username: user.username as string,
        hideBranding: user.hideBranding,
        plan: user.plan,
        timeZone: user.timeZone as string,
      };
    });
  }

  // check this is the first event for free user
  if (isSingleUser && user.plan === UserPlan.FREE) {
    const firstEventType = await prisma.eventType.findFirst({
      where: {
        OR: [
          {
            userId: user.id,
          },
          {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        ],
      },
      orderBy: [
        {
          position: "desc",
        },
        {
          id: "asc",
        },
      ],
      select: {
        id: true,
      },
    });
    if (firstEventType?.id !== eventType.id) {
      return {
        notFound: true,
      } as const;
    }
  }
  const locations = eventType.locations ? (eventType.locations as LocationObject[]) : [];

  const eventTypeObject = Object.assign({}, eventType, {
    metadata: (eventType.metadata || {}) as JSONObject,
    periodStartDate: eventType.periodStartDate?.toString() ?? null,
    periodEndDate: eventType.periodEndDate?.toString() ?? null,
    recurringEvent: parseRecurringEvent(eventType.recurringEvent),
    locations: locationHiddenFilter(locations),
  });

  const schedule = eventType.schedule
    ? { ...eventType.schedule }
    : {
        ...user.schedules.filter(
          (schedule) => !user.defaultScheduleId || schedule.id === user.defaultScheduleId
        )[0],
      };

  const timeZone = isDynamicGroup ? undefined : schedule.timeZone || eventType.timeZone || user.timeZone;

  const workingHours = getWorkingHours(
    {
      timeZone,
    },
    isDynamicGroup
      ? eventType.availability || undefined
      : schedule.availability || (eventType.availability.length ? eventType.availability : user.availability)
  );
  eventTypeObject.schedule = null;
  eventTypeObject.availability = [];

  let booking: GetBookingType | null = null;
  if (rescheduleUid) {
    booking = await getBooking(prisma, rescheduleUid);
  }

  const dynamicNames = isDynamicGroup
    ? users.map((user) => {
        return user.name || "";
      })
    : [];

  const profile = isDynamicGroup
    ? {
        name: getGroupName(dynamicNames),
        image: null,
        slug: typeParam,
        theme: null,
        weekStart: "Sunday",
        brandColor: "",
        darkBrandColor: "",
        allowDynamicBooking: !users.some((user) => {
          return !user.allowDynamicBooking;
        }),
      }
    : {
        name: user.name || user.username,
        image: user.avatar,
        slug: user.username,
        theme: user.theme,
        weekStart: user.weekStart,
        brandColor: user.brandColor,
        darkBrandColor: user.darkBrandColor,
      };

  return {
    props: {
      away: user.away,
      isDynamicGroup,
      profile,
      plan: user.plan,
      date: dateParam,
      eventType: eventTypeObject,
      workingHours,
      trpcState: ssr.dehydrate(),
      booking,
    },
  };
};*/

export const getStaticProps = async () => {
  return {
    props: {
      profile: {
        name: "Pro Example",
        username: "pro",
        hideBranding: false,
        plan: "PRO",
        timeZone: "Europe/London",
        image: "http://localhost:3000/pro/avatar.png",
      },
      away: false,
      eventTypeId: 1,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = ["/pro/30min"];

  return { paths, fallback: "blocking" };
};
