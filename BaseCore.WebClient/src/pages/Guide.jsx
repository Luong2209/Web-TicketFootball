import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Armchair, ArrowRight, CalendarCheck, CreditCard, QrCode } from 'lucide-react';
import UserLayout from '../components/user/UserLayout';
import { PageFade, fadeUp, itemTransition, pageTransition, stagger } from '../components/user/UserMotion';

const steps = [
    {
        Icon: CalendarCheck,
        title: 'Chọn trận đấu',
        description: 'Mở danh sách trận, lọc theo vòng đấu và chọn trận Premier League bạn muốn tham dự.',
    },
    {
        Icon: Armchair,
        title: 'Chọn khu vé/số lượng',
        description: 'Xem ticket listing theo khu ghế, giá vé, số lượng còn lại và chọn số vé phù hợp.',
    },
    {
        Icon: CreditCard,
        title: 'Thanh toán',
        description: 'Tạo đơn hàng, kiểm tra tổng tiền và xác nhận thanh toán trên hệ thống.',
    },
    {
        Icon: QrCode,
        title: 'Nhận QR và check-in',
        description: 'Sau khi thanh toán thành công, vé điện tử kèm QR sẽ xuất hiện trong mục Vé của tôi.',
    },
];
const revealUp = fadeUp;

function Guide() {
    return (
        <UserLayout>
            <PageFade>
            <motion.section
                className="mb-8 rounded-2xl bg-slate-950 p-8 text-white shadow-lg"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={revealUp}
                transition={pageTransition}
            >
                <span className="text-sm font-black uppercase text-cyan-200">Hướng dẫn</span>
                <h1 className="mb-0 mt-3 text-4xl font-black">Đặt vé trong 4 bước</h1>
                <p className="mb-0 mt-3 max-w-2xl text-slate-300">
                    Từ chọn trận đến check-in tại sân, mọi thao tác được gom trong một luồng dễ theo dõi.
                </p>
            </motion.section>

            <motion.section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" initial="hidden" animate="show" variants={stagger}>
                {steps.map((step, index) => (
                    <motion.article
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-70px' }}
                        transition={{ ...itemTransition, delay: index * 0.04 }}
                        key={step.title}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-700 text-white">
                                <step.Icon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <span className="text-sm font-black text-slate-300">0{index + 1}</span>
                        </div>
                        <h2 className="text-lg font-black text-slate-950">{step.title}</h2>
                        <p className="mb-0 mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
                    </motion.article>
                ))}
            </motion.section>

            <motion.div
                className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={revealUp}
                transition={itemTransition}
            >
                <h2 className="mb-2 text-2xl font-black text-slate-950">Sẵn sàng chọn trận?</h2>
                <p className="mx-auto mb-5 max-w-xl text-sm text-slate-500">
                    Xem lịch đấu theo vòng và bắt đầu đặt vé cho trận bạn quan tâm.
                </p>
                <Link
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-black text-white no-underline shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-400"
                    to="/matches"
                >
                    Xem trận đấu
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
            </motion.div>
            </PageFade>
        </UserLayout>
    );
}

export default Guide;
