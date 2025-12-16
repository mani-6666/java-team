import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ===================== Super Admin Routes ============================
import Superadmin_Layout from "./components/Superadmin_Layout";
import Superadmin_Dashboard from "./roles/super_admin/Superadmin_Dashboard";
import Superadmin_ClientManagement from "./roles/super_admin/Superadmin_ClientManagement";
import Superadmin_SubscriptionManagement from "./roles/super_admin/Superadmin_SubscriptionManagement";
import Superadmin_Revenue from "./roles/super_admin/Superadmin_Revenue";
import Superadmin_Users from "./roles/super_admin/Superadmin_Users";
import Superadmin_Chatbox from "./roles/super_admin/Superadmin_Chatbox";

// ===================== Admin Routes ============================
import AdminDashboard from "./roles/admin/AdminDashboard";
import AdminExamMenu from "./roles/admin/AdminExamMenu";
import AdminExamManagement from "./roles/admin/AdminExamManagement";
import AdminUserManagement from "./roles/admin/AdminUserManagement";
import AdminStudyMaterials from "./roles/admin/AdminStudyMaterials";
import AdminAnalytics from "./roles/admin/AdminAnalytics";
import AdminChatbox from "./roles/admin/AdminChatbox";

// ===================== Invigilator Routes ============================
import InvigilatorLayout from "./components/InvigilatorLayout";
import InvigilatorDashboard from "./roles/invigilator/Invigilatordashboard";
import InvigilatorSubmissions from "./roles/invigilator/InvigilatorSubmissions";
import InvigilatorGradingQueue from "./roles/invigilator/InvigilatorGradingQueue";
import InvigilatorAnalytics from "./roles/invigilator/InvigilatorAnalytics";
import InvigilatorProfile from "./roles/invigilator/InvigilatorProfile";
import InvigilatorChatBox from "./roles/invigilator/InvigilatorChatBox";

// ===================== User Routes ============================
import UserDashboard from "./roles/user/UserDashboard";
import UserMyExam from "./roles/user/UserMyExam";
import UserStudyMaterials from "./roles/user/UserStudyMaterials";
import UserAnalytics from "./roles/user/UserAnalytics";
import UserAchievements from "./roles/user/UserAchievements";
import UserChatbox from "./roles/user/UserChatbox";

// ===================== Common Pages ============================
import PageNotFound from "./PageNotFound";
import Mainlogin from "./common_files/Mainlogin";
import Register from "./common_files/Register";
import ProtectedRoute from "./ProtectedRoute";
import UnAuthorize from "./UnAuthorize";

export const baseUrl = 'http://localhost:5000/api'
export default function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* ================= SUPER ADMIN ROUTES ================= */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin"]}
              element={
                <Superadmin_Layout>
                  <Superadmin_Dashboard />
                </Superadmin_Layout>
              }
            />
          }
        />

        <Route
          path="/super-admin/clients"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin"]}
              element={
                <Superadmin_Layout>
                  <Superadmin_ClientManagement />
                </Superadmin_Layout>
              }
            />
          }
        />

        <Route
          path="/super-admin/subscriptions"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin"]}
              element={
                <Superadmin_Layout>
                  <Superadmin_SubscriptionManagement />
                </Superadmin_Layout>
              }
            />
          }
        />

        <Route
          path="/super-admin/revenue"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin"]}
              element={
                <Superadmin_Layout>
                  <Superadmin_Revenue />
                </Superadmin_Layout>
              }
            />
          }
        />

        <Route
          path="/super-admin/users"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin"]}
              element={
                <Superadmin_Layout>
                  <Superadmin_Users />
                </Superadmin_Layout>
              }
            />
          }
        />

        <Route
          path="/super-admin/chatbox"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin"]}
              element={
                <Superadmin_Layout>
                  <Superadmin_Chatbox />
                </Superadmin_Layout>
              }
            />
          }
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute allowedRoles={["admin"]} element={<AdminDashboard />} />}
        />
        <Route
          path="/admin/exams"
          element={<ProtectedRoute allowedRoles={["admin"]} element={<AdminExamMenu />} />}
        />
        <Route
          path="/admin/exam-management"
          element={<ProtectedRoute allowedRoles={["admin"]} element={<AdminExamManagement />} />}
        />
        <Route
          path="/admin/users"
          element={<ProtectedRoute allowedRoles={["admin"]} element={<AdminUserManagement />} />}
        />
        <Route
          path="/admin/materials"
          element={<ProtectedRoute allowedRoles={["admin"]} element={<AdminStudyMaterials />} />}
        />
        <Route
          path="/admin/analytics"
          element={<ProtectedRoute allowedRoles={["admin"]} element={<AdminAnalytics />} />}
        />
        <Route
          path="/admin/chat"
          element={<ProtectedRoute allowedRoles={["admin"]} element={<AdminChatbox />} />}
        />

        {/* ================= INVIGILATOR ROUTES ================= */}
        <Route
          path="/invigilator/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["invigilator"]}
              element={<InvigilatorLayout><InvigilatorDashboard /></InvigilatorLayout>}
            />
          }
        />

        <Route
          path="/invigilator/submission"
          element={
            <ProtectedRoute
              allowedRoles={["invigilator"]}
              element={<InvigilatorLayout><InvigilatorSubmissions /></InvigilatorLayout>}
            />
          }
        />

        <Route
          path="/invigilator/grading-queue"
          element={
            <ProtectedRoute
              allowedRoles={["invigilator"]}
              element={<InvigilatorLayout><InvigilatorGradingQueue /></InvigilatorLayout>}
            />
          }
        />

        <Route
          path="/invigilator/analytics"
          element={
            <ProtectedRoute
              allowedRoles={["invigilator"]}
              element={<InvigilatorLayout><InvigilatorAnalytics /></InvigilatorLayout>}
            />
          }
        />

        <Route
          path="/invigilator/profile"
          element={
            <ProtectedRoute
              allowedRoles={["invigilator"]}
              element={<InvigilatorLayout><InvigilatorProfile /></InvigilatorLayout>}
            />
          }
        />

        <Route
          path="/invigilator/chatbox"
          element={
            <ProtectedRoute
              allowedRoles={["invigilator"]}
              element={<InvigilatorChatBox />}
            />
          }
        />

        {/* ================= USER ROUTES ================= */}
        <Route
          path="/user/dashboard"
          element={<ProtectedRoute allowedRoles={["user"]} element={<UserDashboard />} />}
        /> 

        <Route
          path="/user/exams"
          element={<ProtectedRoute allowedRoles={["user"]} element={<UserMyExam />} />}
        />

        <Route
          path="/user/study-materials"
          element={<ProtectedRoute allowedRoles={["user"]} element={<UserStudyMaterials />} />}
        />

        <Route
          path="/user/analytics"
          element={<ProtectedRoute allowedRoles={["user"]} element={<UserAnalytics />} />}
        />

        <Route
          path="/user/achievements"
          element={<ProtectedRoute allowedRoles={["user"]} element={<UserAchievements />} />}
        />

        <Route
          path="/user/chatbox"
          element={<ProtectedRoute allowedRoles={["user"]} element={<UserChatbox />} />}
        /> 
        {/* ========== COMMON ROUTE ========== */}
        <Route path="/login" element={<Mainlogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<UnAuthorize />} />
        <Route path="*" element={<PageNotFound />} />

      </Routes>
    </>
  );
}
