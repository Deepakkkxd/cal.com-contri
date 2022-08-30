import {
  Workflow,
  WorkflowActions,
  WorkflowsOnEventTypes,
  WorkflowStep,
  WorkflowTriggerEvents,
} from "@prisma/client";

import type { CalendarEvent } from "@calcom/types/Calendar";

import { scheduleEmailReminder } from "./emailReminderManager";
import { scheduleSMSReminder } from "./smsReminderManager";

export const scheduleWorkflowReminders = async (
  workflows: (WorkflowsOnEventTypes & {
    workflow: Workflow & {
      steps: WorkflowStep[];
    };
  })[],
  smsReminderNumber: string | null,
  evt: CalendarEvent,
  needsConfirmation: boolean
) => {
  if (workflows.length > 0 && !needsConfirmation) {
    workflows.forEach((workflowReference) => {
      if (workflowReference.workflow.steps.length === 0) return;

      const workflow = workflowReference.workflow;
      if (
        workflow.trigger === WorkflowTriggerEvents.BEFORE_EVENT ||
        workflow.trigger === WorkflowTriggerEvents.NEW_EVENT ||
        workflow.trigger === WorkflowTriggerEvents.RESCHEDULE_EVENT
      ) {
        workflow.steps.forEach(async (step) => {
          if (step.action === WorkflowActions.SMS_ATTENDEE || step.action === WorkflowActions.SMS_NUMBER) {
            const sendTo = step.action === WorkflowActions.SMS_ATTENDEE ? smsReminderNumber : step.sendTo;
            await scheduleSMSReminder(
              evt,
              sendTo,
              workflow.trigger,
              step.action,
              {
                time: workflow.time,
                timeUnit: workflow.timeUnit,
              },
              step.reminderBody || "",
              step.id,
              step.template
            );
          } else if (
            step.action === WorkflowActions.EMAIL_ATTENDEE ||
            step.action === WorkflowActions.EMAIL_HOST
          ) {
            const sendTo =
              step.action === WorkflowActions.EMAIL_HOST ? evt.organizer.email : evt.attendees[0].email;
            scheduleEmailReminder(
              evt,
              workflow.trigger,
              step.action,
              {
                time: workflow.time,
                timeUnit: workflow.timeUnit,
              },
              sendTo,
              step.emailSubject || "",
              step.reminderBody || "",
              step.id,
              step.template
            );
          }
        });
      }
    });
  }
};

export const sendCancelledReminders = async (
  workflows: (WorkflowsOnEventTypes & {
    workflow: Workflow & {
      steps: WorkflowStep[];
    };
  })[],
  smsReminderNumber: string | null,
  evt: CalendarEvent
) => {
  if (workflows.length > 0) {
    workflows
      .filter((workflowRef) => workflowRef.workflow.trigger === WorkflowTriggerEvents.EVENT_CANCELLED)
      .forEach((workflowRef) => {
        const workflow = workflowRef.workflow;
        workflow.steps.forEach(async (step) => {
          if (step.action === WorkflowActions.SMS_ATTENDEE || step.action === WorkflowActions.SMS_NUMBER) {
            const sendTo = step.action === WorkflowActions.SMS_ATTENDEE ? smsReminderNumber : step.sendTo;
            await scheduleSMSReminder(
              evt,
              sendTo,
              workflow.trigger,
              step.action,
              {
                time: workflow.time,
                timeUnit: workflow.timeUnit,
              },
              step.reminderBody || "",
              step.id,
              step.template
            );
          } else if (
            step.action === WorkflowActions.EMAIL_ATTENDEE ||
            step.action === WorkflowActions.EMAIL_HOST
          ) {
            const sendTo =
              step.action === WorkflowActions.EMAIL_HOST ? evt.organizer.email : evt.attendees[0].email;
            scheduleEmailReminder(
              evt,
              workflow.trigger,
              step.action,
              {
                time: workflow.time,
                timeUnit: workflow.timeUnit,
              },
              sendTo,
              step.emailSubject || "",
              step.reminderBody || "",
              step.id,
              step.template
            );
          }
        });
      });
  }
};
