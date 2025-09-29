const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function playBeep(frequency = 300, duration = 50, type = 'sine') {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
}