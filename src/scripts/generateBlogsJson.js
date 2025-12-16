import fs from "fs";
import path from "path";

const BLOG_HTML_DIR = path.resolve("src/blog-html");
const OUTPUT_JSON = path.resolve("src/data/blogs.json");

const files = fs.readdirSync(BLOG_HTML_DIR);

const blogs = files
  .filter(file => file.endsWith(".html"))
  .map(file => {
    let html = fs.readFileSync(
      path.join(BLOG_HTML_DIR, file),
      "utf-8"
    );

    const slug = file.replace(".html", "");

    // 🔥 Extract <h1>
    const h1Match = html.match(/<h1>(.*?)<\/h1>/i);

    const title = h1Match
      ? h1Match[1]
      : slug.replace(/-/g, " ");

    // 🔥 Remove <h1> from content
    if (h1Match) {
      html = html.replace(h1Match[0], "");
    }

    return {
      id: slug,
      title,
      author: "Manan Patel",
      date: new Date().toISOString().split("T")[0],
      featureImage: `/src/assets/blog-images/${slug}.webp`,
      content: html.trim()
    };
  });

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(blogs, null, 2), "utf-8");

console.log("✅ blogs.json generated successfully");
