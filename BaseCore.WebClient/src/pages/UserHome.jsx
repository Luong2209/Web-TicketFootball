import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, DoorOpen, QrCode, Zap } from 'lucide-react';
import HeroSection from '../components/user/landing/HeroSection';
import UserLayout from '../components/user/UserLayout';
import { EmptyState, ErrorState, LoadingState } from '../components/user/StateViews';
import { matchApi, newsApi } from '../services/api';

const SEASON = '2026-2027';
const asset = (path) => `/template-football/${path}`;

const benefits = [
    {
        Icon: Zap,
        title: 'Đặt vé nhanh',
        description: 'Chọn trận, khu vé và số lượng chỉ trong vài bước rõ ràng.',
    },
    {
        Icon: CreditCard,
        title: 'Thanh toán tiện lợi',
        description: 'Theo dõi trạng thái đơn hàng và xác nhận thanh toán ngay trên hệ thống.',
    },
    {
        Icon: QrCode,
        title: 'Nhận QR e-ticket',
        description: 'Vé điện tử có mã QR sẵn sàng trong mục Vé của tôi.',
    },
    {
        Icon: DoorOpen,
        title: 'Check-in dễ dàng',
        description: 'Dùng mã QR để check-in nhanh tại cổng vào sân.',
    },
];

const sectionReveal = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

function UserHome() {
    const [matches, setMatches] = useState([]);
    const [news, setNews] = useState([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    const [matchError, setMatchError] = useState('');
    const [newsError, setNewsError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadMatches = async () => {
            setIsLoadingMatches(true);
            setMatchError('');

            try {
                const response = await matchApi.getAll();
                if (isMounted) {
                    setMatches(response.data || []);
                }
            } catch (error) {
                if (isMounted) {
                    setMatchError(error.response?.data?.message || 'Không tải được trận nổi bật từ backend.');
                    setMatches([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingMatches(false);
                }
            }
        };

        loadMatches();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadNews = async () => {
            setIsLoadingNews(true);
            setNewsError('');

            try {
                const response = await newsApi.getAll();
                if (isMounted) {
                    setNews(response.data || []);
                }
            } catch (error) {
                if (isMounted) {
                    setNewsError(error.response?.data?.message || 'Không tải được tin tức từ backend.');
                    setNews([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingNews(false);
                }
            }
        };

        loadNews();

        return () => {
            isMounted = false;
        };
    }, []);

    const featuredMatches = [...matches]
        .sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)))
        .slice(0, 3);
    const featuredMatch = featuredMatches[0] || null;
    const latestNews = news.slice(0, 3);

    return (
        <UserLayout fullBleed headerVariant="landing">
            <HeroSection featuredMatch={featuredMatch} loading={isLoadingMatches} />

            <section className="relative bg-white px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="mb-10 max-w-3xl"
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={sectionReveal}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-violet-600">Tổng quan</span>
                        <h2 className="mb-0 mt-3 text-4xl font-black leading-tight text-violet-950">Một trải nghiệm đặt vé có nhịp điệu như ngày ra sân.</h2>
                        <p className="mb-0 mt-4 text-lg leading-8 text-violet-950/65">
                            Premier League Tickets gom lịch đấu, ticket listing, thanh toán và vé điện tử vào một luồng gọn gàng cho người hâm mộ.
                        </p>
                    </motion.div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {benefits.map((benefit, index) => (
                            <motion.article
                                className="rounded-2xl border border-violet-950/10 bg-white p-6 shadow-sm shadow-violet-950/5 transition hover:-translate-y-1 hover:bg-violet-50 hover:shadow-xl hover:shadow-violet-950/10"
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.45, delay: index * 0.08 }}
                                key={benefit.title}
                            >
                                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-violet-950 text-white">
                                    <benefit.Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-black text-violet-950">{benefit.title}</h3>
                                <p className="mb-0 mt-2 text-sm leading-6 text-violet-950/60">{benefit.description}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-violet-50 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-violet-500">Trận nổi bật</span>
                            <h2 className="mb-0 mt-3 text-4xl font-black text-violet-950">Ba cửa vào đáng chú ý nhất.</h2>
                        </div>
                        <Link className="font-black text-violet-700 no-underline transition hover:text-violet-950" to="/matches">
                            Xem tất cả
                        </Link>
                    </div>

                    {matchError && <div className="mb-5"><ErrorState message={matchError} /></div>}
                    {isLoadingMatches ? (
                        <LoadingState title="Đang tải trận nổi bật..." />
                    ) : featuredMatches.length ? (
                        <div className="grid gap-5 md:grid-cols-3">
                            {featuredMatches.map((match, index) => (
                                <motion.article
                                    className="rounded-2xl border border-violet-950/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, delay: index * 0.08 }}
                                    key={match.slug || match.id}
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                                            {match.roundName || 'Vòng đấu chưa cập nhật'}
                                        </span>
                                        <span className="text-xs font-bold text-violet-950/50">{match.season || SEASON}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-violet-950">
                                        {match.homeTeam?.name || 'Home Team'} vs {match.awayTeam?.name || 'Away Team'}
                                    </h3>
                                    <p className="mb-0 mt-3 text-sm leading-6 text-violet-950/60">
                                        {match.stadium?.name || 'Sân vận động chưa cập nhật'}
                                    </p>
                                    <Link
                                        className="mt-5 inline-flex rounded-full bg-violet-950 px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-violet-800"
                                        to={match.slug ? `/tickets/${match.slug}` : '/matches'}
                                    >
                                        Đặt vé
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Chưa có trận đấu" message="Database hiện chưa có trận đấu để hiển thị." />
                    )}
                </div>
            </section>

            <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-violet-600">Tin tức</span>
                            <h2 className="mb-0 mt-3 text-4xl font-black text-violet-950">Những câu chuyện trước giờ bóng lăn.</h2>
                        </div>
                        <Link className="font-black text-violet-700 no-underline transition hover:text-violet-950" to="/news">
                            Tất cả tin
                        </Link>
                    </div>

                    {newsError && <div className="mb-5"><ErrorState message={newsError} /></div>}
                    {isLoadingNews ? (
                        <LoadingState title="Đang tải tin tức..." />
                    ) : latestNews.length ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {latestNews.map((post, index) => (
                                <motion.article
                                    className="overflow-hidden rounded-2xl border border-violet-950/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, delay: index * 0.08 }}
                                    key={post.slug || post.id || post.title}
                                >
                                    <img className="h-48 w-full object-cover" src={post.imageUrl || asset('images/news-2-1-368x287.jpg')} alt="" />
                                    <div className="p-5">
                                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-violet-950/50">
                                            <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">{post.category || 'Premier League'}</span>
                                            <span>Season {post.season || SEASON}</span>
                                        </div>
                                        <h3 className="text-lg font-black leading-snug text-violet-950">{post.title || 'Tin tức Premier League'}</h3>
                                        <p className="mb-0 mt-3 text-sm leading-6 text-violet-950/60">{post.summary || 'Chưa có mô tả.'}</p>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Chưa có tin tức" message="Tin tức sẽ được hiển thị khi backend trả dữ liệu." />
                    )}
                </div>
            </section>
        </UserLayout>
    );
}

export default UserHome;
