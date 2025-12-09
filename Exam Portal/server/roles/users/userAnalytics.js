// const express = require("express");
// const db = require("../config/db");

// const router = express.Router();



// function getContext(req) {
//   return {
//     userId: req.user?.id || null,
//     userRole: req.user?.role?.toUpperCase() || null,
//     orgId: req.user?.organizationId || null,
//     query: req.query || {},
//   };
// }

// async function validateUserOrg(userId, orgId) {
//   if (!userId || !orgId) return false;

//   const q = `SELECT organization_id FROM users WHERE id = $1`;
//   const r = await db.query(q, [userId]);

//   if (!r.rows.length) return false;
//   return Number(r.rows[0].organization_id) === Number(orgId);
// }

// function buildDateFilter(period) {
//   switch (String(period).toLowerCase()) {
//     case "month":
//       return "AND ue.attempted_at >= NOW() - INTERVAL '30 days'";
//     case "3months":
//       return "AND ue.attempted_at >= NOW() - INTERVAL '90 days'";
//     case "6months":
//       return "AND ue.attempted_at >= NOW() - INTERVAL '180 days'";
//     case "year":
//       return "AND ue.attempted_at >= NOW() - INTERVAL '365 days'";
//     default:
//       return "";
//   }
// }

// async function verifyUserAndOrg(req, res) {
//   const { userId, userRole, orgId, query } = getContext(req);

//   if (!userId) {
//     res.status(400).json({ success: false, message: "User not found" });
//     return null;
//   }

//   if (userRole !== "USER") {
//     res.status(403).json({ success: false, message: "Unauthorized" });
//     return null;
//   }

//   if (orgId && !(await validateUserOrg(userId, orgId))) {
//     res.status(403).json({
//       success: false,
//       message: "User does not belong to this organization",
//     });
//     return null;
//   }

//   return { userId, userRole, orgId, query };
// }



// router.get("/analytics/summary", async (req, res) => {
//   try {
//     const ctx = await verifyUserAndOrg(req, res);
//     if (!ctx) return;

//     const { userId, orgId, query } = ctx;
//     const { period = "all" } = query;
//     const dateFilter = buildDateFilter(period);

//     const totalQ = `
//       SELECT COUNT(*)::int AS total_exams
//       FROM exams e
//       WHERE e.is_active = TRUE
//       ${orgId ? "AND e.organization_id = $1" : ""}
//     `;
//     const totalR = await db.query(totalQ, orgId ? [orgId] : []);
//     const totalExams = totalR.rows[0]?.total_exams || 0;

//     const attemptedQ = `
//       SELECT COUNT(DISTINCT ue.exam_id)::int AS attempted_exams
//       FROM user_exams ue
//       JOIN exams e ON e.id = ue.exam_id
//       WHERE ue.user_id = $1
//       ${orgId ? "AND e.organization_id = $2" : ""}
//       ${dateFilter}
//     `;
//     const attemptedR = await db.query(
//       attemptedQ,
//       orgId ? [userId, orgId] : [userId]
//     );

//     const attemptedExams = attemptedR.rows[0]?.attempted_exams || 0;
//     const pendingExams = Math.max(totalExams - attemptedExams, 0);
//     const completionRate =
//       totalExams > 0
//         ? Number(((attemptedExams / totalExams) * 100).toFixed(1))
//         : 0;

//     res.json({
//       success: true,
//       data: {
//         totalExams,
//         attempted: attemptedExams,
//         pending: pendingExams,
//         completionRate,
//       },
//     });
//   } catch (err) {
//     console.error("Analytics summary error:", err);
//     res.status(500).json({ success: false, message: "Failed to load summary" });
//   }
// });



// router.get("/analytics/performance", async (req, res) => {
//   try {
//     const ctx = await verifyUserAndOrg(req, res);
//     if (!ctx) return;

//     const { userId, orgId, query } = ctx;
//     const { period = "all" } = query;
//     const dateFilter = buildDateFilter(period);

//     const perfQ = `
//       SELECT
//         COALESCE(ROUND(AVG(ue.score), 2), 0) AS avg_score,
//         COALESCE(MAX(ue.score), 0) AS highest_score,
//         COALESCE(MIN(ue.score), 0) AS lowest_score
//       FROM user_exams ue
//       JOIN exams e ON e.id = ue.exam_id
//       WHERE ue.user_id = $1
//       ${orgId ? "AND e.organization_id = $2" : ""}
//       ${dateFilter}
//     `;
//     const perfR = await db.query(perfQ, orgId ? [userId, orgId] : [userId]);

