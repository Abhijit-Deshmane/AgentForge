import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot } from "@opentui/react";

function App() {
  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="flex-end">
        <textarea focused={true} placeholder="Hello world!" />
      </box>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
