import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import NotificationCard from "../components/notification-card.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import ServerStatus from "../components/server-status.component";

const Notifications = () => {
    let {userAuth, userAuth: { new_notification_available }, setUserAuth } = useContext(UserContext);
    const [notifications, setNotifications] = useState({ results: [], totalDocs: 0, page: 1 });
    const [loading, setLoading] = useState(false);

    // Set filter based on user type
    const isAdmin = userAuth?.admin === true || userAuth?.super_admin === true;
    const [filter, setFilter] = useState(isAdmin ? 'all' : 'reply');
    
    // Check if server domain is configured
    if (!import.meta.env.VITE_SERVER_DOMAIN) {
        console.error('VITE_SERVER_DOMAIN environment variable is not set!');
        return <div className="text-center p-8">Server configuration error. Please check your environment variables.</div>;
    }

    // Show different filters based on user type
    let filters = isAdmin ? ['all', 'new_user', 'comment', 'reply', 'like'] : ['reply'];

    const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
        if (!userAuth?.access_token) {
            console.warn('No access token available for notifications');
            return;
        }

        console.log("Fetching notifications with filter:", filter, "page:", page);
        console.log("User is admin:", isAdmin);
        console.log('userAuth:', userAuth);
        setLoading(true);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/api/notifications", {
            page, filter, deletedDocCount
        }, {
            headers: {
                'Authorization': `Bearer ${userAuth.access_token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(async ({ data }) => {
                console.log("Fetched notifications:", data);
                const notificationsData = data.notifications || [];
                console.log("Notifications data:", notificationsData);
                console.log("Number of notifications received:", notificationsData.length);
                console.log("First notification:", notificationsData[0]);
                
                // Always mark notifications as seen when visiting the page
                if(new_notification_available){
                    setUserAuth({...userAuth, new_notification_available: false });
                }
                // Mark all notifications as seen
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/api/seen-notifications", { }, {
                    headers: {
                        'Authorization': `Bearer ${userAuth.access_token}`
                    }
                }).catch(err => {
                    console.error('Error marking notifications as seen:', err);
                });
                
                console.log("About to call filterPaginationData with:", {
                    state: notifications,
                    data: notificationsData, 
                    page,
                    countRoute: "/all-notifications-count",
                    data_to_send: { filter },
                    user: userAuth.access_token
                });
                
                let formattedData = await filterPaginationData({
                    state: notifications,
                    data: notificationsData, 
                    page,
                    countRoute: "/all-notifications-count",
                    data_to_send: { filter },
                    user: userAuth.access_token
                })
                console.log("Formatted notifications data:", formattedData);
                setNotifications(formattedData)
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching notifications:', err);
                console.error('Error response:', err.response?.data);
                if (err.code === 'ERR_NETWORK' || err.message.includes('ECONNREFUSED')) {
                    console.error('Server connection failed. Make sure the server is running on port 3000.');
                }
                setLoading(false);
            })
    }

    useEffect(() => {
        if (userAuth?.access_token) {
            fetchNotifications({ page: 1 })
        } else {
            console.warn('No access token available. User may not be logged in.');
        }
    }, [userAuth?.access_token, filter])

    const handleFilter = (e) => {
        let btn = e.target;
        const buttonText = btn.innerHTML.toLowerCase();
        
        // Map button text to actual notification types
        let newFilter;
        switch (buttonText) {
            case 'all':
                newFilter = 'all';
                break;
            case 'new users':
                newFilter = 'new_user';
                break;
            case 'comments':
                newFilter = 'comment';
                break;
            case 'replies':
                newFilter = 'reply';
                break;
            case 'likes':
                newFilter = 'like';
                break;
            default:
                newFilter = 'reply';
        }
        
        console.log('Changing filter to:', newFilter);
        setFilter(newFilter);
        setNotifications(null);
    }
    
    return (
        <ServerStatus>
            <div>
                <h1 className="max-md:hidden">Notifications</h1>
                
                {/* Filter buttons for admin users */}
                {isAdmin && (
                    <div className="flex gap-2 mb-6">
                        {filters.map((filterType, index) => (
                            <button
                                key={index}
                                onClick={handleFilter}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === filterType
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {filterType === 'all' ? 'All' : 
                                 filterType === 'new_user' ? 'New Users' :
                                 filterType === 'comment' ? 'Comments' :
                                 filterType === 'reply' ? 'Replies' : 
                                 filterType === 'like' ? 'Likes' : filterType}
                            </button>
                        ))}
                    </div>
                )}
                
                {
                    loading ? <Loader /> :
                    notifications === null ? <Loader /> :
                        <>
                            {
                                notifications && notifications.results && notifications.results.length ?
                                    // Render notifications in chunks of 5, with a LoadMoreDataBtn after each chunk
                                    Array.from({ length: Math.ceil(notifications.results.length / 5) }).map((_, chunkIdx) => {
                                        console.log(`Rendering notification chunk ${chunkIdx} with ${notifications.results.slice(chunkIdx * 5, (chunkIdx + 1) * 5).length} notifications`);
                                        return (
                                            <div key={chunkIdx}>
                                                {notifications.results.slice(chunkIdx * 5, (chunkIdx + 1) * 5).map((notification, i) => {
                                                    console.log(`Rendering notification ${chunkIdx * 5 + i}:`, notification);
                                                    return (
                                                        <AnimationWrapper key={chunkIdx * 5 + i} transition={{ delay: (chunkIdx * 5 + i) * 0.08 }}>
                                                            <NotificationCard data={notification} index={chunkIdx * 5 + i} notificationState={{notifications, setNotifications}}/>
                                                        </AnimationWrapper>
                                                    );
                                                })}
                                                {/* Show LoadMoreDataBtn only after the last chunk if there are more notifications to load */}
                                                {(chunkIdx === Math.floor((notifications.results.length - 1) / 5)) &&
                                                    <LoadMoreDataBtn state={notifications} fetchDataFun={fetchNotifications} additionalParam={{ deletedDocCount: notifications?.deletedDocCount }} />
                                                }
                                            </div>
                                        );
                                    })
                                    : <NoDataMessage message="Nothing available" />
                            }
                        </>
                }
            </div>
        </ServerStatus>
    )

}
export default Notifications;