//     const recentScoresQ = `
//       SELECT ue.score
//       FROM user_exams ue
//       JOIN exams e ON e.id = ue.exam_id
//       WHERE ue.user_id = $1
//       ${orgId ? "AND e.organization_id = $2" : ""}
//       ORDER BY ue.attempted_at DESC
//       LIMIT 6
//     `;
//     const recentR = await db.query(
//       recentScoresQ,
//       orgId ? [userId, orgId] : [userId]
//     );

//     const scores = recentR.rows.map((r) => Number(r.score));
//     let improvementPercent = 0;

//     if (scores.length >= 4) {
//       const recent = scores.slice(0, 3);
//       const previous = scores.slice(3);

//       const avgRecent = recent.reduce((a, b) => a + b) / recent.length;
//       const avgPrev = previous.reduce((a, b) => a + b) / previous.length;

//       if (avgPrev > 0) {
//         improvementPercent = Number(
//           (((avgRecent - avgPrev) / avgPrev) * 100).toFixed(1)
//         );
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         averageScore: Number(perfR.rows[0].avg_score),
//         highestScore: Number(perfR.rows[0].highest_score),
//         lowestScore: Number(perfR.rows[0].lowest_score),
//         improvementPercent,
//       },
//     });
//   } catch (err) {
//     console.error("Performance error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load performance metrics",
//     });
//   }
// });



// router.get("/analytics/ranks", async (req, res) => {
//   try {
//     const ctx = await verifyUserAndOrg(req, res);
//     if (!ctx) return;

//     const { userId, orgId, query } = ctx;
//     const { period = "all" } = query;
//     const dateFilter = buildDateFilter(period);

//     const q = `
//       SELECT ue.exam_id, ue.exam_rank, ue.attempted_at, e.exam_type
//       FROM user_exams ue
//       JOIN exams e ON e.id = ue.exam_id
//       WHERE ue.user_id = $1
//       ${orgId ? "AND e.organization_id = $2" : ""}
//       AND ue.exam_rank IS NOT NULL
//       ${dateFilter}
//       ORDER BY ue.attempted_at DESC
//     `;
//     const r = await db.query(q, orgId ? [userId, orgId] : [userId]);
//     const rows = r.rows;

//     let averageRank = null;
//     let lastExamRank = null;
//     let recentExamRank = null;
//     let practicalExamRank = null;

//     if (rows.length) {
//       const all = rows.map((x) => Number(x.exam_rank));
//       averageRank = all.reduce((a, b) => a + b) / all.length;
//       lastExamRank = Number(rows[0].exam_rank);

//       const rec = rows.slice(0, 3).map((x) => Number(x.exam_rank));
//       recentExamRank = Math.min(...rec);

//       const prac = rows
//         .filter((x) => String(x.exam_type).toUpperCase() === "PRACTICAL")
//         .map((x) => Number(x.exam_rank));

//       if (prac.length) {
//         practicalExamRank =
//           prac.reduce((a, b) => a + b) / prac.length;
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         averageRank,
//         lastExamRank,
//         recentExamRank,
//         practicalExamRank,
//       },
//     });
//   } catch (err) {
//     console.error("Rank analytics error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load rank analytics",
//     });
//   }
// });

// /* ===========================================================
//    4️⃣ Exam-wise Chart (Top 10)
//    =========================================================== */

// router.get("/analytics/exams-chart", async (req, res) => {
//   try {
//     const ctx = await verifyUserAndOrg(req, res);
//     if (!ctx) return;

//     const { userId, orgId } = ctx;

//     const q = `
//       SELECT e.id, e.title,
//       COALESCE(ue.score, 0) AS score
//       FROM exams e
//       LEFT JOIN user_exams ue
//         ON ue.exam_id = e.id AND ue.user_id = $1
//       WHERE e.is_active = TRUE
//       ${orgId ? "AND e.organization_id = $2" : ""}
//       ORDER BY e.start_time ASC NULLS LAST
//       LIMIT 10
//     `;

