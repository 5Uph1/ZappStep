"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password.length < 6) {
      setErrorMsg("Password harus minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "login") {
        // 1. Login dengan email & password
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Register — trigger Supabase otomatis insert ke profiles dengan role 'user'
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        setSuccessMsg(
          "Registrasi berhasil! Silakan cek email untuk verifikasi.",
        );
        setEmail("");
        setPassword("");
        setTimeout(() => {
          setActiveTab("login");
        }, 1500);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan yang tidak terduga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .hero-gradient {
          background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, #f5fbf5 100%);
        }
        .button-glow {
          box-shadow: 0 4px 20px -5px rgba(0, 105, 72, 0.4);
          background: linear-gradient(135deg, #00855d 0%, #006948 100%);
        }
        .button-glow:disabled { opacity: 0.6; cursor: not-allowed; }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-smoothing: antialiased;
        }
        .input-field {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border-radius: 8px;
          border: none;
          outline: none;
          background-color: #e9efe9;
          font-size: 16px;
          color: #171d19;
          transition: all 0.2s;
        }
        .input-field:focus { background-color: #fff; box-shadow: 0 0 0 2px #006948; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
      `}</style>

      <div
        style={{
          fontFamily: "Inter, sans-serif",
          backgroundColor: "#f5fbf5",
          color: "#171d19",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            height: "64px",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              color: "#0f172a",
            }}
          >
            ZeepStep
          </div>
          <span
            className="material-symbols-outlined"
            style={{ color: "#059669", cursor: "pointer" }}
          >
            shopping_bag
          </span>
        </header>

        {/* Main */}
        <main
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            paddingTop: "64px",
          }}
        >
          {/* Hero */}
          <section
            style={{
              position: "relative",
              height: "397px",
              overflow: "hidden",
              width: "100%",
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQW-eI65ZbpQ0k7vk0k_YmpjtBHLlEQXiJU3IwuSrGx-s858k8sKPfpQrrKkUOBXsY8CA3VVQbRRbr7uKjpMfyOUkS2jg34IGRWGn1wP8-FcxykM9Rx_JizRoigoNSBOOadFoA9VsggOiWFPUdBjhU0AftlP81Oxfb8r4S25Ce0oWaegrLNSriiLz2jB5-d9k4uUiLQ890UI0710IG4_f_6KoJSSimRqgi3GRt4gBSHj9MRMHFCeQQgHKWG8EqXFxeT7Su7w-YGzI0"
              alt="Sneaker Hero"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            <div
              className="hero-gradient"
              style={{ position: "absolute", inset: 0 }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                left: "24px",
                right: "24px",
              }}
            >
              <h1
                style={{
                  fontSize: "40px",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.04em",
                  color: "#2c322e",
                  marginBottom: "8px",
                  maxWidth: "300px",
                }}
              >
                Step Into The Future.
              </h1>
              <p style={{ fontSize: "16px", color: "#3d4a42", opacity: 0.8 }}>
                Exclusive drops. Kinetic style.
              </p>
            </div>
          </section>

          {/* Auth Card */}
          <section
            style={{
              padding: "0 16px 32px",
              marginTop: "-24px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              className="glass-panel"
              style={{
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "448px",
                margin: "0 auto",
                boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
              }}
            >
              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "24px",
                  padding: "4px",
                  borderRadius: "8px",
                  backgroundColor: "#eff5ef",
                }}
              >
                {(["login", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      backgroundColor:
                        activeTab === tab ? "#fff" : "transparent",
                      color: activeTab === tab ? "#006948" : "#3d4a42",
                      boxShadow:
                        activeTab === tab
                          ? "0 1px 3px rgba(0,0,0,0.1)"
                          : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {tab === "login" ? "Login" : "Register"}
                  </button>
                ))}
              </div>

              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                  color: "#171d19",
                  marginBottom: "16px",
                }}
              >
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </h2>

              {/* Error Message */}
              {errorMsg && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#ffdad6",
                    border: "1px solid #ffb4ab",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "18px",
                      color: "#ba1a1a",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    error
                  </span>
                  <p style={{ fontSize: "14px", color: "#93000a", margin: 0 }}>
                    {errorMsg}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#d1fadf",
                    border: "1px solid #6ee7a0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "18px",
                      color: "#006948",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    check_circle
                  </span>
                  <p style={{ fontSize: "14px", color: "#006948", margin: 0 }}>
                    {successMsg}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Email */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#3d4a42",
                      marginLeft: "4px",
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "20px",
                        color: "#6d7a72",
                      }}
                    >
                      mail
                    </span>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="input-field"
                      style={{ paddingLeft: "40px" }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#3d4a42",
                      marginLeft: "4px",
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "20px",
                        color: "#6d7a72",
                      }}
                    >
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="input-field"
                      style={{ paddingLeft: "40px", paddingRight: "48px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "20px", color: "#6d7a72" }}
                      >
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="button-glow mt-5"
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "9999px",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "transform 0.1s",
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseDown={(e) =>
                    !loading &&
                    (e.currentTarget.style.transform = "scale(0.98)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>
                        {activeTab === "login"
                          ? "Signing In..."
                          : "Creating Account..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {activeTab === "login" ? "Sign In" : "Create Account"}
                      </span>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px" }}
                      >
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          style={{
            marginTop: "auto",
            padding: "24px 16px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#3d4a42" }}>
            By signing in, you agree to our{" "}
            <Link
              href="#"
              style={{ color: "#006948", textDecoration: "underline" }}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              style={{ color: "#006948", textDecoration: "underline" }}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </div>
    </>
  );
}
