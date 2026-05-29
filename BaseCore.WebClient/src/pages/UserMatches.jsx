import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import MatchCard from '../components/user/MatchCard';
import UserLayout from '../components/user/UserLayout';
import { EmptyState, ErrorState, LoadingState } from '../components/user/StateViews';
import { PageFade, fadeUp, itemTransition, pageTransition, stagger } from '../components/user/UserMotion';
import { matchApi } from '../services/api';

const SEASON = '2026-2027';

const groupMatchesByRound = (matches) => {
    const groups = new Map();

    matches.forEach((match) => {
        const roundNumber = match?.roundNumber ?? 0;
        const key = roundNumber || 'unknown';
        const existing = groups.get(key) || {
            key,
            roundNumber,
            roundName: match?.roundName || 'Vòng đấu chưa cập nhật',
            matches: [],
        };

        existing.matches.push(match);
        groups.set(key, existing);
    });

    return [...groups.values()].sort((a, b) => Number(a.roundNumber || 999) - Number(b.roundNumber || 999));
};

function UserMatches() {
    const [selectedRound, setSelectedRound] = useState('all');
    const [rounds, setRounds] = useState([]);
    const [matches, setMatches] = useState([]);
    const [isLoadingRounds, setIsLoadingRounds] = useState(true);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);
    const [roundError, setRoundError] = useState('');
    const [matchError, setMatchError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadRounds = async () => {
            setIsLoadingRounds(true);
            setRoundError('');

            try {
                const response = await matchApi.getRounds({ season: SEASON });
                if (isMounted) {
                    setRounds(response.data || []);
                }
            } catch (error) {
                if (isMounted) {
                    setRoundError(error.response?.data?.message || 'Không tải được danh sách vòng đấu.');
                    setRounds([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingRounds(false);
                }
            }
        };

        loadRounds();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadMatches = async () => {
            setIsLoadingMatches(true);
            setMatchError('');

            try {
                const params = selectedRound === 'all'
                    ? undefined
                    : { season: SEASON, round: selectedRound };
                const response = await matchApi.getAll(params);
                if (isMounted) {
                    setMatches(response.data || []);
                }
            } catch (error) {
                if (isMounted) {
                    setMatchError(error.response?.data?.message || 'Không tải được lịch trận từ backend.');
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
    }, [selectedRound]);

    const groupedMatches = useMemo(() => groupMatchesByRound(matches), [matches]);

    return (
        <UserLayout>
            <PageFade>
            <motion.div
                className="mb-8 rounded-2xl bg-slate-950 p-8 text-white shadow-lg"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                transition={pageTransition}
            >
                <span className="text-sm font-black uppercase text-cyan-200">Premier League {SEASON}</span>
                <h1 className="mb-0 mt-3 text-4xl font-black">Trận đấu</h1>
                <p className="mb-0 mt-3 max-w-2xl text-slate-300">
                    Lọc lịch đấu theo vòng, xem sân vận động, thời gian thi đấu và chọn trận để đặt vé.
                </p>
            </motion.div>

            {roundError && <div className="mb-5"><ErrorState message={roundError} /></div>}

            <motion.div
                className="mb-6 flex gap-2 overflow-x-auto pb-2"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                transition={{ ...itemTransition, delay: 0.05 }}
            >
                <button
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${selectedRound === 'all' ? 'bg-slate-950 text-white shadow-lg' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'}`}
                    type="button"
                    onClick={() => setSelectedRound('all')}
                >
                    Tất cả
                </button>
                {isLoadingRounds ? (
                    <span className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm">Đang tải vòng đấu...</span>
                ) : rounds.map((round) => (
                    <button
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${Number(selectedRound) === Number(round.roundNumber) ? 'bg-slate-950 text-white shadow-lg' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'}`}
                        type="button"
                        onClick={() => setSelectedRound(round.roundNumber)}
                        key={round.id || round.roundNumber}
                    >
                        Vòng {round.roundNumber}
                        <span className="ml-2 text-xs opacity-70">{round.matchCount ?? 0}</span>
                    </button>
                ))}
            </motion.div>

            {matchError && <div className="mb-5"><ErrorState message={matchError} /></div>}

            {isLoadingMatches ? (
                <LoadingState title="Đang tải lịch trận..." />
            ) : matches.length ? (
                selectedRound === 'all' ? (
                    <motion.div className="grid gap-8" initial="hidden" animate="show" variants={stagger}>
                        {groupedMatches.map((group) => (
                            <motion.section
                                key={group.key}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: '-80px' }}
                                variants={fadeUp}
                                transition={itemTransition}
                            >
                                <div className="mb-4 flex flex-wrap items-center gap-3">
                                    <h2 className="mb-0 text-xl font-black text-slate-950">{group.roundName}</h2>
                                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">
                                        {group.matches.length} trận
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {group.matches.map((match, index) => (
                                        <motion.div
                                            key={match.slug || match.id}
                                            initial={{ opacity: 0, y: 18 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: '-60px' }}
                                            transition={{ duration: 0.4, delay: index * 0.06 }}
                                        >
                                            <MatchCard match={match} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="show" variants={stagger}>
                        {matches.map((match, index) => (
                            <motion.div
                                key={match.slug || match.id}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.4, delay: index * 0.06 }}
                            >
                                <MatchCard match={match} />
                            </motion.div>
                        ))}
                    </motion.div>
                )
            ) : (
                <EmptyState title="Chưa có trận đấu" message="Database hiện chưa có trận đấu để bán vé." />
            )}
            </PageFade>
        </UserLayout>
    );
}

export default UserMatches;