//     const r = await db.query(q, orgId ? [userId, orgId] : [userId]);

//     res.json({
//       success: true,
//       data: r.rows.map((x) => ({
//         examId: x.id,
//         examTitle: x.title,
//         score: Number(x.score),
//       })),
//     });
//   } catch (err) {
//     console.error("Exam chart error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load exam chart",
//     });
//   }
// });

// /* ===========================================================
//    5️⃣ Subject-wise Average Scores
//    =========================================================== */

// router.get("/analytics/subjects-chart", async (req, res) => {
//   try {
//     const ctx = await verifyUserAndOrg(req, res);
//     if (!ctx) return;

//     const { userId, orgId, query } = ctx;
//     const { period = "all" } = query;
//     const dateFilter = buildDateFilter(period);

//     const q = `
//       SELECT e.subject,
//       ROUND(AVG(ue.score), 2) AS avg_score
//       FROM user_exams ue
//       JOIN exams e ON e.id = ue.exam_id
//       WHERE ue.user_id = $1
//       ${orgId ? "AND e.organization_id = $2" : ""}
//       ${dateFilter}
//       GROUP BY e.subject
//       ORDER BY e.subject
//     `;

//     const r = await db.query(q, orgId ? [userId, orgId] : [userId]);

//     res.json({
//       success: true,
//       data: r.rows.map((x) => ({
//         subject: x.subject,
//         averageScore: Number(x.avg_score),
//       })),
//     });
//   } catch (err) {
//     console.error("Subjects chart error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load subject performance",
//     });
//   }
// });

// /* ===========================================================
//    6️⃣ EXAM-WISE PERFORMANCE (6 SEMESTERS)
//    =========================================================== */

// router.get("/analytics/examwise-performance", async (req, res) => {
//   try {
//     const ctx = await verifyUserAndOrg(req, res);
//     if (!ctx) return;

//     const { userId, orgId, query } = ctx;
//     let { semester = "all" } = query;

//     const valid = ["1", "2", "3", "4", "5", "6", "all"];
//     if (!valid.includes(String(semester))) {
//       return res.status(400).json({
//         success: false,
//         message: "Semester must be 1-6 or 'all'",
//       });
//     }

//     let semFilter = "";
//     if (semester !== "all") {
//       semFilter = `AND e.semester = ${Number(semester)}`;
//     }

//     const q = `
//       SELECT 
//         e.subject,
//         e.semester,
//         COALESCE(AVG(ue.score), 0) AS avg_score
//       FROM exams e
//       LEFT JOIN user_exams ue
//         ON ue.exam_id = e.id AND ue.user_id = $1
//       WHERE e.is_active = TRUE
//       ${orgId ? "AND e.organization_id = $2" : ""}
//       ${semFilter}
//       GROUP BY e.subject, e.semester
//       ORDER BY e.semester ASC, e.subject ASC
//     `;

//     const r = await db.query(q, orgId ? [userId, orgId] : [userId]);

//     res.json({
//       success: true,
//       data: {
//         semester,
//         performance: r.rows.map((x) => ({
//           subject: x.subject,
//           semester: x.semester,
//           averageScore: Number(x.avg_score),
//         })),
//       },
//     });
//   } catch (err) {
//     console.error("Examwise performance error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load exam-wise performance",
//     });
//   }
// });

// module.exports = router;
const express = require("express");
const db = require("../config/db");

const router = express.Router();

/* ===========================================================
   COMMON HELPERS
   =========================================================== */

function getContext(req) {
  return {
    userId: req.user?.id || null,
    userRole: req.user?.role?.toUpperCase() || null,
    orgId: req.user?.organizationId || null,
    query: req.query || {},
  };
}

async function validateUserOrg(userId, orgId) {
  if (!userId || !orgId) return false;

  const q = `SELECT organization_id FROM users WHERE id = $1`;
  const r = await db.query(q, [userId]);

  if (!r.rows.length) return false;
  return Number(r.rows[0].organization_id) === Number(orgId);
}

// 🔹 Only 6 months & 1 year now
function buildDateFilter(period) {
  switch (String(period || "").toLowerCase()) {
    case "6months":
      return "AND ue.attempted_at >= NOW() - INTERVAL '6 months'";
    case "1year":
      return "AND ue.attempted_at >= NOW() - INTERVAL '12 months'";
    default:
      return ""; // no filter → all data
  }
}

