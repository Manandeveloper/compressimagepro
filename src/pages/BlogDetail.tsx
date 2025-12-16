import { useParams, Link } from "react-router-dom";
import blogs from "@/data/blogs.json";

export default function BlogDetail() {
    const { slug } = useParams();
    const blog = blogs.find((b) => b.id === slug);

    if (!blog) return <p>Blog not found</p>;

    return (
        <div className="max-w-5xl mx-auto p-6 blog-detail">
            <Link to="/blog" className="text-blue-600">← Back</Link>

            <h1 className="font-bold mt-4 mb-5">{blog.title}</h1>
            <p className="text-s font-bold text-gray-500 mb-6">
                {blog.date} • {blog.author}
            </p>
            <div className="feature-img mb-9">
                <img
                    src={blog.featureImage}
                    alt={blog.title}
                    className="rounded-2xl w-full h-48 object-cover rounded-xl"
                />
            </div>
            <div
                className="content prose max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
            />
        </div>
    );
}
