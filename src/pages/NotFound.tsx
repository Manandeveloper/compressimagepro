import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import notfountimage from "@/assets/images/not-found-image.jpg"
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  useEffect(() => {
    document.body.classList.add('not-found');

    return () => {
      document.body.classList.remove('not-found');
    };
  }, []);
  return (
    <div className="page-not-found">
      <div className="container">
        <div className="wrap">
          <div className="left-col">
            <h1>uh-oh , <br /> <span>lost your</span> <br />way?</h1>
            <p className="sub-title">let's get back where the magic happens</p>
            <a href="/" className="text-primary underline hover:text-primary/90">
              Return to Home
            </a>
          </div>
          <div className="right-col">
            <img src={notfountimage} alt="Not found image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
