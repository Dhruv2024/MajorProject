import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import './VideoCallLinkCool.css';
import { ThemeContext } from '../../../provider/themeContext';

const VideoCallLink = ({ data, handleLectureCompletion, completed }) => {
    const { meetStartTime, meetUrl, title, description } = data;
    const [currentTime, setCurrentTime] = useState(moment());
    const startTime = moment(meetStartTime);
    const [showButton, setShowButton] = useState(false);
    const [pulse, setPulse] = useState(false);
    const [meetingEnded, setMeetingEnded] = useState(false);
    const { darkTheme } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = moment();
            setCurrentTime(now);
            const timeDuration = completed ? 30 : 10;
            if (!showButton && now.isSameOrAfter(startTime)) {
                setShowButton(true);
                setPulse(true);
                setTimeout(() => setPulse(false), 2000);
            }

            // Hide button after 10 minutes
            if (showButton && now.diff(startTime, 'minutes') >= timeDuration) {
                setShowButton(false);
                setMeetingEnded(true);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [showButton, startTime]);

    useEffect(() => {
        setLoading(true);
        const now = moment();
        setCurrentTime(now);

        if (!showButton && now.isSameOrAfter(startTime)) {
            setShowButton(true);
            setPulse(true);
            setTimeout(() => setPulse(false), 2000);
        }
        const timeDuration = completed ? 30 : 10;
        // Check immediately if meeting should already be considered ended
        if (now.diff(startTime, 'minutes') >= timeDuration) {
            setShowButton(false);
            setMeetingEnded(true);
        }

        setLoading(false);
    }, []);

    const handleJoinMeeting = () => {
        handleLectureCompletion();
        window.open(meetUrl, '_blank', 'noopener noreferrer');
    };

    if (loading) {
        return <div className='loader'></div>;
    }

    return (
        <div className={`fullscreen-container ${darkTheme ? 'dark' : 'light'}`}>
            <div className={`meeting-card animated-card ${showButton ? 'slide-in' : ''}`}>
                <h2 className="meeting-title cool-title">{title}</h2>
                {description && <p className="meeting-description cool-description">{description}</p>}
                <div className="button-container">
                    {meetingEnded ? (
                        <div>
                            <p className="end-message cool-message">This meeting is no longer active.</p>
                            <button
                                className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                                onClick={handleLectureCompletion} // You need to define this function
                            >
                                Mark as Complete
                            </button>
                        </div>
                    ) : showButton ? (
                        <button
                            className={`join-button cool-button ${pulse ? 'pulse' : ''}`}
                            onClick={handleJoinMeeting}
                        >
                            Join Meeting
                        </button>
                    ) : (
                        <p className="availability-message cool-message">
                            Meeting is scheduled at: <span className="start-time cool-time">{startTime.format('LLL')}</span>
                        </p>
                    )}
                </div>
            </div>
            <div className="animated-bg-overlay"></div>
        </div>
    );
};

export default VideoCallLink;
