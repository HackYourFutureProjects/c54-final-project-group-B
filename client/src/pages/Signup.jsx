import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Country, City } from "country-state-city";

const Signup = () => {
  const { signup, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    country: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get all countries for the dropdown
  const countries = Country.getAllCountries();
  // Get cities based on selected country (stored as ISO Code usually, or Name if we handle mapping)
  // The library uses ISO codes for lookup.
  // We need to store standard names in DB as per plain text requirement,
  // but let's use the object values.

  // To keep it simple, we store Country Name in DB.
  // But we need ISO Code to find cities.
  // So we might need separate state for selected Country Code.
  const [selectedCountryCode, setSelectedCountryCode] = useState("");

  const cities = selectedCountryCode
    ? City.getCitiesOfCountry(selectedCountryCode)
    : [];

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleCountryChange(e) {
    const countryCode = e.target.value;
    const country = countries.find((c) => c.isoCode === countryCode);
    setSelectedCountryCode(countryCode);
    setFormData({
      ...formData,
      country: country ? country.name : "",
      city: "", // Reset city when country changes
    });
  }

  function handleCityChange(e) {
    setFormData({ ...formData, city: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Frontend Checks: Passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Complexity Check (basic regex matching backend requirements)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must have 1 Uppercase, 1 Number, 1 Symbol, Min 8 chars",
      );
      return;
    }

    // Prepare data (exclude confirmPassword) and call signup
    const res = await signup({
      ...formData,
      // confirmPassword is not sent to backend
    });
    if (res.success) {
      // If successful, redirect to verification page
      if (res.verificationCode) console.log("Your Code:", res.verificationCode);
      navigate("/verify-code", { state: { email: formData.email } });
    } else {
      setError(res.msg || "Signup failed");
    }
  }

  return (
    <div className="auth-form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9]+"
          title="3-30 alphanumeric characters"
          autoComplete="username"
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <small>Must include specific chars (Upper, Number, Symbol)</small>

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <label htmlFor="country">Country</label>
        <select
          id="country"
          name="country"
          onChange={handleCountryChange}
          value={selectedCountryCode}
          required
          style={{ width: "100%", padding: "0.5rem" }}
          autoComplete="country-name"
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>

        <label htmlFor="city">City</label>
        <select
          id="city"
          name="city"
          onChange={handleCityChange}
          value={formData.city}
          required
          disabled={!selectedCountryCode}
          style={{ width: "100%", padding: "0.5rem" }}
          autoComplete="address-level2"
        >
          <option value="">Select City</option>
          {cities.map((city, index) => (
            <option key={`${city.name}-${index}`} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>

        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          required
          rows="3"
          style={{ width: "100%", padding: "0.5rem" }}
          autoComplete="off"
        />
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Signup;
