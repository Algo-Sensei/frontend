

import { useState } from "react";
import "./ContactUs.css";

export default function ContactUs() {
  const [message, setMessage] = useState("");
  const maxLength = 120;

  return (
    <div className="contact-page">
      <div className="contact-wrapper">
        {/* Left Column */}
        <div className="contact-left">
          <h1 className="contact-heading">Contacts Us</h1>
          <p className="contact-subtext">
            Email, call or complete the form to learn how{" "}
            <strong>AlgoSensei</strong> can solve your message problem.
          </p>

          <div className="contact-info">
            <a href="mailto:algosensei@gmail.com" className="contact-link">
              algosensei@gmail.com
            </a>
            <span className="contact-phone">09123-456-789</span>
            <a href="#" className="contact-link">
              Customer Support
            </a>
          </div>

          <div className="contact-section">
            <h3 className="section-title">Customer Support</h3>
            <p className="section-text">
              Our support team is available around the clock to address any
              concerns or queries you may have.
            </p>
          </div>
        </div>

        {/* Middle Column */}
        <div className="contact-middle">
          <div className="contact-section">
            <h3 className="section-title bold">Feedback and Suggestions</h3>
            <p className="section-text">
              We value your feedback and are continuously working to imporve{" "}
              <strong>AlgoSensei</strong>. Your input is crucial in shaping the
              future of <strong>AlgoSensei</strong>.
            </p>
          </div>

          <div className="contact-section">
            <h3 className="section-title bold">Media Inquiries</h3>
            <p className="section-text">
              For media-related questions or press inquiries, please contact us
              at algosensei@icloud.com.
            </p>
          </div>
        </div>

        {/* Right Column — Form */}
        <div className="contact-right">
          <h2 className="form-heading">Get in Touch</h2>
          <p className="form-subtext">You can reach us anytime</p>

          <div className="contact-form">
            <div className="form-row">
              <input
                type="text"
                className="form-input"
                placeholder="First name"
              />
              <input
                type="text"
                className="form-input"
                placeholder="Last name"
              />
            </div>

            <input
              type="email"
              className="form-input full"
              placeholder="Email Address"
            />

            <div className="phone-row">
              <span className="phone-prefix">+62</span>
              <input
                type="tel"
                className="form-input phone-input"
                placeholder="Phone number"
              />
            </div>

            <div className="textarea-wrapper">
              <textarea
                className="form-textarea"
                placeholder="How can we help?"
                maxLength={maxLength}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <span className="char-count">
                {message.length}/{maxLength}
              </span>
            </div>

            <button className="submit-btn">Submit</button>

            <p className="form-disclaimer">
              By contacting us, you agree to our{" "}
              <a href="#" className="disclaimer-link">
                Terms of service
              </a>{" "}
              and{" "}
              <a href="#" className="disclaimer-link">
                Private Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="contact-footer">
        <div className="footer-divider" />
        <p className="footer-text">© 2026 AlgoSensei. All rights reserved.</p>
      </footer>
    </div>
  );
}