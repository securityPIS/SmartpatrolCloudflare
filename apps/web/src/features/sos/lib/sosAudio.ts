/**
 * Short emergency beep played when an SOS is raised. Best-effort: browser
 * autoplay policies or a missing AudioContext are swallowed silently.
 */
export function playAlertBeep(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // Autoplay policy or AudioContext unavailable — silently ignore.
  }
}
