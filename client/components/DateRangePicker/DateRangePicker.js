'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

function sameDay(a, b) {
    return a && b && a.toDateString() === b.toDateString();
}
function isBetween(d, s, e) {
    return d && s && e && d > s && d < e;
}
function startOfDay(d) {
    const n = new Date(d); n.setHours(0, 0, 0, 0); return n;
}

function MonthGrid({ year, month, startDate, endDate, hoverDate, onDateClick, onDateHover }) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = startOfDay(new Date());
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return (
        <div style={{ flex: 1, minWidth: 280 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 16, textAlign: 'center' }}>
                {MONTHS[month]} {year}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
                {DAYS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', padding: '0 0 10px', letterSpacing: '0.04em' }}>
                        {d}
                    </div>
                ))}
                {cells.map((date, i) => {
                    if (!date) return <div key={i} />;
                    const isPast = startOfDay(date) < today;
                    const isStart = sameDay(date, startDate);
                    const isEnd = sameDay(date, endDate);
                    const inRange = isBetween(date, startDate, endDate || hoverDate);
                    const isHover = sameDay(date, hoverDate) && startDate && !endDate;
                    const isSel = isStart || isEnd;

                    return (
                        <div
                            key={i}
                            onClick={() => !isPast && onDateClick(date)}
                            onMouseEnter={() => !isPast && onDateHover(date)}
                            style={{
                                textAlign: 'center',
                                padding: '0 0 2px',
                                cursor: isPast ? 'default' : 'pointer',
                            }}
                        >
                            <div style={{
                                margin: '1px 3px',
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: isSel ? 18 : (inRange || isHover) ? 0 : 0,
                                background: isSel ? 'var(--text-primary)'
                                    : (inRange || isHover) ? 'var(--bg-secondary)' : 'transparent',
                                color: isSel ? '#fff' : isPast ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                fontSize: 13,
                                fontWeight: isSel ? 700 : 400,
                                transition: 'background 80ms ease',
                                userSelect: 'none',
                            }}>
                                {date.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * DateRangePicker — Airbnb-style floating 2-month panel
 *
 * Props:
 *   startDate, endDate (Date | null)
 *   onChange({ startDate, endDate })
 *   onClose()
 */
export default function DateRangePicker({ startDate, endDate, onChange, onClose }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [hoverDate, setHoverDate] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, [onClose]);

    const handleDateClick = (date) => {
        if (!startDate || (startDate && endDate)) {
            onChange({ startDate: date, endDate: null });
        } else {
            if (date < startDate) {
                onChange({ startDate: date, endDate: null });
            } else {
                onChange({ startDate, endDate: date });
                setHoverDate(null);
            }
        }
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;

    const fmtDate = (d) => d
        ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    return (
        <div ref={ref} style={{
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-subtle)',
            padding: '24px 28px 20px',
            width: 'max-content',
            maxWidth: 'calc(100vw - 24px)',
            overflowX: 'auto',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border-subtle)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={16} />
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {startDate ? `${fmtDate(startDate)}` : 'Select check-in'}
                        {' → '}
                        {endDate ? fmtDate(endDate) : 'Select check-out'}
                    </span>
                </div>
                <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border-subtle)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Two month grids */}
            <div style={{ display: 'flex', gap: 32 }}>
                <MonthGrid year={viewYear} month={viewMonth} startDate={startDate} endDate={endDate} hoverDate={hoverDate} onDateClick={handleDateClick} onDateHover={setHoverDate} />
                <div style={{ width: 1, background: 'var(--border-subtle)', flexShrink: 0 }} />
                <MonthGrid year={nextY} month={nextM} startDate={startDate} endDate={endDate} hoverDate={hoverDate} onDateClick={handleDateClick} onDateHover={setHoverDate} />
            </div>

            {/* Footer actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', gap: 10 }}>
                <button onClick={() => { onChange({ startDate: null, endDate: null }); onClose?.(); }}
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >Clear</button>
                <button onClick={() => onClose?.()}
                    style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--text-primary)', border: 'none', cursor: 'pointer', padding: '8px 20px', borderRadius: 8, fontFamily: 'inherit' }}
                >Done</button>
            </div>
        </div>
    );
}
