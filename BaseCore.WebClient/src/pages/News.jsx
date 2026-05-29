import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import UserLayout from '../components/user/UserLayout';
import { EmptyState, ErrorState, LoadingState } from '../components/user/StateViews';
import { PageFade, fadeUp, itemTransition, pageTransition, stagger } from '../components/user/UserMotion';
import { newsApi } from '../services/api';

const NEWS_PER_PAGE = 6;
const asset = (path) => `/template-football/${path}`;
const revealUp = fadeUp;

function News() {
    const [currentPage, setCurrentPage] = useState(1);
    const [news, setNews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const pageCount = Math.max(1, Math.ceil(news.length / NEWS_PER_PAGE));

    useEffect(() => {
        let isMounted = true;

        const loadNews = async () => {
            setIsLoading(true);
            setError('');

            try {
                const response = await newsApi.getAll();
                if (isMounted) {
                    setNews(response.data || []);
                }
            } catch (requestError) {
                if (isMounted) {
                    setError(requestError.response?.data?.message || 'Không tải được tin tức từ backend.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadNews();

        return () => {
            isMounted = false;
        };
    }, []);

    const visibleNews = useMemo(() => {
        const start = (currentPage - 1) * NEWS_PER_PAGE;
        return news.slice(start, start + NEWS_PER_PAGE);
    }, [currentPage, news]);

    return (
        <UserLayout>
            <PageFade>
            <motion.div
                className="mb-8 rounded-3xl bg-slate-950 p-8 text-white shadow-lg"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={revealUp}
                transition={pageTransition}
            >
                <span className="text-sm font-black uppercase text-cyan-200">Premier League</span>
                <h1 className="mb-0 mt-3 text-4xl font-black">Tin tức mới nhất</h1>
                <p className="mb-0 mt-3 max-w-2xl text-slate-300">
                    Cập nhật nội dung mùa giải, lịch đấu và các câu chuyện nổi bật xung quanh Premier League.
                </p>
            </motion.div>

            {error && <ErrorState message={error} />}

            {isLoading ? (
                <LoadingState title="Đang tải tin tức..." />
            ) : visibleNews.length ? (
                <>
                    <motion.div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" initial="hidden" animate="show" variants={stagger}>
                        {visibleNews.map((post, index) => (
                            <motion.article
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                variants={fadeUp}
                                viewport={{ once: true, margin: '-70px' }}
                                transition={{ ...itemTransition, delay: index * 0.04 }}
                                key={post.slug || post.title}
                            >
                                <img className="h-56 w-full object-cover" src={post.imageUrl || asset('images/news-2-1-368x287.jpg')} alt="" />
                                <div className="p-6">
                                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-slate-500">
                                        <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">{post.category || 'Premier League'}</span>
                                        <span>Season {post.season || '2026-2027'}</span>
                                    </div>
                                    <h2 className="mb-3 text-xl font-black leading-snug text-slate-950">{post.title}</h2>
                                    <p className="mb-5 text-sm leading-6 text-slate-600">{post.summary}</p>
                                    <a className="font-black text-violet-700 no-underline transition hover:text-violet-600" href="#news">
                                        Read more
                                    </a>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>

                    {pageCount > 1 && (
                        <motion.nav
                            className="mt-8 flex justify-center gap-2"
                            aria-label="News pages"
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={revealUp}
                            transition={itemTransition}
                        >
                            <button
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </button>
                            {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                                <button
                                    className={`rounded-xl px-4 py-2 font-bold transition ${page === currentPage ? 'bg-violet-700 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    key={page}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                                disabled={currentPage === pageCount}
                            >
                                Sau
                            </button>
                        </motion.nav>
                    )}
                </>
            ) : (
                <EmptyState title="Chưa có tin tức" message="Tin tức sẽ được hiển thị khi backend trả dữ liệu." />
            )}
            </PageFade>
        </UserLayout>
    );
}

export default News;