async function verifyUserAndOrg(req, res) {
  const { userId, userRole, orgId, query } = getContext(req);

  if (!userId) {
    res.status(400).json({ success: false, message: "User not found" });
    return null;
  }

  if (userRole !== "USER") {
    res.status(403).json({ success: false, message: "Unauthorized" });
    return null;
  }

  if (orgId && !(await validateUserOrg(userId, orgId))) {
    res.status(403).json({
      success: false,
      message: "User does not belong to this organization",
    });
    return null;
  }

  return { userId, userRole, orgId, query };
}

/* ===========================================================
   1️⃣ Exam Summary Card
   =========================================================== */

router.get("/analytics/summary", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { period } = query;
    const dateFilter = buildDateFilter(period);

    const totalQ = `
      SELECT COUNT(*)::int AS total_exams
      FROM exams e
      WHERE e.is_active = TRUE
      ${orgId ? "AND e.organization_id = $1" : ""}
    `;
    const totalR = await db.query(totalQ, orgId ? [orgId] : []);
    const totalExams = totalR.rows[0]?.total_exams || 0;

    const attemptedQ = `
      SELECT COUNT(DISTINCT ue.exam_id)::int AS attempted_exams
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      ${dateFilter}
    `;
    const attemptedR = await db.query(
      attemptedQ,
      orgId ? [userId, orgId] : [userId]
    );

    const attemptedExams = attemptedR.rows[0]?.attempted_exams || 0;
    const pendingExams = Math.max(totalExams - attemptedExams, 0);
    const completionRate =
      totalExams > 0
        ? Number(((attemptedExams / totalExams) * 100).toFixed(1))
        : 0;

    res.json({
      success: true,
      data: {
        totalExams,
        attempted: attemptedExams,
        pending: pendingExams,
        completionRate,
      },
    });
  } catch (err) {
    console.error("Analytics summary error:", err);
    res.status(500).json({ success: false, message: "Failed to load summary" });
  }
});

/* ===========================================================
   2️⃣ Performance Metrics Card
   =========================================================== */

router.get("/analytics/performance", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { period } = query;
    const dateFilter = buildDateFilter(period);

    const perfQ = `
      SELECT
        COALESCE(ROUND(AVG(ue.score), 2), 0) AS avg_score,
        COALESCE(MAX(ue.score), 0) AS highest_score,
        COALESCE(MIN(ue.score), 0) AS lowest_score
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      ${dateFilter}
    `;
    const perfR = await db.query(perfQ, orgId ? [userId, orgId] : [userId]);

    const recentScoresQ = `
      SELECT ue.score
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      ${dateFilter}
      ORDER BY ue.attempted_at DESC
      LIMIT 6
    `;
    const recentR = await db.query(
      recentScoresQ,
      orgId ? [userId, orgId] : [userId]
    );

    const scores = recentR.rows.map((r) => Number(r.score));
    let improvementPercent = 0;

    if (scores.length >= 4) {
      const recent = scores.slice(0, 3);
      const previous = scores.slice(3);

      const avgRecent = recent.reduce((a, b) => a + b) / recent.length;
      const avgPrev = previous.reduce((a, b) => a + b) / previous.length;

      if (avgPrev > 0) {
        improvementPercent = Number(
          (((avgRecent - avgPrev) / avgPrev) * 100).toFixed(1)
        );
      }
    }

    res.json({
      success: true,
      data: {
        averageScore: Number(perfR.rows[0].avg_score),
        highestScore: Number(perfR.rows[0].highest_score),
        lowestScore: Number(perfR.rows[0].lowest_score),
        improvementPercent,
      },
    });
  } catch (err) {
    console.error("Performance error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load performance metrics",
    });
  }
});

/* ===========================================================
   3️⃣ Rank in Exam Card
   =========================================================== */

