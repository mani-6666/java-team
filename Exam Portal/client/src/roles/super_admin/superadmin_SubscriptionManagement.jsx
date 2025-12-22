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

  const CARD_GAP = 24;

  const initialForm = {
    planTitle: "",
    price: "",
    billingCycle: "monthly",
    features: [""],
    description: "",
    activeClients: 0,
    status: "Active",
  };

  const [form, setForm] = useState(initialForm);

  const normalizeFeatures = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map((f) => (f == null ? "" : String(f)));
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) return parsed.map((f) => (f == null ? "" : String(f)));
    } catch (e) {
      return String(raw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [String(raw)];
  };

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
        activeclients: Number(
          p.active_clients ?? p.activeClients ?? p.activeclients ?? 0
        ),
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

  const filtered = useMemo(() => {
    if (!query) return plans;
    return plans.filter((p) =>
      (p.planname || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [plans, query]);

  const getCardStep = () => {
    const slider = sliderRef.current;
    if (!slider) return 420 + CARD_GAP;
    const first = slider.children[0];
    if (!first) return 420 + CARD_GAP;
    const style = window.getComputedStyle(first);
    const marginRight = parseFloat(style.marginRight || 0);
    const width = first.offsetWidth + marginRight;
    return width + CARD_GAP / 2;
  };

  const scrollToIndex = (index) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const step = getCardStep();
    slider.scrollTo({
      left: Math.round(index * step),
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
      const step = getCardStep();
      const idx = Math.round(slider.scrollLeft / step);
      setCurrentIndex(Math.max(0, Math.min(filtered.length - 1, idx)));
    };

    slider.addEventListener("scroll", onScroll);
    const ro = new ResizeObserver(onScroll);
    ro.observe(slider);
    return () => {
      slider.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [filtered.length]);

  const openNewPlanModal = () => {
    setEditingPlan(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = async (plan) => {
    try {
      const planId = plan.id;
      const res = await axios.get(`${API_BASE}/${planId}`);
      const data = res.data.data || {};

      setEditingPlan({ id: data.plan_id ?? planId });

      setForm({
        planTitle: data.plan_name ?? data.planTitle ?? plan.planname,
        price: data.price ?? plan.price ?? "",
        billingCycle: (data.billing_cycle ?? "monthly").toLowerCase(),
        features: normalizeFeatures(data.features).length
          ? normalizeFeatures(data.features)
          : [""],
        description: data.description ?? "",
        activeClients: Number(
          data.active_clients ??
            data.activeClients ??
            plan.activeclients ??
            0
        ),
        status: data.status ?? plan.status ?? "Active",
      });

      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching single plan for edit", err);
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
    if (next.length === 1) {
      next[0] = "";
    } else {
      next.splice(index, 1);
    }
    setForm({ ...form, features: next });
  };

  const handleBillingCycleChange = (newCycle) => {
    const prev = form.billingCycle;
    const currentPrice = Number(form.price) || 0;
    let newPrice = currentPrice;

    if (prev === "monthly" && newCycle === "yearly") {
      newPrice = +(currentPrice * 12).toFixed(2);
    }

    if (prev === "yearly" && newCycle === "monthly") {
      newPrice = +(currentPrice / 12).toFixed(2);
    }

    setForm({ ...form, billingCycle: newCycle, price: String(newPrice) });
  };

  const savePlan = async (e) => {
    e.preventDefault();

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
      createdBy: null,
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

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-[#050505] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Subscription Plans
            </h1>
            <p className="text-sm text-slate-500">
              Manage subscription tiers and pricing
            </p>
          </div>

          <button
            onClick={openNewPlanModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4f6df5] text-white rounded-md shadow w-full sm:w-auto"
          >
            <PlusCircle size={16} /> New Plan
          </button>
        </div>

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

        <div className="relative w-full">
          <button
            onClick={slideLeft}
            className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 
            w-10 h-10 sm:w-12 sm:h-12 rounded-full border bg-white shadow 
            items-center justify-center text-xl sm:text-2xl font-bold z-10"
          >
            ‹
          </button>

          <div
            ref={sliderRef}
            className="hide-scrollbar flex gap-4 sm:gap-6 px-1 sm:px-4 py-4 sm:py-6 overflow-x-auto scroll-smooth"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {filtered.map((plan) => (
              <div
                key={plan.id}
                className="snap-center flex-shrink-0 w-full sm:w-[420px] bg-white dark:bg-[#1f2125] border rounded-2xl shadow p-4 sm:p-6"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[#4f6df5] text-base sm:text-lg font-semibold mb-1 truncate">
                      {plan.planname}
                    </h3>

                    <div className="flex items-end gap-2 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#4f6df5]">
                        ₹{plan.price}
                      </span>
                      <span className="text-base sm:text-lg text-slate-500 lowercase">
                        /{plan.billingCycle}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 capitalize mt-1">
                      {plan.billingCycle === "monthly"
                        ? "Billed monthly"
                        : "Billed yearly"}
                    </p>
                  </div>

                  <span
                    className={`text-xs sm:text-sm mt-1 whitespace-nowrap ${
                      plan.status === "Active"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-gray-500 font-semibold">
                  Feature :
                </p>
                <ul className="mt-2 space-y-2 sm:space-y-3 text-black dark:text-gray-200 text-sm">
                  {(plan.features || []).map((f, i) => (
                    <li key={i} className="flex gap-2 sm:gap-3 items-start">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4f6df5] text-white rounded-full flex justify-center items-center text-[10px] sm:text-xs mt-1">
                        ✓
                      </span>
                      <span className="leading-5 break-words">{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs sm:text-sm text-gray-500">
                  Active Clients
                </p>
                <p className="text-lg sm:text-xl font-medium text-black dark:text-white">
                  {plan.activeclients}
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex-1 px-3 py-2 border rounded-md flex items-center justify-center gap-2 text-black dark:text-white dark:border-[#3a3d44] text-sm"
                  >
                    <Edit size={16} /> Edit Plan
                  </button>

                  <button
                    onClick={() => removePlan(plan.id)}
                    className="px-3 py-2 border rounded-md dark:border-[#3a3d44]"
                    title="Delete plan"
                  >
                    <Trash className="text-red-600 dark:text-red-400" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={slideRight}
            className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 
            w-10 h-10 sm:w-12 sm:h-12 rounded-full border bg-white shadow 
            items-center justify-center text-xl sm:text-2xl font-bold z-10"
          >
            ›
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2125] w-full max-w-2xl rounded-2xl shadow-xl border p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#4f6df5]">
                {editingPlan ? "Edit Plan" : "New Plan"}
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-md border dark:border-[#3a3d44]"
              >
                <X size={18} className="text-black dark:text-white" />
              </button>
            </div>

            <form onSubmit={savePlan} className="space-y-5 sm:space-y-6">
              <div>
                <label className="text-sm text-black dark:text-white font-medium">
                  Plan Title
                </label>
                <input
                  value={form.planTitle}
                  onChange={(e) =>
                    setForm({ ...form, planTitle: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border px-3 py-2.5 sm:py-3 
                    bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-black dark:text-white font-medium">
                  Price {form.billingCycle === "monthly" ? "(Monthly)" : "(Yearly)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-2 w-full rounded-md border px-3 py-2.5 sm:py-3
                    bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-black dark:text-white font-medium">
                  Pricing
                </label>
                <select
                  value={form.billingCycle}
                  onChange={(e) => handleBillingCycleChange(e.target.value)}
                  className="mt-2 w-full rounded-md border px-3 py-2.5 sm:py-3
                    bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-black dark:text-white font-medium">
                  Features
                </label>
                <div className="mt-3 space-y-3">
                  {form.features.map((feat, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        value={feat}
                        onChange={(e) => updateFeatureAt(idx, e.target.value)}
                        className="flex-1 rounded-md border px-3 py-2.5 sm:py-3 bg-white dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]"
                        placeholder={`Feature ${idx + 1}`}
                      />
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => addFeatureAfter(idx)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-green-600 text-green-600"
                          title="Add feature"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFeatureAt(idx)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-red-600 text-red-600"
                          title="Remove feature"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="px-8 sm:px-10 py-2.5 sm:py-3 bg-[#4f6df5] text-white rounded-lg shadow text-sm sm:text-base"
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
