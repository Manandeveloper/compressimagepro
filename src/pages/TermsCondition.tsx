import { useEffect } from "react";

export default function TermsCondition() {
    useEffect(() => {
        document.body.classList.add('not-found');
    
        return () => {
            document.body.classList.remove('not-found');
        };
    }, []);
    return (
        <div className="privacy-page">
            <div className="container">
                <h1>Terms & Conditions</h1>
                <p><strong>Last Updated:</strong> 11-Dec-2025 </p>
                <p>Welcome to CompressImagePro.com. By accessing or using our website and tools, you agree to the following Terms & Conditions. Please read them carefully before using our services.</p>
                <hr />
                <h3>1. Acceptance of Terms</h3>
                <p>By using CompressImagePro.com, you agree to comply with and be bound by these Terms & Conditions.</p>
                <p>If you do not agree, please discontinue using our website.</p>
                <hr />
                <h3>2. Use of Our Service</h3>
                <p>CompressImagePro.com provides online tools for image compression and related features.</p>
                <p>You agree not to use our service for:</p>
                <ul>
                    <li>Uploading illegal, harmful, or copyrighted content you do not own.</li>
                    <li>Distributing malware, viruses, or harmful software.</li>
                    <li>Violating any laws, regulations, or third-party rights.</li>
                </ul>
                <p>We reserve the right to block or restrict access to users who misuse the service.</p>
                <hr />
                <h3>3. Ownership of Images</h3>
                <p>You retain full ownership of the images you upload.</p>
                <p>We do not claim rights over your content.</p>
                <p>Uploaded images are only used temporarily for processing and are automatically deleted shortly after the process is completed.</p>
                <hr />
                <h3>4. No Warranty / “As-Is” Service</h3>
                <p>All tools and features on CompressImagePro.com are provided on an "as-is" and “as-available” basis.</p>
                <p>We do not guarantee:</p>
                <ul>
                    <li>Uninterrupted service</li>
                    <li>100% accuracy</li>
                    <li>Error-free functionality</li>
                    <li>Permanent availability of features</li>
                </ul>
                <p>You use the website at your own risk.</p>
                <hr />
                <h3>5. Limitation of Liability</h3>
                <p>CompressImagePro.com shall not be held responsible for:</p>
                <ul>
                    <li>Loss of data</li>
                    <li>Service interruptions</li>
                    <li>Any direct, indirect, incidental, or consequential damages</li>
                    <li>Issues caused by third-party services or ads</li>
                </ul>
                <p>Your use of the service signifies that you accept these limitations.</p>
                <hr />
                <h3>6. Third-Party Links & Ads</h3>
                <p>Our website may display ads or contain links to external websites.</p>
                <p>We are not responsible for:</p>
                <ul>
                    <li>Content on third-party websites</li>
                    <li>Their policies</li>
                    <li>Their security practices</li>
                </ul>
                <p>Users should review third-party terms before interacting with them.</p>
                <hr />
                <h3>Changes to Terms</h3>
                <p>We reserve the right to update or modify these Terms & Conditions anytime.</p>
                <p>Updates will be posted on this page. Continued use of the website indicates acceptance of the revised terms.</p>
                <hr />
                <h3>8. Contact Information</h3>
                <p>If you have questions about these Terms & Conditions, contact us at:</p>
            </div>
        </div>
    );
}