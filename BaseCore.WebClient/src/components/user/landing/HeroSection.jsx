import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductShowcase from './ProductShowcase';

const fadeUp = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0 },
};

function HeroSection({ featuredMatch, loading }) {
    return (
        <section className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-white text-violet-950">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(76,29,149,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(76,29,149,0.06)_1px,transparent_1px)] bg-[size:80px_80px]" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-violet-50 via-violet-50/60 to-transparent" />
            <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full border border-dashed border-violet-300/50" />
            <div className="absolute left-[8%] top-[18%] h-1 w-12 bg-violet-700" />

            <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.72fr)] lg:px-8">
                <motion.div
                    className="max-w-4xl"
                    initial="hidden"
                    animate="show"
                    transition={{ staggerChildren: 0.12 }}
                >
                    <motion.div className="mb-10 flex items-center gap-5" variants={fadeUp} transition={{ duration: 0.6 }}>
                        <span className="h-px w-14 bg-violet-700" />
                        <span className="text-xs font-semibold uppercase tracking-[0.38em] text-violet-950/60">EST. 2026 · Premier League</span>
                    </motion.div>

                    <motion.div
                        className="mb-10 inline-flex items-center gap-3 rounded-full border border-violet-700/15 bg-violet-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-violet-800"
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="h-2.5 w-2.5 rounded-full bg-violet-700" />
                        Chương 01 · Săn vé trận lớn
                    </motion.div>

                    <motion.h1
                        className="max-w-4xl text-6xl font-black leading-[0.9] tracking-tight text-violet-950 sm:text-7xl lg:text-8xl"
                        variants={fadeUp}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Mở cửa
                        <span className="block font-serif italic font-normal text-violet-500">tới sân cỏ</span>
                        nước Anh<span className="text-violet-600">.</span>
                    </motion.h1>

                    <motion.p
                        className="mt-10 max-w-2xl border-l-2 border-violet-700/40 pl-6 text-lg leading-8 text-violet-950/65"
                        variants={fadeUp}
                        transition={{ duration: 0.65 }}
                    >
                        Chọn trận Premier League, đặt vé, thanh toán và nhận QR e-ticket trong một trải nghiệm gọn, sang và dễ theo dõi.
                    </motion.p>

                    <motion.div className="mt-9 flex flex-wrap gap-3" variants={fadeUp} transition={{ duration: 0.6 }}>
                        <Link
                            className="rounded-full bg-violet-950 px-7 py-4 text-sm font-black text-white no-underline shadow-xl shadow-violet-950/20 transition hover:-translate-y-0.5 hover:bg-violet-800"
                            to="/matches"
                        >
                            Xem trận đấu
                        </Link>
                        <Link
                            className="rounded-full border border-violet-950/15 bg-white px-7 py-4 text-sm font-black text-violet-950 no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
                            to="/my-tickets"
                        >
                            Vé của tôi
                        </Link>
                    </motion.div>
                </motion.div>

                <ProductShowcase match={featuredMatch} loading={loading} />
            </div>
        </section>
    );
}

export default HeroSection;
