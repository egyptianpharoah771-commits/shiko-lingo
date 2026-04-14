import React from "react";

export default function Privacy() {
  return (
    <div style={styles.container}>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> February 27, 2026</p>

      <p>
        This Privacy Policy applies to the Shiko Lingo web application
        ("Application"), available at{" "}
        <a href="https://shikolingo.site" target="_blank" rel="noopener noreferrer">
          https://shikolingo.site
        </a>
        , operated by Shiko Lingo ("Service Provider"). The Application is
        accessible via web browsers and the official Pi Browser. This service
        is provided "AS IS".
      </p>

      <h2>Information We Collect</h2>
      <p>
        The Application collects only the minimum data necessary to operate
        the learning platform, including:
      </p>
      <ul>
        <li>Pi Network user identifier (UID) when authenticated via Pi SDK</li>
        <li>Username provided by Pi Network</li>
        <li>Learning progress (lessons completed, scores)</li>
        <li>Technical information such as browser type and device type</li>
        <li>Basic usage analytics (pages visited, session duration)</li>
      </ul>

      <h2>Information We Do Not Collect</h2>
      <p>
        The Application does <strong>not</strong> collect any of the following:
      </p>
      <ul>
        <li>Email addresses</li>
        <li>Phone numbers</li>
        <li>Precise or approximate location data</li>
        <li>Passwords or private wallet information</li>
        <li>Payment card details or fiat currency information</li>
      </ul>
      <p>
        Only data essential to the Application's core functionality is collected.
        No unnecessary personal information is gathered or stored.
      </p>

      <h2>Authentication &amp; Payments</h2>
      <p>
        When accessed via the official Pi Browser, authentication and payments
        are processed exclusively using the Pi Network SDK. All transactions
        within the Application are conducted in Pi only. No fiat currency or
        third-party payment methods are used or accepted. Shiko Lingo does not
        store passwords or private wallet information.
      </p>

      <h2>Artificial Intelligence</h2>
      <p>
        The Application uses Artificial Intelligence (AI) features to provide
        feedback and enhance learning experiences. AI processing may analyze
        lesson content and user performance data strictly for educational purposes.
      </p>
      <p>
        AI responses are generated automatically and may not always be fully
        accurate. Users are encouraged to use AI feedback as supportive guidance.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        The Application may rely on the following third-party services:
      </p>
      <ul>
        <li>Pi Network SDK (authentication and payments)</li>
        <li>Hosting provider (for application deployment)</li>
      </ul>
      <p>
        The Application does not use Facebook login or Google Play Services.
      </p>

      <h2>Data Retention</h2>
      <p>
        Learning progress and subscription data are retained for as long as the
        user account remains active. Users may request deletion of their data
        by contacting the Service Provider.
      </p>

      <h2>Children's Privacy</h2>
      <p>
        The Application is not directed toward children under the age of 13.
        The Service Provider does not knowingly collect personal data from children.
      </p>

      <h2>Security</h2>
      <p>
        Reasonable administrative and technical measures are implemented to
        protect user data. However, no method of electronic storage or
        transmission over the internet is 100% secure.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        This Privacy Policy may be updated periodically. Continued use of the
        Application after updates constitutes acceptance of the revised policy.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions regarding this Privacy Policy, please contact:
      </p>
      <ul>
        <li><strong>Website:</strong>{" "}
          <a href="https://shikolingo.site" target="_blank" rel="noopener noreferrer">
            https://shikolingo.site
          </a>
        </li>
        <li><strong>Email:</strong> egyptianpharoah71@gmail.com</li>
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 20,
    lineHeight: 1.7,
  },
};
