import "./style.css";

const snowflake_h2 = document.getElementById("snfid") as HTMLElement;
const nodeid = Math.round(Math.random() * (1 << 10)) % (1 << 10);
const copy_btn = document.getElementById("copy-btn") as HTMLButtonElement;

async function copy(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  // ExecCommand Fallback
  if (typeof document.execCommand === "function") {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  }

  // Prompt Fallback
  if (typeof window.prompt === "function") {
    prompt("Copy to clipboard: Ctrl+C, Enter", text);
  }

  return false;
}

let last = Date.now();
let ctr = 0;
let snowflake: bigint;

const AnimationFrameFunc: FrameRequestCallback = () => {
  let now = Date.now() + Math.round((Math.random() - 0.5) * 200);
  if (now > last) {
    ctr = 0;
    last = now;
  } else {
    now = last;
    ctr++;
  }
  snowflake = BigInt(now) & ((BigInt(1) << BigInt(41)) - BigInt(1)); // 41 bits for timestamp
  snowflake = snowflake << BigInt(22); // shift 22 bits
  snowflake |= BigInt(nodeid & ((1 << 12) - 1)) << BigInt(12); // 12 bits for node id
  snowflake |= BigInt(ctr & ((1 << 10) - 1)); // 10 bits for counter
  let text = "UnixMilli: " + now + "\n";
  text += "NodeID: 0x" + nodeid.toString(16).toUpperCase() + "\n";
  text += "Sequence: " + ctr.toString() + "\n";
  text += "Snowflake ID: " + snowflake.toString() + "\n";
  snowflake_h2.innerText = text;

  // Set Window Title
  document.title = `Snowflake ID: ${snowflake}`;

  requestAnimationFrame(AnimationFrameFunc);
};

requestAnimationFrame(AnimationFrameFunc);

// Register Copy Button
copy_btn.addEventListener("click", () => {
  copy(snowflake.toString());
});
