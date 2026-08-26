import React, { useState, useEffect } from 'react';
import './DidYouKnow.css';

const DidYouKnow = () => {
    const [fact, setFact] = useState('');
    const [counties, setCounties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Facts array defined outside component so it doesn't change on re-render
    const facts = [
        "Liberia has 15 counties, each with its own unique culture!",
        "Montserrado County is home to the capital, Monrovia!",
        "Lofa County is known for its rich agricultural resources!",
        "Nimba County is famous for its iron ore mining!",
        "Grand Bassa County has beautiful beaches!",
        "Bong County is known for its rubber plantations!",
        "Maryland County is home to Harper, a historic port city!",
        "Liberia was founded in 1822 by freed slaves from America!",
        "The Liberian flag has 11 stripes representing the signatories of the Declaration of Independence!",
        "Liberia is Africa's oldest republic!",
    ];

    useEffect(() => {
        setFact(facts[Math.floor(Math.random() * facts.length)]);
        
        fetch('https://connect-lib.onrender.com/api/counties/')
            .then(r => r.json())
            .then(data => {
                setCounties(data.results || data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="did-you-know">
            <div className="dyk-content">
                <span className="dyk-icon">💡</span>
                <div>
                    <strong>Did You Know?</strong>
                    <p>{fact}</p>
                    {!loading && counties.length > 0 && (
                        <small>
                            📍 Explore all {counties.length} counties in Liberia!
                        </small>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DidYouKnow;