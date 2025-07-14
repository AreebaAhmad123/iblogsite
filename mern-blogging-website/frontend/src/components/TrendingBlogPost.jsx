import BlogCard from "./BlogCard";

const TrendingBlogPost = ({ blog, className }) => {
    if (!blog) {
        return null;
    }

    return (
        <div className={className}>
            <BlogCard 
                blog={blog}
                variant="trending"
                showAuthor={false}
                showStats={false}
                showBookmark={false}
                showLike={false}
            />
        </div>
    );
};

export default TrendingBlogPost; 