
import { jwtVerify, createRemoteJWKSet } from "jose";

let JWKS;

export async function verifyJWT(req, res, next) {
  try {
    const authBaseURL = process.env.BETTER_AUTH_URL;

    if (!authBaseURL) {
      console.error("BETTER_AUTH_URL is not configured");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    if (!JWKS) {
      JWKS = createRemoteJWKSet(
        new URL(`${authBaseURL}/api/auth/jwks`)
      );
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token is required",
      });
    }

    const token = authHeader.slice(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token",
      });
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authBaseURL,
      audience: authBaseURL,
    });

    if (!payload.id || !payload.sub || payload.id !== payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid user identity",
      });
    }

    req.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      image: payload.image || "",
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
}
