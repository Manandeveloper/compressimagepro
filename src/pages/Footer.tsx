import { useEffect } from "react";

export default function Footer() {
    return (
        <div className="footer">
            <div className="container">
                <div className="wrap">
                    <div className="left-footer">
                        <p>© 2025 CompressImagePro. All rights reserved.</p>
                    </div>
                    <div className="right-footer">
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms-condition">Terms & Consition</a>
                    </div>
                </div>
            </div>
        </div>
    );
}