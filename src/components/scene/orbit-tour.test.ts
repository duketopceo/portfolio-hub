import { describe, expect, it } from "vitest";
import {
  swipeDirection,
  tourReducer,
  tourShouldAdvance,
} from "./orbit-tour";

describe("tourReducer", () => {
  it("stops on interaction and only Play resumes", () => {
    expect(tourReducer("running", "interact")).toBe("stopped");
    expect(tourReducer("stopped", "interact")).toBe("stopped");
    expect(tourReducer("stopped", "play")).toBe("running");
  });

  it("keeps a user pause through further interaction", () => {
    expect(tourReducer("running", "pause")).toBe("paused");
    expect(tourReducer("paused", "interact")).toBe("paused");
    expect(tourReducer("paused", "play")).toBe("running");
  });
});

describe("tourShouldAdvance", () => {
  const open = { state: "running", inView: true, engaged: false, motionOk: true } as const;

  it("advances only when every gate is open", () => {
    expect(tourShouldAdvance(open)).toBe(true);
    expect(tourShouldAdvance({ ...open, state: "paused" })).toBe(false);
    expect(tourShouldAdvance({ ...open, state: "stopped" })).toBe(false);
    expect(tourShouldAdvance({ ...open, inView: false })).toBe(false);
    expect(tourShouldAdvance({ ...open, engaged: true })).toBe(false);
  });

  it("never advances under reduced motion", () => {
    expect(tourShouldAdvance({ ...open, motionOk: false })).toBe(false);
  });
});

describe("swipeDirection", () => {
  it("maps a long horizontal swipe to next or previous", () => {
    expect(swipeDirection(-60, 4)).toBe(1);
    expect(swipeDirection(60, 4)).toBe(-1);
  });

  it("ignores short or mostly vertical gestures", () => {
    expect(swipeDirection(20, 0)).toBe(0);
    expect(swipeDirection(-60, 90)).toBe(0);
  });
});
