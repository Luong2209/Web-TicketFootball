import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../services/api';

const NEWS_PER_PAGE = 6;

const News = () => {
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
                    setNews(response.data);
                }
            } catch (requestError) {
                if (isMounted) {
                    setError(requestError.response?.data?.message || 'Khong tai duoc tin tuc tu backend.');
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
        <main className="min-h-screen bg-slate-100">
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-plum-950">Premier League</span>
                        <h1 className="mb-0 mt-2 text-3xl font-black text-slate-950">Tin tuc moi nhat</h1>
                    </div>
                    <Link className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 no-underline hover:bg-slate-50" to="/user">
                        Ve trang chu
                    </Link>
                </div>

                {error && <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700">{error}</div>}
                {isLoading ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Dang tai tin tuc...</div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {visibleNews.map((post) => (
                            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={post.slug}>
                                <img className="h-52 w-full object-cover" src={post.imageUrl} alt="" />
                                <div className="p-5">
                                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{post.category}</span>
                                        <span>Season {post.season}</span>
                                    </div>
                                    <h2 className="mb-3 text-lg font-black leading-snug text-slate-950">{post.title}</h2>
                                    <p className="mb-4 text-sm leading-6 text-slate-600">{post.summary}</p>
                                    <a className="text-sm font-black text-plum-950 no-underline hover:text-slate-950" href="#news">Read more</a>
                                </div>
                            </article>
                        ))}
                        {!visibleNews.length && <div className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500">Chua co tin tuc trong database.</div>}
                    </div>
                )}

                {pageCount > 1 && (
                    <nav className="mt-8 flex justify-center gap-2" aria-label="News pages">
                        <button className="rounded border border-slate-300 bg-white px-3 py-2 font-bold disabled:opacity-40" type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Truoc</button>
                        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                            <button className={`rounded px-3 py-2 font-bold ${page === currentPage ? 'bg-plum-950 text-white' : 'border border-slate-300 bg-white text-slate-700'}`} type="button" onClick={() => setCurrentPage(page)} key={page}>{page}</button>
                        ))}
                        <button className="rounded border border-slate-300 bg-white px-3 py-2 font-bold disabled:opacity-40" type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount}>Sau</button>
                    </nav>
                )}
            </section>
        </main>
    );
};

export default News;
