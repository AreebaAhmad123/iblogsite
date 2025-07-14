import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../pages/editor.page.jsx";
import { UserContext } from "../App";
import axios from "axios";
import { lookInSession } from "../common/session";

const PublishForm = () => {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const characterLimit = 200;
  const { blog = {}, setBlog, setEditorState } = useContext(EditorContext);
  const { userAuth } = useContext(UserContext);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const isEditing = !!(blog?.blog_id || blogId);

  // Helper function to normalize content structure
  const normalizeContent = (content) => {
    if (!content) {
      return [{ time: Date.now(), blocks: [], version: '2.27.2' }];
    }
    
    if (Array.isArray(content)) {
      return content.map(item => ({
        time: item?.time || Date.now(),
        blocks: Array.isArray(item?.blocks) ? item.blocks : [],
        version: item?.version || '2.27.2'
      }));
    }
    
    if (typeof content === 'object' && content !== null) {
      return [{
        time: content.time || Date.now(),
        blocks: Array.isArray(content.blocks) ? content.blocks : [],
        version: content.version || '2.27.2'
      }];
    }
    
    return [{ time: Date.now(), blocks: [], version: '2.27.2' }];
  };

  // Initialize tags from blog data
  useEffect(() => {
    if (blog?.tags) {
      setTags(blog.tags);
    }
  }, [blog?.tags]);

  // Validate blog data before publishing
  const validateBlogData = () => {
    const errors = {};
    if (!blog.title?.trim()) {
      errors.title = "Blog title is required";
    } else if (blog.title.trim().length > 100) {
      errors.title = "Title cannot exceed 100 characters";
    }
    if (!blog.des?.trim()) {
      errors.description = "Blog description is required";
    } else if (blog.des.length > characterLimit) {
      errors.description = `Description cannot exceed ${characterLimit} characters (current: ${blog.des.length})`;
    }
    if (!blog.banner) {
      errors.banner = "Blog banner is required";
    }
    if (!blog.tags?.length) {
      errors.tags = "At least one tag is required";
    } else if (blog.tags.length > 5) {
      errors.tags = "Maximum 5 tags allowed";
    }
    // Validate EditorJS content
    const blocks = getContentBlocks(blog.content);
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      errors.content = "Blog content is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const publishBlog = async (e) => {
    e.preventDefault();
    if (!validateBlogData()) {
      toast.error("Please fix the validation errors before publishing");
      return;
    }
    setIsLoading(true);
    const loadingToast = toast.loading("Publishing...");
    try {
      // Prepare the blog data
      const blogData = {
        title: blog.title.trim(),
        des: blog.des.trim(),
        banner: blog.banner?.trim() || "",
        content: normalizeContent(blog.content),
        tags: blog.tags.map(tag => tag.trim().toLowerCase()),
        draft: false
      };
      let response;
      if (isEditing) {
        // Update existing blog (publish draft)
        response = await axios.put(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/update-blog/${blog.blog_id || blogId}`,
          blogData,
          {
            timeout: 15000
          }
        );
      } else {
        // Create new blog
        response = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/create-blog`,
          blogData,
          {
            timeout: 15000
          }
        );
      }
      toast.dismiss(loadingToast);
      toast.success("Published successfully!");
      sessionStorage.removeItem("blog_draft");
      sessionStorage.setItem("refresh_drafts", "1");
      sessionStorage.setItem("refresh_published", "1");
      setTimeout(() => navigate("/admin/blogs"), 1500);
    } catch (error) {
      toast.dismiss(loadingToast);
      let errorMessage = "Failed to publish";
      if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to publish blogs.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Invalid blog data";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEvent = () => {
    setEditorState("editor");
    navigate("/editor");
  };

  const handleBlogTitleChange = (e) => {
    const newTitle = e.target.value;
    setBlog({ ...blog, title: newTitle });
    if (validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: null }));
    }
  };

  const handleDescriptionChange = (e) => {
    const newDes = e.target.value;
    setBlog({ ...blog, des: newDes });
    if (validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: null }));
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= 5) {
        toast.error("Maximum 5 tags allowed");
        return;
      }
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.map(t => t.trim().toLowerCase()).includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        setBlog({ ...blog, tags: newTags });
        setTagInput("");
        if (validationErrors.tags) {
          setValidationErrors(prev => ({ ...prev, tags: null }));
        }
      } else {
        toast.error("Duplicate tag");
      }
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setBlog({ ...blog, tags: newTags });
  };

  // Get content blocks from normalized content
  const getContentBlocks = (content) => {
    if (!content) return null;
    try {
      const normalizedContent = normalizeContent(content);
      return normalizedContent[0]?.blocks || null;
    } catch (error) {
      return null;
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form className="publish-form" onSubmit={publishBlog}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={blog.title || ""}
            onChange={handleBlogTitleChange}
            className={validationErrors.title ? "error" : ""}
            maxLength={100}
            required
          />
          {validationErrors.title && <span className="error-message">{validationErrors.title}</span>}
        </div>
        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={blog.des || ""}
            onChange={handleDescriptionChange}
            className={validationErrors.description ? "error" : ""}
            maxLength={characterLimit}
            required
          />
          {validationErrors.description && <span className="error-message">{validationErrors.description}</span>}
        </div>
        {/* Banner */}
        <div className="form-group">
          <label htmlFor="banner">Banner URL</label>
          <input
            id="banner"
            type="text"
            value={blog.banner || ""}
            onChange={e => setBlog({ ...blog, banner: e.target.value })}
            className={validationErrors.banner ? "error" : ""}
            required
          />
          {validationErrors.banner && <span className="error-message">{validationErrors.banner}</span>}
        </div>
        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <div className="tags-input-wrapper">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag and press Enter"
              maxLength={20}
            />
            <div className="tags-list">
              {tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
          {validationErrors.tags && <span className="error-message">{validationErrors.tags}</span>}
        </div>
        {/* Content validation error */}
        {validationErrors.content && <div className="error-message">{validationErrors.content}</div>}
        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn-light" onClick={handleCloseEvent} disabled={isLoading}>
            Back to Editor
          </button>
          <button type="submit" className="btn-dark" disabled={isLoading}>
            {isLoading ? "Publishing..." : isEditing ? "Update Blog" : "Publish Blog"}
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default PublishForm; 