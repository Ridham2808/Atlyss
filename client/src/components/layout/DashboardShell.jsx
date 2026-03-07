import React from 'react';
import Topbar from './Topbar';

const DashboardShell = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', background: '#080808' }}>
            <Topbar />
            <main style={{ paddingTop: 60, minHeight: '100vh' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardShell;
