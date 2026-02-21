import React, { useState, useEffect } from "react";
import { RefreshCw, Heart, Star, Flame, Info } from "lucide-react";
import { loadMotivation, saveMotivation } from "../utils/storage";

const QUOTES = [
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", tag: "Consistency" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", tag: "Passion" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", tag: "Persistence" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", tag: "Mindset" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", tag: "Patience" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", tag: "Action" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", tag: "Discipline" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", tag: "Momentum" },
];

const TODAY = () => new Date().toISOString().split("T")[0];

const Motivation = () => {
  const [qIdx, setQIdx] = useState(0);
  const [liked, setLiked] = useState(new Set());
  const [starred, setStarred] = useState(new Set());
  const [fade, setFade] = useState(true);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  /* restore */
  useEffect(() => {
    const s = loadMotivation();
    setQIdx(s.qIdx ?? 0);
    setLiked(new Set(s.liked ?? []));
    setStarred(new Set(s.starred ?? []));
    setStreak(s.streak ?? 0);
    setBest(s.best ?? 0);
  }, []);

  /* refresh streak if checkDailyGoals() fires motivationUpdated */
  useEffect(() => {
    const refresh = () => {
      const s = loadMotivation();
      setStreak(s.streak ?? 0);
      setBest(s.best ?? 0);
    };
    window.addEventListener("motivationUpdated", refresh);
    return () => window.removeEventListener("motivationUpdated", refresh);
  }, []);

  /* persist + broadcast */
  useEffect(() => {
    saveMotivation({ qIdx, liked: [...liked], starred: [...starred], streak, best });
  }, [qIdx, liked, starred, streak, best]);

  const quote = QUOTES[qIdx];

  const nextQuote = () => {
    setFade(false);
    setTimeout(() => {
      setQIdx(i => (i + 1) % QUOTES.length);
      setFade(true);
    }, 250);
  };

  const toggleLike = () => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(qIdx) ? next.delete(qIdx) : next.add(qIdx);
      return next;
    });
  };
  const toggleStar = () => {
    setStarred(prev => {
      const next = new Set(prev);
      next.has(qIdx) ? next.delete(qIdx) : next.add(qIdx);
      return next;
    });
  };

  const toBeat = best - streak;

  return (
    <div className="fade-in">
      {/* header */}
      <div className="mv-header">
        <h1 className="mv-title">Motivation</h1>
        <p className="mv-sub">Stay inspired and keep your momentum going.</p>
      </div>

      {/* Quote of the Day card */}
      <div className="mv-quote-card">
        <div className="mv-quote-top">
          <span className="mv-qotd-label">QUOTE OF THE DAY</span>
          <RefreshCw size={16} className="mv-qotd-refresh" onClick={nextQuote} />
        </div>

        <div className={`mv-quote-body${fade ? "" : " mv-fade-out"}`}>
          <p className="mv-quote-text">"{quote.text}"</p>
          <div className="mv-quote-meta">
            <span className="mv-quote-author">— {quote.author}</span>
            <span className="mv-quote-tag">{quote.tag}</span>
          </div>
        </div>

        <div className="mv-quote-actions">
          <button className="mv-new-quote-btn" onClick={nextQuote}>
            <RefreshCw size={14} /> New Quote
          </button>
          <div className="mv-quote-icons">
            <button
              className={`mv-icon-btn${liked.has(qIdx) ? " mv-icon-btn--liked" : ""}`}
              onClick={toggleLike}
              title="Like"
            >
              <Heart size={18} />
            </button>
            <button
              className={`mv-icon-btn${starred.has(qIdx) ? " mv-icon-btn--starred" : ""}`}
              onClick={toggleStar}
              title="Favourite"
            >
              <Star size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Current Streak card */}
      <div className="mv-streak-card">
        <div className="mv-streak-head">
          <div className="mv-streak-left">
            <div className="mv-flame-icon"><Flame size={18} /></div>
            <div>
              <div className="mv-streak-title">Current Streak</div>
              <div className="mv-streak-sub">Keep the momentum going</div>
            </div>
          </div>
          <Info size={18} className="mv-info-icon" />
        </div>

        <div className="mv-streak-stats">
          <div className="mv-streak-stat">
            <div className="mv-streak-val">{streak}</div>
            <div className="mv-streak-lbl">Day Streak</div>
          </div>
          <div className="mv-streak-stat">
            <div className="mv-streak-val">{best}</div>
            <div className="mv-streak-lbl">Best Streak</div>
          </div>
        </div>

        {toBeat > 0 ? (
          <div className="mv-fire-banner">
            <span>You're on fire 🔥</span>
            <span className="mv-fire-sub">{toBeat} days to beat your best streak</span>
          </div>
        ) : (
          <div className="mv-fire-banner mv-fire-banner--record">
            <span>🏆 New record! You've beaten your best streak!</span>
          </div>
        )}
      </div>

      {/* Liked quotes */}
      {liked.size > 0 && (
        <div className="mv-saved-section">
          <h2 className="mv-section-title">❤️ Liked Quotes</h2>
          <div className="mv-saved-list">
            {[...liked].map(i => (
              <div key={i} className="mv-saved-card">
                <p className="mv-saved-text">"{QUOTES[i].text}"</p>
                <span className="mv-saved-author">— {QUOTES[i].author}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {starred.size > 0 && (
        <div className="mv-saved-section">
          <h2 className="mv-section-title">⭐ Favourited Quotes</h2>
          <div className="mv-saved-list">
            {[...starred].map(i => (
              <div key={i} className="mv-saved-card mv-saved-card--star">
                <p className="mv-saved-text">"{QUOTES[i].text}"</p>
                <span className="mv-saved-author">— {QUOTES[i].author}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Motivation;