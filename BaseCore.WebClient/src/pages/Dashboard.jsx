import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchApi, newsApi, userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const statCards = [
    { key: 'matches', label: 'Matches', icon: 'fas fa-futbol', href: '/user#matches', bg: 'bg-info' },
    { key: 'tickets', label: 'Ticket Listings', icon: 'fas fa-ticket-alt', href: '/tickets/man-utd-liverpool', bg: 'bg-success' },
    { key: 'news', label: 'News Articles', icon: 'fas fa-newspaper', href: '/news', bg: 'bg-primary' },
    { key: 'users', label: 'Users', icon: 'fas fa-users', href: '/admin/users', bg: 'bg-warning', adminOnly: true },
];

const Dashboard = () => {
    const [stats, setStats] = useState({ matches: 0, tickets: 0, news: 0, users: 0 });
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [matchesRes, newsRes] = await Promise.all([
                    matchApi.getAll(),
                    newsApi.getAll(),
                ]);

                const matches = matchesRes.data || [];
                const ticketResponses = await Promise.all(
                    matches.map((match) => matchApi.getTickets(match.slug).catch(() => ({ data: { listings: [] } }))),
                );

                let usersCount = 0;
                if (isAdmin()) {
                    try {
                        const usersRes = await userApi.getAll({ page: 1, pageSize: 1 });
                        usersCount = usersRes.data.totalCount || 0;
                    } catch {
                        usersCount = 0;
                    }
                }

                setStats({
                    matches: matches.length,
                    tickets: ticketResponses.reduce((total, response) => total + (response.data?.listings?.length || 0), 0),
                    news: newsRes.data?.length || 0,
                    users: usersCount,
                });
            } catch (error) {
                console.error('Failed to load dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [isAdmin]);

    return (
        <>
            <div className="content-header mb-3">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Football Ticket Dashboard</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-end">
                                <li className="breadcrumb-item active">Dashboard</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status" />
                    </div>
                </div>
            ) : (
                <div className="row">
                    {statCards.filter((card) => !card.adminOnly || isAdmin()).map((card) => (
                        <div className="col-lg-3 col-6" key={card.key}>
                            <div className={`small-box ${card.bg} text-white rounded shadow-sm`}>
                                <div className="inner p-3">
                                    <h3>{stats[card.key]}</h3>
                                    <p>{card.label}</p>
                                </div>
                                <div className="icon position-absolute end-0 top-0 pe-3 pt-3 opacity-50">
                                    <i className={`${card.icon} fa-3x`} />
                                </div>
                                <Link className="small-box-footer d-block bg-dark bg-opacity-10 px-3 py-2 text-center text-white text-decoration-none" to={card.href}>
                                    More info <i className="fas fa-arrow-circle-right" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title mb-0">BaseCore Football Ticket System</h3>
                </div>
                <div className="card-body">
                    <p>Admin is now focused on football ticket operations instead of the old e-commerce catalog.</p>
                    <div className="row">
                        {['Match schedule and team data', 'Stadium sections and ticket listings', 'Ticket order workflow', 'News content from BaseCore database'].map((feature) => (
                            <div className="col-md-6 mb-2" key={feature}>
                                <i className="fas fa-check-circle text-success me-2" />
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
