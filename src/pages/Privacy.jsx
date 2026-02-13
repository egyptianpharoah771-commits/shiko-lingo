import React from "react";

export default function Privacy() {
  return (
    <div style={styles.container}>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> January 7, 2026</p>

      <p>
        This privacy policy applies to the Shiko Lingo application ("Application")
        for mobile devices, created by Shiko Lingo ("Service Provider") as a free service.
        This service is provided "AS IS".
      </p>

      <h2>Information Collection and Use</h2>
      <p>
        The Application collects information when you download and use it. This
        information may include:
      </p>
      <ul>
        <li>Your device’s IP address</li>
        <li>Pages visited within the Application</li>
        <li>Time and date of access</li>
        <li>Time spent using the Application</li>
        <li>Mobile operating system used</li>
      </ul>

      <p>
        The Application does not collect precise location information.
      </p>

      <h2>Artificial Intelligence</h2>
      <p>
        The Application uses Artificial Intelligence (AI) technologies to enhance
        learning experiences and provide smart features. AI processing is performed
        in accordance with this Privacy Policy.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        The Application may use third-party services that have their own privacy
        policies, including:
      </p>
      <ul>
        <li>Google Play Services</li>
        <li>Facebook</li>
        <li>Pi Network SDK</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        User-provided data is retained for as long as the Application is used and
        for a reasonable time thereafter. You may request deletion by contacting us.
      </p>

      <h2>Children</h2>
      <p>
        The Application is not intended for children under the age of 13. The
        Service Provider does not knowingly collect personal data from children.
      </p>

      <h2>Security</h2>
      <p>
        Reasonable measures are taken to protect user information; however, no
        method of transmission or storage is 100% secure.
      </p>

      <h2>Changes</h2>
      <p>
        This Privacy Policy may be updated from time to time. Continued use of the
        Application indicates acceptance of the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact:
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
