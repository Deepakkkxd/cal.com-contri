import { doc } from "prettier";

import type { CalWindow } from "@calcom/embed-snippet";

import css from "./embed.css";
import { SdkEventManager } from "./sdk-event-manager";

const globalCal = (window as CalWindow).Cal;
document.head.appendChild(document.createElement("style")).innerHTML = css;
// FIXME: See how we want to manage the UI. If the UI is not complex we can go for Web Components - We get the automatic benefit of Style Encapsulation
class ModalBox extends HTMLElement {
  element: HTMLElement;

  connectedCallback() {
    this.shadowRoot.querySelector(".close").onclick = () => {
      this.shadowRoot.host.remove();
    };
  }

  constructor() {
    super();
    const modalHtml = `
      <style>
      .backdrop {
        position:fixed;
        width:100%;
        height:100%;
        top:0;
        left:0;
        z-index:99999999;
        display:block;
        background-color:rgb(5,5,5, 0.8)
      }
      @media only screen and (min-width:600px) {
        .modal-box {
          margin:0 auto; 
          margin-top:20px; 
          margin-bottom:20px;
          position:absolute;
          width:50%;
          height: 80%;
          top:50%;
          left:50%;
          transform: translateY(-50%) translateX(-50%);
          overflow: scroll;
        }
      }

      @media only screen and (max-width:600px) {
        .modal-box {
          width: 100%;
          height: 80%;
          position:fixed;
          top:50px;
          left:0;
          right: 0;
          margin: 0;
        }
      }

      .header {
        position: relative;
        float:right;
        top: 10px;
      }
      .close {
        font-size: 30px;
        left: -20px;
        position: relative;
        color:white;
        cursor: pointer;
      }
      </style>
      <div class="backdrop">
      <div class="header">
            <span class="close">&times;</span>
        </div>
        <div class="modal-box">
          <div class="body">
              <slot></slot>
          </div>
        </div>
      </div>
    `;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = modalHtml;
  }
}

customElements.define("cal-modal-box", ModalBox);

function log(...args) {
  console.log(...args);
}

export class Cal {
  iframe?: HTMLIFrameElement;

  __config: any;

  namespace: string;

  actionManager: SdkEventManager;

  iframeReady: boolean;

  iframeDoQueue: { method: (arg: any) => any; arg: any }[] = [];

  static actionsManagers: SdkEventManager[];
  static getQueryObject(config) {
    config = config || {};
    return {
      ...config,
      // guests is better for API but Booking Page accepts guest. So do the mapping
      // FIXME: Currently multiple guests are expected using guest=1&guest=b approach which is not possible with an object approach
      guest: config.guests,
    };
  }

  processInstruction(instruction) {
    instruction = [].slice.call(instruction, 0);
    const isBulkInstruction = instruction[0] instanceof Array;
    if (isBulkInstruction) {
      // It is an instruction
      instruction.forEach((instruction) => {
        this.processInstruction(instruction);
      });
      return;
    }
    const [method, argument] = instruction;
    if (!this[method]) {
      // Instead of throwing error, log and move forward in the queue
      log(`Instruction ${method} not found`);
    }
    try {
      this[method](argument);
    } catch (e) {
      // Instead of throwing error, log and move forward in the queue
      log(`Instruction couldn't be executed`, e);
    }
  }

  processQueue(queue) {
    queue.forEach((instruction) => {
      this.processInstruction(instruction);
    });

    queue.splice(0);

    queue.push = (instruction) => {
      this.processInstruction(instruction);
    };
  }

  createIframe({
    calendarLink,
    queryObject,
  }: {
    calendarLink: string;
    queryObject?: Record<string, string>;
  }) {
    const iframe = (this.iframe = document.createElement("iframe"));
    // FIXME: scrolling seems deprecated, though it works on Chrome. What's the recommended way to do it?
    iframe.scrolling = "no";
    iframe.className = "cal-embed";
    const config = this.getConfig();
    const searchParams = new URLSearchParams(queryObject);
    const urlInstance = new URL(`${config.origin}/${calendarLink}`);
    urlInstance.searchParams.set("embed", this.namespace);
    for (let [key, value] of searchParams) {
      urlInstance.searchParams.set(key, value);
    }
    iframe.src = urlInstance.toString();
    return iframe;
  }

  configure({ origin }) {
    this.__config.origin = origin;
  }

