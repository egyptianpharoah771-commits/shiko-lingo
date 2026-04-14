import React from "react";

export default function Terms() {
  return (
    <div style={styles.container}>
      <h1>Terms &amp; Conditions</h1>

      <p>
        These Terms &amp; Conditions govern your use of the Shiko Lingo web
        application ("Application"), available at{" "}
        <a href="https://shikolingo.site" target="_blank" rel="noopener noreferrer">
          https://shikolingo.site
        </a>
        , operated by Shiko Lingo ("Service Provider").
      </p>

      <p>
        By accessing or using the Application, including through the official
        Pi Browser, you agree to be bound by these Terms. If you do not agree,
        please discontinue use of the Application.
      </p>

      <h2>1. Use of the Application</h2>
      <p>
        You agree to use the Application only for lawful educational purposes.
        Unauthorized copying, modification, reverse engineering, scraping,
        redistribution, or exploitation of the Application or its content
        is strictly prohibited.
      </p>

      <h2>2. Accounts &amp; Authentication</h2>
      <p>
        When using the Application inside the official Pi Browser, authentication
        is processed exclusively via the Pi Network SDK. No email accounts,
        Google login, or other third-party authentication methods are used.
        The Service Provider does not store passwords or private wallet data.
      </p>

      <h2>3. Subscriptions &amp; Payments</h2>
      <p>
        Certain features require an active subscription. All payments within
        the Application are made exclusively in Pi. No fiat currency, credit
        cards, or other tokens are accepted or processed. Payments made via
        Pi Network are subject to Pi Network's own policies. Subscription
        access may be limited, suspended, or revoked in cases of abuse or
        violation of these Terms.
      </p>

      <h2>4. Artificial Intelligence Features</h2>
      <p>
        The Application may provide AI-generated feedback and learning
        assistance. AI responses are automatically generated and may not
        always be accurate or complete.
      </p>
      <p>
        AI features are provided "as is" without warranties of any kind.
        Users remain responsible for how they interpret and apply AI feedback.
      </p>

      <h2>5. Third-Party Services</h2>
      <p>
        The Application may rely on third-party services including:
      </p>
      <ul>
        <li>Pi Network SDK (authentication and payments)</li>
        <li>Hosting providers for application deployment</li>
      </ul>
      <p>
        The Application does not use Facebook login or Google Play Services.
      </p>

      <h2>6. Availability</h2>
      <p>
        The Service Provider may modify, suspend, or discontinue the Application
        (or any part of it) at any time without notice. Continuous availability
        is not guaranteed.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        The Service Provider shall not be liable for any indirect, incidental,
        consequential, or special damages arising from the use or inability to
        use the Application.
      </p>

      <h2>8. Data &amp; Privacy</h2>
      <p>
        Use of the Application is also governed by our Privacy Policy, available
        at{" "}
        <a href="https://shikolingo.site/privacy" target="_blank" rel="noopener noreferrer">
          https://shikolingo.site/privacy
        </a>
        . By using the Application, you agree to the collection and use of
        information as described therein.
      </p>

      <h2>9. Changes to These Terms</h2>
      <p>
        These Terms may be updated periodically. Continued use of the Application
        after updates constitutes acceptance of the revised Terms.
      </p>

      <p>
        <strong>Effective date:</strong> February 27, 2026
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions regarding these Terms, please contact:
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
