import React, { useState, useEffect, useCallback } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import './CommentSection.css';

const CommentSection = ({ type, id }) => {
    const { user } = useUserAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://connect-lib.onrender.com/api/comments/?type=${type}&id=${id}`);
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    }, [type, id]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const submitComment = async () => {
        if (!user) {
            alert('Please login to comment');
            return;
        }

        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch('https://connect-lib.onrender.com/api/comments/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    type: type,
                    id: id,
                    content: newComment
                })
            });
            const data = await response.json();
            setComments([data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('❌ Error posting comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="comments-loading">Loading comments...</div>;

    return (
        <div className="comment-section">
            <h3>💬 Comments ({comments.length})</h3>
            
            {user ? (
                <div className="comment-input">
                    <textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                    />
                    <button onClick={submitComment} disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            ) : (
                <p className="login-to-comment">
                    <a href="/login">Login</a> to comment
                </p>
            )}

            <div className="comments-list">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                                <strong>{comment.user_username}</strong>
                                <span className="comment-date">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="comment-content">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;