router.get("/analytics/ranks", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { period } = query;
    const dateFilter = buildDateFilter(period);

    const q = `
      SELECT ue.exam_id, ue.exam_rank, ue.attempted_at, e.exam_type
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      AND ue.exam_rank IS NOT NULL
      ${dateFilter}
      ORDER BY ue.attempted_at DESC
    `;
    const r = await db.query(q, orgId ? [userId, orgId] : [userId]);
    const rows = r.rows;

    let averageRank = null;
    let lastExamRank = null;
    let recentExamRank = null;
    let practicalExamRank = null;

    if (rows.length) {
      const all = rows.map((x) => Number(x.exam_rank));
      averageRank = all.reduce((a, b) => a + b) / all.length;
      lastExamRank = Number(rows[0].exam_rank);

      const rec = rows.slice(0, 3).map((x) => Number(x.exam_rank));
      recentExamRank = Math.min(...rec);

      const prac = rows
        .filter((x) => String(x.exam_type).toUpperCase() === "PRACTICAL")
        .map((x) => Number(x.exam_rank));

      if (prac.length) {
        practicalExamRank = prac.reduce((a, b) => a + b) / prac.length;
      }
    }

    res.json({
      success: true,
      data: {
        averageRank,
        lastExamRank,
        recentExamRank,
        practicalExamRank,
      },
    });
  } catch (err) {
    console.error("Rank analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load rank analytics",
    });
  }
});

/* ===========================================================
   4️⃣ Exam-wise Chart (Top 10 Exams)
   =========================================================== */

router.get("/analytics/exams-chart", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId } = ctx;

    const q = `
      SELECT 
        e.id, 
        e.title,
        COALESCE(ue.score, 0) AS score
      FROM exams e
      LEFT JOIN user_exams ue
        ON ue.exam_id = e.id AND ue.user_id = $1
      WHERE e.is_active = TRUE
      ${orgId ? "AND e.organization_id = $2" : ""}
      ORDER BY e.start_time ASC NULLS LAST
      LIMIT 10
    `;

    const r = await db.query(q, orgId ? [userId, orgId] : [userId]);

    res.json({
      success: true,
      data: r.rows.map((x) => ({
        examId: x.id,
        examTitle: x.title,
        score: Number(x.score),
      })),
    });
  } catch (err) {
    console.error("Exam chart error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load exam chart",
    });
  }
});

/* ===========================================================
   5️⃣ Subject-wise Average Scores
   =========================================================== */

router.get("/analytics/subjects-chart", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { period } = query;
    const dateFilter = buildDateFilter(period);

    const q = `
      SELECT e.subject,
             ROUND(AVG(ue.score), 2) AS avg_score
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      ${dateFilter}
      GROUP BY e.subject
      ORDER BY e.subject
    `;

    const r = await db.query(q, orgId ? [userId, orgId] : [userId]);

    res.json({
      success: true,
      data: r.rows.map((x) => ({
        subject: x.subject,
        averageScore: Number(x.avg_score),
      })),
    });
  } catch (err) {
    console.error("Subjects chart error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load subject performance",
    });
  }
});

/* ===========================================================
   6️⃣ EXAM-WISE PERFORMANCE (CALENDAR RANGE)
   =========================================================== */
/**
 * Frontend should call:
 *   /analytics/examwise-performance?from=2025-01-01&to=2025-03-31
 */
router.get("/analytics/examwise-performance", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { from, to } = query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Please provide 'from' and 'to' dates in YYYY-MM-DD format",
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "'from' date cannot be after 'to' date",
      });
    }

    // Build params dynamically so orgId is optional
    const params = [userId];
    let paramIndex = 2;

    params.push(from);
    const fromIdx = paramIndex++;
    params.push(to);
    const toIdx = paramIndex++;

    let orgFilter = "";
    if (orgId) {
      params.push(orgId);
      const orgIdx = paramIndex++;
      orgFilter = `AND e.organization_id = $${orgIdx}`;
    }

    const q = `
      SELECT 
        e.subject,
        COALESCE(AVG(ue.score), 0) AS avg_score
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      AND ue.attempted_at::date BETWEEN $${fromIdx} AND $${toIdx}
      ${orgFilter}
      GROUP BY e.subject
      ORDER BY e.subject ASC
    `;

    const r = await db.query(q, params);

    res.json({
      success: true,
      data: {
        from,
        to,
        performance: r.rows.map((x) => ({
          subject: x.subject,
          averageScore: Number(x.avg_score),
        })),
      },
    });
  } catch (err) {
    console.error("Examwise performance (calendar) error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load exam-wise performance",
    });
  }
});

module.exports = router;
