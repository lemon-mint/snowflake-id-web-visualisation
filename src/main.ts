import "./style.css";

const serverlist = ["https://time.vlue.dev/time"];

let Offset = 0;
let Server = "<local>";

function GetTime(): number {
  return Math.round(Date.now() + Offset);
}

function PadZero(s: string, length: number): string {
  if (s.length >= length) return s;
  return "0".repeat(length - s.length) + s;
}

interface TimeServerResponse {
  t1: number;
  t2: number;
}

async function sync(server: string): Promise<number> {
  const t0 = Date.now();
  const response = await fetch(server);
  const t3 = Date.now();
  const data = await response.json();

  // Validate Response
  if (typeof data.t1 !== "number" || typeof data.t2 !== "number") {
    throw new Error("Invalid Response");
  }

  const TSResponse = data as TimeServerResponse;
  const t1 = TSResponse.t1;
  const t2 = TSResponse.t2;
  const offset = (t1 - t0 + t2 - t3) / 2;

  return offset;
}

async function GetServerOffset(server?: string): Promise<[number, string]> {
  if (server) {
    try {
      const offset = await sync(server);
      return [offset, server];
    } catch (err) {
      console.error(err);
    }
  }

  for (const server of serverlist) {
    try {
      const offset = await sync(server);
      return [offset, server];
    } catch (e) {
      console.error(e);
    }
  }

  return [0, "<local>"];
}

const snowflake_h2 = document.getElementById("snfid") as HTMLElement;
const nodeid = Math.round(Math.random() * (1 << 12)) % (1 << 12);
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

let last = GetTime();
let ctr = 0;
let snowflake: bigint;

const AnimationFrameFunc: FrameRequestCallback = () => {
  let now = GetTime() + Math.round((Math.random() - 0.5) * 200);
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
  text += "NodeID: 0x" + PadZero(nodeid.toString(16).toUpperCase(), 3) + "\n";
  text += "Sequence: " + ctr.toString() + "\n";
  text += "Snowflake ID: " + snowflake.toString() + "\n";
  snowflake_h2.innerText = text;

  // Set Window Title
  document.title = `Snowflake ID: ${snowflake}`;

  requestAnimationFrame(AnimationFrameFunc);
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  snowflake_h2.innerText = "Synchronizing...";
  await GetServerOffset(); // Establish a Connection

  const [offset, server] = await GetServerOffset();
  Offset = offset;
  Server = server;
  console.log("Time Server: " + Server);
  console.log("Offset: " + Offset + "ms");

  await sleep(300); // Max Allowed Error of 300ms

  // Refresh Last Time
  last = GetTime();

  requestAnimationFrame(AnimationFrameFunc);
  // Register Copy Button
  copy_btn.addEventListener("click", () => {
    copy(snowflake.toString());
  });
}

main();