  getConfig() {
    return this.__config;
  }

  inline({ calendarLink, elementOrSelector, config }) {
    const iframe = this.createIframe({ calendarLink, queryObject: Cal.getQueryObject(config) });
    iframe.style.height = "100%";
    iframe.style.width = "100%";
    let element =
      elementOrSelector instanceof HTMLElement
        ? elementOrSelector
        : document.querySelector(elementOrSelector);
    if (!element) {
      throw new Error("Element not found");
    }
    element.appendChild(iframe);
  }

  modal({ calendarLink }) {
    const iframe = this.createIframe({ calendarLink });
    iframe.style.height = "100%";
    iframe.style.width = "100%";
    const template = document.createElement("template");
    template.innerHTML = `<cal-modal-box></cal-modal-box>`;
    template.content.children[0].appendChild(iframe);
    document.body.appendChild(template.content);
  }

  on({ action, callback }) {
    this.actionManager.on(action, callback);
  }

  //FIXME: Support only path and not fullUrl
  preload({ fullCalendarLink }) {
    const iframe = document.body.appendChild(document.createElement("iframe"));
    const urlInstance = new URL(fullCalendarLink);
    urlInstance.searchParams.set("prerender", "true");
    iframe.src = urlInstance.toString();
    iframe.style.width = 0;
    iframe.style.height = 0;
    iframe.style.display = "none";
  }

  ui(cssConfig) {
    if (!cssConfig) {
      throw new Error("css is required");
    }
    this.doInIframe({ method: "ui", arg: cssConfig });
  }

  doInIframe({ method, arg }) {
    if (!this.iframeReady) {
      this.iframeDoQueue.push({ method, arg });
      return;
    }
    // TODO: Ensure that origin is as defined by user. Generally it would be cal.com but in case of self hosting it can be anything.
    this.iframe.contentWindow.postMessage({ originator: "CAL", method, arg }, "*");
  }

  constructor(namespace, q) {
    this.__config = {
      origin: "http://localhost:3000",
    };

    this.namespace = namespace;
    this.actionManager = new SdkEventManager(namespace);
    Cal.actionManagers = Cal.actionManagers || {};
    Cal.actionManagers[namespace] = this.actionManager;
    this.processQueue(q);
    function setAppropriateHeight({ iframe, proposedHeightByIframeWebsite }) {
      iframe.style.height = proposedHeightByIframeWebsite;
    }
    // 1. Initial iframe width and height would be according to 100% value of the parent element
    // 2. Once webpage inside iframe renders, it would tell how much iframe height should be increased so that my entire content is visible without iframe scroll
    // 3. Parent window would check what iframe height can be set according to parent Element
    this.actionManager.on("dimension-changed", (e) => {
      const { data } = e.detail;
      const iframe = this.iframe;
      if (!iframe) {
        // Iframe might be pre-rendering
        return;
      }
      let proposedHeightByIframeWebsite =
        parseFloat(getComputedStyle(this.iframe).height) + data.hiddenHeight;
      setAppropriateHeight({ iframe, proposedHeightByIframeWebsite });
    });

    this.actionManager.on("iframeReady", (e) => {
      this.iframeReady = true;
      this.doInIframe({ method: "parentKnowsIframeReady", arg: {} });
      this.iframeDoQueue.forEach(({ method, arg }) => {
        this.doInIframe({ method, arg });
      });
    });
  }
}

globalCal.instance = new Cal("", globalCal.q);

for (let [ns, api] of Object.entries(globalCal.ns)) {
  api.instance = new Cal(ns, api.q);
}

/**
 * Intercepts all postmessages and fires action in corresponding actionManager
 */
window.addEventListener("message", (e) => {
  const detail = e.data;
  const fullType = detail.fullType;
  const parsedAction = SdkEventManager.parseAction(fullType);
  if (!parsedAction) {
    return;
  }
  const actionManager = Cal.actionManagers[parsedAction.ns];
  if (!actionManager) {
    throw new Error("Unhandled Action", parsedAction);
  }
  actionManager.fire(parsedAction.type, detail.data);
});

document.addEventListener("click", (e) => {
  const path = e.target.dataset.calLink;
  if (!path) {
    return;
  }
  // TODO: Add an option to check which cal instance should be used for this.
  globalCal("modal", {
    calendarLink: path,
  });
});
