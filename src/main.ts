import './style.css';

const snowflake_h2 = document.getElementById('snfid') as HTMLElement;
const nodeid = Math.round(Math.random() * (1 << 10)) % (1 << 10);

let last = Date.now();
let ctr = 0;

const AnimationFrameFunc: FrameRequestCallback = () => {
  let now = Date.now() + Math.round((Math.random() - 0.5) * 200);
  if (now > last) {
    ctr = 0;
    last = now;
  } else {
    now = last;
    ctr++;
  }
  let snowflake: bigint =
    (BigInt(now) & ((BigInt(1) << BigInt(41)) - BigInt(1))) << BigInt(22);
  snowflake |= BigInt(nodeid & ((1 << 12) - 1)) << BigInt(12);
  snowflake |= BigInt(ctr & ((1 << 10) - 1));
  snowflake_h2.innerText = `
  UnixMilli: ${now}
  NodeID: 0x${nodeid.toString(16).toUpperCase()}
  Sequence: ${ctr}
  Snowflake ID: ${snowflake}`;
  requestAnimationFrame(AnimationFrameFunc);
};

requestAnimationFrame(AnimationFrameFunc);
