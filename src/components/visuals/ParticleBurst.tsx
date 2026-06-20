"use client";

import {AnimatePresence, motion} from "framer-motion";

type ParticleBurstProps = {
  burstKey: number;
  colors: [string, string, string];
};

const particles = Array.from({length: 16}, (_, index) => {
  const angle = (Math.PI * 2 * index) / 16;
  return {
    x: Math.cos(angle) * (92 + (index % 3) * 24),
    y: Math.sin(angle) * (92 + (index % 4) * 18),
  };
});

export function ParticleBurst({burstKey, colors}: ParticleBurstProps) {
  return (
    <AnimatePresence>
      {burstKey > 0 ? (
        <div
          key={burstKey}
          className="pointer-events-none fixed left-1/2 top-1/2 z-20"
          aria-hidden="true"
        >
          {particles.map((particle, index) => (
            <motion.span
              key={`${burstKey}-${index}`}
              className="absolute block size-3 rounded-full"
              style={{backgroundColor: colors[index % colors.length]}}
              initial={{x: 0, y: 0, scale: 0.2, opacity: 0.9}}
              animate={{x: particle.x, y: particle.y, scale: 0, opacity: 0}}
              exit={{opacity: 0}}
              transition={{duration: 0.75, ease: "easeOut"}}
            />
          ))}
        </div>
      ) : null}
    </AnimatePresence>
  );
}
