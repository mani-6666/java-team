

import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import { PlusCircle, Search, Edit, Trash, X, Plus } from "lucide-react";

export default function superadmin_SubscriptionManagement() {
  const API_BASE = "http://localhost:5000/superadmin/subscriptions";

  const [plans, setPlans] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sliderRef = useRef(null);

  const CARD_WIDTH = 420;
  const CARD_GAP = 24;

  /* Initial form shape matching backend fields */
  const initialForm = {
    planTitle: "",
    price: "",
    billingCycle: "monthly", // monthly | yearly
    features: [""], // dynamic inputs
    description: "",
    activeClients: 0,
    status: "Active",
  };

  const [form, setForm] = useState(initialForm);

  /* UTIL: normalize features from backend (handles arrays or JSON strings) */
  const normalizeFeatures = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map((f) => (f == null ? "" : String(f)));
    try {
      // sometimes DB returns JSON string
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) return parsed.map((f) => (f == null ? "" : String(f)));
    } catch (e) {
      // not JSON, try comma-split fallback
      return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [String(raw)];
  };

  /* FETCH PLANS - GET / */
  const fetchPlans = async () => {
    try {
      const res = await axios.get(API_BASE);
      const rows = res.data.data || [];

      const mapped = rows.map((p) => ({
        id: p.plan_id ?? p.id,
        planname: p.plan_name ?? p.planname ?? "",
        price: Number(p.price ?? 0),
        billingCycle: (p.billing_cycle || "monthly").toLowerCase(),
        features: normalizeFeatures(p.features),
        description: p.description || "",
        activeclients: Number(p.active_clients ?? p.activeClients ?? p.activeclients ?? 0),
        status: p.status || "Active",
        createdAt: p.created_at ?? p.createdAt,
      }));

      setPlans(mapped);
    } catch (err) {
      console.error("Error fetching plans", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  /* SEARCH FILTER */
  const filtered = useMemo(() => {
    if (!query) return plans;
    return plans.filter((p) =>
      (p.planname || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [plans, query]);

  /* SLIDER HANDLERS */
  const scrollToIndex = (index) => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.scrollTo({
      left: index * (CARD_WIDTH + CARD_GAP),
      behavior: "smooth",
    });
  };

  const slideLeft = () => scrollToIndex(Math.max(0, currentIndex - 1));
  const slideRight = () =>
    scrollToIndex(Math.min(filtered.length - 1, currentIndex + 1));

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const onScroll = () => {
      const idx = Math.round(slider.scrollLeft / (CARD_WIDTH + CARD_GAP));
      setCurrentIndex(Math.max(0, Math.min(filtered.length - 1, idx)));
    };

    slider.addEventListener("scroll", onScroll);
    return () => slider.removeEventListener("scroll", onScroll);
  }, [filtered.length]);

  /* MODAL OPEN HANDLERS */

  const openNewPlanModal = () => {
    setEditingPlan(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  /* When editing, GET single plan from backend to ensure freshest data */
  const openEditModal = async (plan) => {
    try {
      // plan may have id or planId
      const planId = plan.id;
      const res = await axios.get(`${API_BASE}/${planId}`);
      const data = res.data.data || {};

      setEditingPlan({ id: data.plan_id ?? planId });

      setForm({
        planTitle: data.plan_name ?? data.planTitle ?? plan.planname,
        price: data.price ?? plan.price ?? "",
        billingCycle: (data.billing_cycle ?? "monthly").toLowerCase(),
        features: normalizeFeatures(data.features).length ? normalizeFeatures(data.features) : [""],
        description: data.description ?? "",
        activeClients: Number(data.active_clients ?? data.activeClients ?? plan.activeclients ?? 0),
        status: data.status ?? plan.status ?? "Active",
      });

      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching single plan for edit", err);
      // fallback to using plan object already present
      setEditingPlan(plan);
      setForm({
        planTitle: plan.planname,
        price: plan.price,
        billingCycle: plan.billingCycle || "monthly",
        features: plan.features && plan.features.length ? plan.features : [""],
        description: plan.description || "",
        activeClients: plan.activeclients || 0,
        status: plan.status || "Active",
      });
      setIsModalOpen(true);
    }
  };

  /* FEATURES list helpers */
  const updateFeatureAt = (index, value) => {
    const next = [...form.features];
    next[index] = value;
    setForm({ ...form, features: next });
  };

  const addFeatureAfter = (index) => {
    const next = [...form.features];
    next.splice(index + 1, 0, "");
    setForm({ ...form, features: next });
  };

  const removeFeatureAt = (index) => {
    const next = [...form.features];
    // keep at least one input
    if (next.length === 1) {
      next[0] = "";
    } else {
      next.splice(index, 1);
    }
    setForm({ ...form, features: next });
  };

  /* SAVE PLAN - POST / & PUT /:planId */
  const savePlan = async (e) => {
    e.preventDefault();

    // clean features: trim and filter out empty strings
    const featuresArray = (form.features || [])
      .map((f) => (f == null ? "" : String(f).trim()))
      .filter(Boolean);

    const payload = {
      planTitle: form.planTitle,
      price: Number(form.price),
      billingCycle: (form.billingCycle || "monthly").toLowerCase(),
      features: featuresArray,
      description: form.description,
      activeClients: Number(form.activeClients || 0),
      status: form.status,
    };

    try {
      if (editingPlan && editingPlan.id) {
        await axios.put(`${API_BASE}/${editingPlan.id}`, payload);
      } else {
        await axios.post(API_BASE, payload);
      }

      await fetchPlans();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save error", err);
      alert("Error saving plan");
    }
  };

  /* DELETE PLAN */
  const removePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchPlans();
    } catch (err) {
      console.error("Delete error", err);
      alert("Error deleting plan");
    }
  };

  /* UI RENDER */
  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-[#050505] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Subscription Plans
            </h1>
            <p className="text-sm text-slate-500">Manage subscription tiers</p>
          </div>

          <button
            onClick={openNewPlanModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#4f6df5] text-white rounded-md shadow"
          >
            <PlusCircle size={16} /> New Plan
          </button>
        </div>

        {/* SEARCH */}
        <div className="w-full sm:w-2/3 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="pl-10 pr-3 py-3 w-full rounded-md border bg-white dark:bg-[#0f1724] dark:text-white dark:border-[#2b2e33]"
              placeholder="Search plans..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* SLIDER */}
        <div className="relative w-full">
          {/* LEFT ARROW — FIXED CENTER */}
          <button
            onClick={slideLeft}
            className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 
            w-12 h-12 rounded-full border bg-white shadow 
            flex items-center justify-center text-2xl font-bold"
          >
            ‹
          </button>

          <div
            ref={sliderRef}
            className="hide-scrollbar flex gap-6 px-4 py-6 overflow-x-auto scroll-smooth"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {filtered.map((plan) => (
              <div
                key={plan.id}
                className="snap-center flex-shrink-0 w-[85vw] sm:w-[420px] bg-white dark:bg-[#1f2125] border rounded-xl shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[#4f6df5] text-lg font-semibold">
                      {plan.planname}
                    </h3>
                    <p className="text-3xl font-bold text-black dark:text-white">
                      ₹{plan.price}
                    </p>
                    <p className="text-sm text-slate-500 capitalize">{plan.billingCycle}</p>
                  </div>
                  <span className={`text-sm ${plan.status === "Active" ? "text-green-600" : "text-gray-500"}`}>
                    {plan.status}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-500">Features:</p>
                <ul className="mt-2 space-y-2 text-black dark:text-gray-200">
                  {(plan.features || []).map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-5 h-5 bg-[#4f6df5] text-white rounded-full flex justify-center items-center text-xs">
                        ✓
                      </span>
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-sm text-gray-500">Active Clients</p>
                <p className="text-lg font-medium text-black dark:text-white">{plan.activeclients}</p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex-1 px-3 py-2 border rounded-md flex items-center justify-center gap-2 text-black dark:text-white dark:border-[#3a3d44]"
                  >
                    <Edit size={16} /> Edit
                  </button>

                  <button
                    onClick={() => removePlan(plan.id)}
                    className="px-3 py-2 border rounded-md dark:border-[#3a3d44]"
                  >
                    <Trash size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT ARROW — FIXED CENTER */}
          <button
            onClick={slideRight}
            className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 
            w-12 h-12 rounded-full border bg-white shadow 
            flex items-center justify-center text-2xl font-bold"
          >
            ›
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2125] w-full max-w-2xl rounded-lg shadow-xl border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {editingPlan ? "Edit Plan" : "New Plan"}
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-md border dark:border-[#3a3d44]"
              >
                <X size={18} className="text-black dark:text-white" />
              </button>
            </div>

            <form onSubmit={savePlan} className="space-y-4">
              {/* NAME + PRICE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-black dark:text-white">Plan Title</label>
                  <input
                    value={form.planTitle}
                    onChange={(e) => setForm({ ...form, planTitle: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2 
                    bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-black dark:text-white">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2 
                    bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                    required
                  />
                </div>
              </div>

              {/* BILLING CYCLE */}
              <div>
                <label className="text-sm text-black dark:text-white">Billing Cycle</label>
                <select
                  value={form.billingCycle}
                  onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                  className="mt-1 w-40 rounded-md border px-3 py-2
                    bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm text-black dark:text-white">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2 h-20 
                  bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                />
              </div>

              {/* FEATURES (dynamic inputs like Figma) */}
              <div>
                <label className="text-sm text-black dark:text-white">Features</label>
                <div className="mt-2 space-y-2">
                  {form.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={feat}
                        onChange={(e) => updateFeatureAt(idx, e.target.value)}
                        className="flex-1 rounded-md border px-3 py-2 bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                        placeholder={`Feature ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => addFeatureAfter(idx)}
                        className="p-2 rounded-full border"
                        title="Add feature"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFeatureAt(idx)}
                        className="p-2 rounded-full border text-red-600"
                        title="Remove feature"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIVE CLIENTS + STATUS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-black dark:text-white">Active Clients</label>
                  <input
                    type="number"
                    value={form.activeClients}
                    onChange={(e) => setForm({ ...form, activeClients: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2
                    bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                  />
                </div>

                <div>
                  <label className="text-sm text-black dark:text-white">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2
                    bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md dark:border-[#3a3d44] text-black dark:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4f6df5] text-white rounded-md"
                >
                  {editingPlan ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
