import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type SelectUser, loginAttempts, riskFactors } from "@db/schema";
import { db } from "@db";
import { eq, and, desc } from "drizzle-orm";

const scryptAsync = promisify(scrypt);
const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

declare global {
  namespace Express {
    interface User extends SelectUser { }
  }
}

async function calculateRiskScore(userId: number, ipAddress: string, userAgent: string): Promise<number> {
  const recentAttempts = await db
    .select()
    .from(loginAttempts)
    .where(and(
      eq(loginAttempts.userId, userId),
      eq(loginAttempts.successful, false)
    ))
    .orderBy(desc(loginAttempts.timestamp))
    .limit(5);

  let riskScore = 0;

  // Check for failed login attempts
  if (recentAttempts.length >= 3) {
    riskScore += 30;
  }

  // Check for login from new IP
  const knownIPs = await db
    .select()
    .from(loginAttempts)
    .where(and(
      eq(loginAttempts.userId, userId),
      eq(loginAttempts.successful, true)
    ))
    .limit(10);

  const isKnownIP = knownIPs.some(attempt => attempt.ipAddress === ipAddress);
  if (!isKnownIP) {
    riskScore += 20;
  }

  // Check for unusual user agent
  const isKnownUserAgent = knownIPs.some(attempt => attempt.userAgent === userAgent);
  if (!isKnownUserAgent) {
    riskScore += 10;
  }

  return riskScore;
}

async function recordLoginAttempt(
  userId: number,
  successful: boolean,
  ipAddress: string,
  userAgent: string,
  score: number
) {
  await db.insert(loginAttempts).values({
    userId,
    successful,
    ipAddress,
    userAgent,
    score,
    riskFactors: {
      newIP: !knownIPs.includes(ipAddress),
      newUserAgent: !knownUserAgents.includes(userAgent),
      recentFailedAttempts: recentAttempts.length
    }
  });

  // Update user's risk score
  await db
    .update(users)
    .set({ 
      riskScore: score,
      lastLoginAt: new Date()
    })
    .where(eq(users.id, userId));

  // Record high-risk factors if score is high
  if (score > 50) {
    await db.insert(riskFactors).values({
      userId,
      type: 'login_risk',
      severity: score > 70 ? 'high' : 'medium',
      details: {
        score,
        ipAddress,
        userAgent
      }
    });
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "cyber-warfare-platform",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        // Calculate risk score before password verification
        const ipAddress = req.ip;
        const userAgent = req.get('user-agent') || 'unknown';
        const riskScore = await calculateRiskScore(user.id, ipAddress, userAgent);

        const isMatch = await crypto.compare(password, user.password);

        // Record the login attempt
        await recordLoginAttempt(
          user.id,
          isMatch,
          ipAddress,
          userAgent,
          riskScore
        );

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        // Handle high-risk logins
        if (riskScore > 70) {
          return done(null, false, { 
            message: "Access denied due to suspicious activity. Please contact support."
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
      }

      const { username, password } = result.data;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await crypto.hash(password);

      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          riskScore: 0,
          status: 'active'
        })
        .returning();

      req.login(newUser, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          message: "Registration successful",
          user: { id: newUser.id, username: newUser.username },
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
    }

    const cb = (err: any, user: Express.User, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send(info.message ?? "Login failed");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.json({
          message: "Login successful",
          user: { 
            id: user.id, 
            username: user.username,
            riskScore: user.riskScore,
            status: user.status
          },
        });
      });
    };
    passport.authenticate("local", cb)(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Logout failed");
      }

      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as Express.User;
      return res.json({
        id: user.id,
        username: user.username,
        riskScore: user.riskScore,
        status: user.status
      });
    }

    res.status(401).send("Not logged in");
  });
}