import { useEffect } from "react";

export default function PrivacyPolicy() {
    useEffect(() => {
        document.body.classList.add('not-found');
    
        return () => {
            document.body.classList.remove('not-found');
        };
    }, []);
    return (
        <div className="privacy-page">
            <div className="container">
                <h1>Privacy Policy</h1>
                <p>Your privacy is extremely important to us. At CompressImagePro.com, we keep our privacy practices simple, transparent, and user-friendly.</p>
                <p>We do not collect, store, or share any personal data from our users.</p>
                <hr />
                <h3>1. No Personal Information Collected</h3>
                <p>CompressImagePro.com does not require:</p>
                <ul>
                    <li>Login or signup</li>
                    <li>Email address</li>
                    <li>Password</li>
                    <li>Personal profile creation</li>
                </ul>
                <p>Since no account is required, we do not store any personal information of any kind.</p>
                <hr />
                <h3>2. Your Images Are Yours</h3>
                <p>When you upload an image to CompressImagePro.com for compression or processing:</p>
                <ul>
                    <li>Your images remain 100% your property.</li>
                    <li>We temporarily store the file only for the purpose of processing.</li>
                    <li>All uploaded images are automatically deleted from our servers after the process is completed (typically within a short interval).</li>
                    <li>We do not analyze, share, or use your images for any other purpose.</li>
                </ul>
                <p>We never use your files for training, analytics, or any external processing.</p>
                <hr />
                <h3>3. No Cookies for Tracking</h3>
                <p>CompressImagePro.com does not use cookies or tracking mechanisms to collect:</p>
                <ul>
                    <li>Personal data</li>
                    <li>Browsing behavior</li>
                    <li>IP-based profiling</li>
                </ul>
                <p>Basic functional cookies (if used) are only for website performance and do not identify users personally.</p>
                <hr />
                <h3>4. Third-Party Services</h3>
                <p>Our website may use third-party services for analytics or advertisements (like Google AdSense) to support our platform.</p>
                <p>These services may use their own cookies or tracking as per their policies, not ours.</p>
                <p>CompressImagePro.com does not share or sell any data to these services.</p>
                <hr />
                <h3>5. External Links</h3>
                <p>Our site may contain links to external websites.</p>
                <p>We are not responsible for the privacy practices of those websites.</p>
                <p>We recommend reviewing their individual policies for more details.</p>
                <hr />
                <h3>6. Policy Updates</h3>
                <p>We may update this Privacy Policy from time to time.</p>
                <p>Whenever changes are made, we will post the updated version on this page.</p>
                <p>Continued use of the website after updates implies acceptance of the changes.</p>
                <hr />
                <h3>7. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, feel free to reach out at:</p>
            </div>
        </div>
    );
}