

import { useState } from "react";
import "./ContactUs.css";
import { sendFeedback } from "../../api";

export default function ContactUs() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+63");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const maxLength = 120;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setStatusMessage("");

    try {
      await sendFeedback({
        name: firstName.trim(),
        lastname: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() ? `${countryCode} ${phone.trim()}` : "",
        description: message.trim(),
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCountryCode("+63");
      setStatus("sent");
      setStatusMessage("Message sent. We will get back to you soon.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Could not send your message.");
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-wrapper">
        {/* Left Column */}
        <div className="contact-left">
          <h1 className="contact-heading">Contact Us</h1>
          <p className="contact-subtext">
            Email, call or complete the form to learn how{" "}
            <strong>AlgoSensei</strong> can solve your message problem.
          </p>

          <div className="contact-info">
            <a href="mailto:algosensei@gmail.com" className="contact-link">
              algosensei@gmail.com
            </a>
            <a href="tel:09123456789" className="contact-link contact-phone">09123-456-789</a>
            <a href="mailto:algosensei@gmail.com?subject=Customer%20Support" className="contact-link">
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
              We value your feedback and are continuously working to improve{" "}
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
          <p className="form-subtext">
            Tell us what you are building, where you are stuck, or what kind of support you need.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                className="form-input"
                placeholder="First name"
                aria-label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Last name"
                aria-label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <input
              type="email"
              className="form-input full"
              placeholder="Email Address"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="phone-row">
              <label className="sr-only" htmlFor="contact-country-code">
                Country code
              </label>
              <select
                id="contact-country-code"
                className="phone-prefix"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+63">🇵🇭 Philippines (+63)</option>
                <option value="+62">🇮🇩 Indonesia (+62)</option>
                <option value="+1">🇺🇸 United States (+1)</option>
                <option value="+44">🇬🇧 United Kingdom (+44)</option>
              </select>
              <input
                type="tel"
                className="form-input phone-input"
                placeholder="Phone number"
                aria-label="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="textarea-wrapper">
              <textarea
                className="form-textarea"
                placeholder="How can we help? Share your question, issue, or goal."
                maxLength={maxLength}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-label="How can we help"
                required
              />
              <span className="char-count">
                {message.length}/{maxLength}
              </span>
            </div>

            <button className="submit-btn" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send message"}
            </button>

            {(status === "sending" || statusMessage) && (
              <div className={`form-status-wrap ${status === "sending" ? "form-status-wrap-sending" : "form-status-wrap-visible"}`}>
                <p className={`form-status ${status === "error" ? "form-status-error" : "form-status-success"}`}>
                  {status === "sending" ? "Sending your message..." : statusMessage}
                </p>
              </div>
            )}

            <p className="form-disclaimer">
              By contacting us, you agree to our{" "}
              <a href="/terms" className="disclaimer-link">
                Terms of service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="disclaimer-link">
                Privacy Policy
              </a>
            </p>
          </form>
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
