import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { matchApi, newsApi } from '../services/api';

const asset = (path) => `/template-football/${path}`;

const formatKickoff = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const collectTeams = (matches) => {
    const teams = new Map();

    matches.forEach((match) => {
        [match.homeTeam, match.awayTeam].forEach((team) => {
            if (!team || teams.has(team.id)) return;
            teams.set(team.id, team);
        });
    });

    return [...teams.values()];
};

const UserHome = () => {
    const navigate = useNavigate();
    const { logout, user, role } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [matches, setMatches] = useState([]);
    const [news, setNews] = useState([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);
    const [matchError, setMatchError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadMatches = async () => {
            setIsLoadingMatches(true);
            setMatchError('');

            try {
                const response = await matchApi.getAll({ featuredOnly: true });
                if (isMounted) {
                    setMatches(response.data);
                }
            } catch (error) {
                if (isMounted) {
                    setMatchError(error.response?.data?.message || 'Khong tai duoc lich tran tu backend.');
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
            try {
                const response = await newsApi.getAll({ featuredOnly: true });
                if (isMounted) {
                    setNews(response.data);
                }
            } catch {
                if (isMounted) {
                    setNews([]);
                }
            }
        };

        loadNews();

        return () => {
            isMounted = false;
        };
    }, []);

    const teams = useMemo(() => collectTeams(matches), [matches]);

    const username = useMemo(
        () => user?.username || user?.userName || user?.name || localStorage.getItem('username') || 'User',
        [user],
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <main className="min-h-screen bg-slate-100 text-slate-900">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950 text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <Link className="flex items-center gap-3 text-white no-underline" to="/user">
                        <img className="h-11 w-11 object-contain" src={asset('images/epl-logo.png')} alt="Premier League" />
                        <span className="text-lg font-black">Premier League Tickets</span>
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm font-bold lg:flex">
                        <a className="text-slate-200 no-underline hover:text-white" href="#matches">Tran dau</a>
                        <a className="text-slate-200 no-underline hover:text-white" href="#news">Tin tuc</a>
                        <Link className="text-slate-200 no-underline hover:text-white" to="/my-tickets">Ve cua toi</Link>
                    </nav>
                    <div className="hidden items-center gap-3 lg:flex">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">{username} - {role}</span>
                        <button className="rounded bg-white px-3 py-2 text-sm font-black text-slate-950 hover:bg-slate-200" type="button" onClick={handleLogout}>Logout</button>
                    </div>
                    <button className="grid h-10 w-10 place-items-center rounded bg-white/10 lg:hidden" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
                        <i className="fas fa-bars" />
                    </button>
                </div>
                {menuOpen && (
                    <div className="space-y-2 border-t border-white/10 px-4 py-3 lg:hidden">
                        <a className="block text-white no-underline" href="#matches">Tran dau</a>
                        <a className="block text-white no-underline" href="#news">Tin tuc</a>
                        <Link className="block text-white no-underline" to="/my-tickets">Ve cua toi</Link>
                        <button className="mt-2 rounded bg-white px-3 py-2 text-sm font-black text-slate-950" type="button" onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </header>

            <section className="relative overflow-hidden bg-slate-950 text-white">
                <img className="absolute inset-0 h-full w-full object-cover opacity-45" src={asset('images/mario-klassen-70YxSTWa2Zw-unsplash.jpg')} alt="" />
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-pink-200">Dich vu dat ve</span>
                    <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">San ve tran cau lon trong mua Premier League</h1>
                    <p className="mt-5 max-w-2xl text-lg text-slate-200">Chon tran, xem khu vuc ghe va gui yeu cau dat ve trong mot trai nghiem gon, nhanh va ro rang.</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a className="rounded bg-white px-5 py-3 font-black text-slate-950 no-underline hover:bg-slate-200" href="#matches">Mua ve ngay</a>
                        <Link className="rounded border border-white/40 px-5 py-3 font-black text-white no-underline hover:bg-white/10" to="/news">Xem tin tuc</Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="mb-1 text-sm font-bold text-slate-500">Competition</p><strong className="text-xl">{matches[0]?.competition || 'Premier League'}</strong></div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="mb-1 text-sm font-bold text-slate-500">Matches</p><strong className="text-xl">{matches.length}</strong></div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="mb-1 text-sm font-bold text-slate-500">Teams</p><strong className="text-xl">{teams.length}</strong></div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                <div className="mb-5 flex items-end justify-between">
                    <div><span className="text-xs font-black uppercase tracking-wide text-plum-950">Teams</span><h2 className="mb-0 text-2xl font-black">Cau lac bo trong lich dau</h2></div>
                </div>
                {isLoadingMatches ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">Dang tai du lieu...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {teams.map((team) => (
                            <a className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-900 no-underline shadow-sm hover:shadow-md" href="#matches" key={team.id}>
                                <img className="h-14 w-14 object-contain" src={team.logoUrl} alt={team.name} />
                                <div><strong className="block">{team.name}</strong><span className="text-sm text-slate-500">Lay tu database BaseCore</span></div>
                            </a>
                        ))}
                    </div>
                )}
            </section>

            <section className="bg-white py-10" id="matches">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-5"><span className="text-xs font-black uppercase tracking-wide text-plum-950">Matches</span><h2 className="mb-0 text-2xl font-black">Tran dau sap toi</h2></div>
                    {matchError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700">{matchError}</div>}
                    {isLoadingMatches ? (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-slate-600">Dang tai lich tran...</div>
                    ) : (
                        <div className="space-y-3">
                            {matches.map((match) => (
                                <article className="grid items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm md:grid-cols-[1fr_auto_1fr_auto]" key={match.slug}>
                                    <div className="flex items-center gap-3"><img className="h-12 w-12 object-contain" src={match.homeTeam.logoUrl} alt={match.homeTeam.name} /><strong>{match.homeTeam.name}</strong></div>
                                    <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-black">vs</span>
                                    <div className="flex items-center gap-3 md:justify-end"><strong>{match.awayTeam.name}</strong><img className="h-12 w-12 object-contain" src={match.awayTeam.logoUrl} alt={match.awayTeam.name} /></div>
                                    <div className="md:text-right">
                                        <p className="mb-1 text-sm font-semibold text-slate-500">{formatKickoff(match.kickoffTime)}</p>
                                        <p className="mb-3 text-sm text-slate-500">{match.stadium.name}</p>
                                        <Link className="inline-flex rounded bg-plum-950 px-4 py-2 text-sm font-black text-white no-underline hover:bg-slate-950" to={`/tickets/${match.slug}`}>Xem ve</Link>
                                    </div>
                                </article>
                            ))}
                            {!matches.length && <div className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500">Chua co tran dau trong database.</div>}
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8" id="news">
                <div>
                    <div className="mb-5 flex items-end justify-between">
                        <div><span className="text-xs font-black uppercase tracking-wide text-plum-950">News</span><h2 className="mb-0 text-2xl font-black">Tin tuc moi nhat</h2></div>
                        <Link className="text-sm font-black text-plum-950 no-underline" to="/news">Tat ca tin</Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {news.slice(0, 4).map((post) => (
                            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={post.title}>
                                <img className="h-40 w-full object-cover" src={post.imageUrl} alt="" />
                                <div className="p-4"><h3 className="text-base font-black">{post.title}</h3><p className="mb-0 text-sm text-slate-600">{post.summary}</p></div>
                            </article>
                        ))}
                        {!news.length && <div className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500 md:col-span-2">Chua co tin tuc trong database.</div>}
                    </div>
                </div>
                <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-black">Spotlight</h2>
                    <div className="space-y-4">
                        {news.slice(4, 8).map((post) => (
                            <article className="flex gap-3" key={post.slug}>
                                <img className="h-16 w-16 rounded object-cover" src={post.imageUrl} alt="" />
                                <h3 className="mb-0 text-sm font-bold leading-5">{post.title}</h3>
                            </article>
                        ))}
                    </div>
                </aside>
            </section>

            <footer className="bg-slate-950 px-4 py-8 text-white">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3"><img className="h-12 w-12 object-contain" src={asset('images/epl-logo.png')} alt="" /><strong>Premier League Tickets</strong></div>
                    <p className="mb-0 text-sm text-slate-400">User portal powered by BaseCore.</p>
                </div>
            </footer>
        </main>
    );
};

export default UserHome;
