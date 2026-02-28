import React from "react";

export default function Privacy() {
  return (
    <div style={styles.container}>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> February 27, 2026</p>

      <p>
        This Privacy Policy applies to the Shiko Lingo web application
        ("Application"), operated by Shiko Lingo ("Service Provider").
        The Application is accessible via web browsers and the official
        Pi Browser. This service is provided "AS IS".
      </p>

      <h2>Information We Collect</h2>
      <p>
        The Application collects limited information necessary to operate
        the learning platform, including:
      </p>
      <ul>
        <li>Pi Network user identifier (UID) when authenticated via Pi SDK</li>
        <li>Username provided by Pi Network</li>
        <li>Learning progress (lessons completed, scores)</li>
        <li>Technical information such as browser type and device type</li>
        <li>Basic usage analytics (pages visited, session duration)</li>
      </ul>

      <p>
        The Application does not collect precise location data.
      </p>

      <h2>Authentication & Payments</h2>
      <p>
        When accessed via the official Pi Browser, authentication and
        payments are processed using the Pi Network SDK. Shiko Lingo
        does not store passwords or private wallet information.
      </p>

      <h2>Artificial Intelligence</h2>
      <p>
        The Application uses Artificial Intelligence (AI) features to
        provide feedback and enhance learning experiences. AI processing
        may analyze lesson content and user performance data strictly
        for educational purposes.
      </p>
      <p>
        AI responses are generated automatically and may not always be
        fully accurate. Users are encouraged to use AI feedback as
        supportive guidance.
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
        Learning progress and subscription data are retained for as long
        as the user account remains active. Users may request deletion
        of their data by contacting the Service Provider.
      </p>

      <h2>Children’s Privacy</h2>
      <p>
        The Application is not directed toward children under the age
        of 13. The Service Provider does not knowingly collect personal
        data from children.
      </p>

      <h2>Security</h2>
      <p>
        Reasonable administrative and technical measures are implemented
        to protect user data. However, no method of electronic storage
        or transmission over the internet is 100% secure.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        This Privacy Policy may be updated periodically. Continued use
        of the Application after updates constitutes acceptance of the
        revised policy.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions regarding this Privacy Policy,
        please contact:
        <br />
        <strong>Email:</strong> egyptianpharoah71@gmail.com
      </p>
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