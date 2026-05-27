import React from 'react';
import { motion } from 'framer-motion';

export const softEase = [0.22, 1, 0.36, 1];

export const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

export const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
};

export const stagger = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.04,
        },
    },
};

export const pageTransition = {
    duration: 0.55,
    ease: softEase,
};

export const itemTransition = {
    duration: 0.45,
    ease: softEase,
};

export function PageFade({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
}

export function MotionState({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="show"
            variants={fadeIn}
            transition={{ duration: 0.4, ease: softEase }}
        >
            {children}
        </motion.div>
    );
}
