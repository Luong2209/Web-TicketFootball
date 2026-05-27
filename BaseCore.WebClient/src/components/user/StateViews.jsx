import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, itemTransition } from './UserMotion';

export const LoadingState = ({ title = 'Đang tải dữ liệu...', description = 'Vui lòng chờ trong giây lát.' }) => (
    <motion.div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" initial="hidden" animate="show" variants={fadeIn} transition={itemTransition}>
        <div className="flex items-center gap-4">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-violet-700" />
            <div>
                <p className="mb-1 font-bold text-slate-900">{title}</p>
                <p className="mb-0 text-sm text-slate-500">{description}</p>
            </div>
        </div>
        <div className="mt-6 grid gap-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        </div>
    </motion.div>
);

export const ErrorState = ({ title = 'Có lỗi xảy ra', message }) => (
    <motion.div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm" initial="hidden" animate="show" variants={fadeIn} transition={itemTransition}>
        <p className="mb-1 font-black">{title}</p>
        <p className="mb-0 text-sm">{message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.'}</p>
    </motion.div>
);

export const EmptyState = ({
    title = 'Chưa có dữ liệu',
    message = 'Dữ liệu sẽ hiển thị tại đây khi có sẵn.',
    actionLabel,
    actionTo = '/user',
}) => (
    <motion.div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm" initial="hidden" animate="show" variants={fadeIn} transition={itemTransition}>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-2xl text-violet-700">
            <Ticket className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{message}</p>
        {actionLabel && (
            <Link
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-black text-white no-underline transition-all duration-300 hover:bg-violet-600 hover:shadow-lg"
                to={actionTo}
            >
                {actionLabel}
            </Link>
        )}
    </motion.div>
);

export const StatusBadge = ({ status }) => {
    const normalized = String(status || 'Pending').toLowerCase();
    const styles = {
        paid: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
        issued: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
        success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
        used: 'bg-slate-200 text-slate-700 ring-slate-300',
        cancelled: 'bg-rose-100 text-rose-700 ring-rose-200',
        canceled: 'bg-rose-100 text-rose-700 ring-rose-200',
        failed: 'bg-rose-100 text-rose-700 ring-rose-200',
        pending: 'bg-amber-100 text-amber-700 ring-amber-200',
        scheduled: 'bg-cyan-100 text-cyan-700 ring-cyan-200',
        completed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 transition-all duration-300 ${styles[normalized] || 'bg-violet-100 text-violet-700 ring-violet-200'}`}>
            {status || 'Pending'}
        </span>
    );
};
