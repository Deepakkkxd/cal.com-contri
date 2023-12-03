import { useAvatar } from "@avatechai/avatars/react";
import { ThreeJSPlugin } from "@avatechai/avatars/threejs";
import { useChat } from "ai/react";

import useMeQuery from "@lib/hooks/useMeQuery";

// type AvatarAssistantProps = {};

export const AvatarAssistant = (props: { username: string | null; userEventTypes: any[] }) => {
  const user = useMeQuery().data;

  const { avatarDisplay } = useAvatar({
    avatarId: "456a5395-c1c5-4f67-a4e2-b56235b97638",
    // Loader + Plugins
    avatarLoaders: [ThreeJSPlugin],
    scale: -0.6,
    className: "!w-[400px] !h-[400px]",
  });

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/avatar-assistant/chat",
    body: {
      ...props,
      userId: user?.id,
      userTime: new Date().toISOString(),
    },
  });

  return (
    <div>
      {avatarDisplay}
      <div>
        <ul>
          {messages.map((m, index) => (
            <li key={index}>
              {m.role === "user" ? "User: " : "AI: "}
              {m.content}
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmit}>
          <label>
            Say something...
            <input value={input} onChange={handleInputChange} />
          </label>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};
