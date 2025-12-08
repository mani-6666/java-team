// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// const PIE_COLORS = ["#4f6df5", "#f5b335", "#ff6b6b"];

// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div
//         className="rounded-xl px-3 py-2 shadow-xl"
//         style={{
//           background: "#4f6df5",
//           color: "white",
//           fontSize: 12,
//           fontWeight: 500,
//         }}
//       >
//         <div>{payload[0].value} rs</div>
//         <div className="text-[11px] opacity-90">{label} 2025</div>
//       </div>
//     );
//   }
//   return null;
// };

// export default function Superadmin_Revenue() {
//   const API = "http://localhost:5000/superadmin/analytics/revenue";

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [monthly, setMonthly] = useState([]);
//   const [weekly, setWeekly] = useState([]);
//   const [pieData, setPieData] = useState([]);

//   const fetchRevenue = async () => {
//     try {
//       const res = await axios.get(API);

//       const revenueLine = res.data.revenueData.map((i) => ({
//         month: i.month,
//         revenue: Number(i.revenue),
//         transaction: Number(i.transactions),
//         date: "",
//       }));

//       const weeklyMapped = res.data.usageOverview.map((i) => ({
//         week: i.week,
//         active: Number(i.activeUsers),
//       }));

//       const pieArr = [
//         { name: "Premium", value: res.data.subscriptionTypes.premium },
//         { name: "Enterprise", value: res.data.subscriptionTypes.enterprise },
//         { name: "Basic", value: res.data.subscriptionTypes.basic },
//       ];

//       setMonthly(revenueLine);
//       setWeekly(weeklyMapped);
//       setPieData(pieArr);
//     } catch (err) {
//       console.log("Revenue error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchRevenue();
//   }, []);

//   const filteredLineData = useMemo(() => {
//     if (!fromDate || !toDate) return monthly;
//     return monthly; // backend has no date field for filtering
//   }, [fromDate, toDate, monthly]);

//   const filteredBarData = useMemo(() => weekly, [weekly]);

//   return (
//     <div className="pb-10 px-4 md:px-2">
//       <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
//         Analytics
//       </h1>
//       <p className="text-gray-500 dark:text-gray-400 mb-6">
//         Detailed revenue insights and trends
//       </p>

//       <div className="bg-white dark:bg-[#111] rounded-2xl shadow border dark:border-gray-700 p-4 md:p-6">
//         {/* TOP BAR */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
//           <h2 className="text-[17px] font-semibold text-gray-800 dark:text-white">
//             Balance Analytics
//           </h2>

//           <div className="flex flex-col sm:flex-row items-center gap-4">
//             <div className="flex flex-col">
//               <label className="text-xs text-gray-500 dark:text-gray-300">
//                 From
//               </label>
//               <input
//   type="date"
//   className="
//     border px-2 py-1 rounded-md
//     bg-white text-black
//     dark:bg-[#1f2125] dark:text-white dark:border-[#3a3d44]
//     dark:placeholder-gray-400
//   "
//   value={fromDate}
//   onChange={(e) => setFromDate(e.target.value)}
// />

//             </div>

//             <div className="flex flex-col">
//               <label className="text-xs text-gray-500 dark:text-gray-300">
//                 To
//               </label>
//               <input
//   type="date"
//   className="
//     border px-2 py-1 rounded-md
//     bg-white text-black
//     dark:bg-[#1f2125] dark:text-white dark:border-[#3a3d44]
//     dark:placeholder-gray-400
//   "
//   value={toDate}
//   onChange={(e) => setToDate(e.target.value)}
// />

//             </div>
//           </div>
//         </div>

//         {/* AREA CHART */}
//         <div className="w-full h-[260px] sm:h-[320px] md:h-[360px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={filteredLineData}>
//               <defs>
//                 <linearGradient id="tx">
//                   <stop offset="10%" stopColor="#ff6b6b" stopOpacity={0.22} />
//                   <stop offset="90%" stopColor="#ff6b6b" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient id="rev">
//                   <stop offset="10%" stopColor="#4f6df5" stopOpacity={0.22} />
//                   <stop offset="90%" stopColor="#4f6df5" stopOpacity={0} />
//                 </linearGradient>
//               </defs>

//               <CartesianGrid strokeDasharray="3 10" stroke="#444" />
//               <XAxis dataKey="month" tick={{ fill: "#ccc" }} />
//               <YAxis tick={{ fill: "#ccc" }} />
//               <Tooltip content={<CustomTooltip />} />

//               <Area
//                 type="monotone"
//                 dataKey="revenue"
//                 stroke="#4f6df5"
//                 fill="url(#rev)"
//               />
//               <Area
//                 type="monotone"
//                 dataKey="transaction"
//                 stroke="#ff6b6b"
//                 fill="url(#tx)"
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>

//         {/* LOWER SECTION */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-7">
//           {/* BAR CHART */}
//           <div className="bg-white dark:bg-[#111] p-4 md:p-5 rounded-2xl border shadow lg:col-span-2 min-h-[320px]">
//             <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
//               Platform Usage Overview
//             </h3>

//             <div className="w-full h-[260px] md:h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={filteredBarData}>
//                   <CartesianGrid strokeDasharray="3 10" stroke="#444" />
//                   <XAxis dataKey="week" tick={{ fill: "#ccc" }} />
//                   <YAxis tickFormatter={(v) => v / 1000 + "k"} />
//                   <Tooltip />
//                   <Bar dataKey="active" fill="#4f6df5" radius={[6, 6, 6, 6]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* PIE CHART */}
//           <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border shadow min-h-[320px] flex flex-col">
//             <h3 className="text-[18px] font-semibold mb-4 text-gray-900 dark:text-white">
//               Subscription Types
//             </h3>

//             <div className="flex justify-center mb-4">
//               <div className="w-[140px] h-[140px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={pieData} dataKey="value" outerRadius="80%" innerRadius="55%">
//                       {pieData.map((entry, i) => (
//                         <Cell key={i} fill={PIE_COLORS[i]} />
//                       ))}
//                     </Pie>

//                     <text
//                       x="50%"
//                       y="50%"
//                       textAnchor="middle"
//                       dominantBaseline="middle"
//                       className="fill-black dark:fill-white"
//                       style={{ fontSize: "22px", fontWeight: 600 }}
//                     >
//                       {pieData.reduce((acc, v) => acc + v.value, 0)}
//                     </text>
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* LEGENDS */}
//             <div className="mt-4 space-y-4">
//               {pieData.map((item, i) => (
//                 <div
//                   key={i}
//                   className="flex justify-between border-t border-dashed border-gray-300 dark:border-gray-700 pt-3 text-gray-900 dark:text-white"
//                 >
//                   <div className="flex items-center gap-2">
//                     <span
//                       className="w-3 h-3 rounded-full"
//                       style={{ background: PIE_COLORS[i] }}
//                     ></span>
//                     <span>{item.name}</span>
//                   </div>
//                   <span className="font-semibold">
//                     {String(item.value).padStart(2, "0")}
//                   </span>
//                 </div>
//               ))}
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#4f6df5", "#f5b335", "#ff6b6b"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2 shadow-xl"
        style={{
          background: "#4f6df5",
          color: "white",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        <div>{payload[0].value} rs</div>
        <div className="text-[11px] opacity-90">{label} 2025</div>
      </div>
    );
  }
  return null;
};

export default function Superadmin_Revenue() {
  const API = "http://localhost:5000/superadmin/analytics/revenue";

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [monthly, setMonthly] = useState([]);
  const [pieData, setPieData] = useState([]);

  /* ---------------- FETCH REVENUE ONLY ---------------- */
  const fetchRevenue = async () => {
    try {
      const res = await axios.get(API);

      /** --------- UPDATED FOR BACKEND RESPONSE --------- **/
      const revenueLine = res.data.monthlyRevenue.map((i) => ({
        month: i.month,
        revenue: Number(i.revenue),
        transaction: Number(i.transactions),
      }));

      /** --------- DYNAMIC PLAN MAPPING --------- **/
      const pieArr = Object.entries(res.data.subscriptionTypes).map(
        ([name, value]) => ({
          name,
          value: Number(value),
        })
      );

      setMonthly(revenueLine);
      setPieData(pieArr);
    } catch (err) {
      console.log("Revenue error:", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const filteredLineData = useMemo(() => {
    if (!fromDate || !toDate) return monthly;
    return monthly;
  }, [fromDate, toDate, monthly]);

  return (
    <div className="pb-10 px-4 md:px-2">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Analytics
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Detailed revenue insights and trends
      </p>

      <div className="bg-white dark:bg-[#111] rounded-2xl shadow border dark:border-gray-700 p-4 md:p-6">
        
        {/* ------------------ TOP FILTER BAR ------------------ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-[17px] font-semibold text-gray-800 dark:text-white">
            Balance Analytics
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-300">
                From
              </label>
              <input
                type="date"
                className="border px-2 py-1 rounded-md bg-white text-black
                dark:bg-[#1f2125] dark:text-white dark:border-[#3a3d44]"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-300">
                To
              </label>
              <input
                type="date"
                className="border px-2 py-1 rounded-md bg-white text-black
                dark:bg-[#1f2125] dark:text-white dark:border-[#3a3d44]"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ------------------ AREA CHART ------------------ */}
        <div className="w-full h-[260px] sm:h-[320px] md:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredLineData}>
              <defs>
                <linearGradient id="tx">
                  <stop offset="10%" stopColor="#ff6b6b" stopOpacity={0.22} />
                  <stop offset="90%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rev">
                  <stop offset="10%" stopColor="#4f6df5" stopOpacity={0.22} />
                  <stop offset="90%" stopColor="#4f6df5" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 10" stroke="#eee" />
              <XAxis dataKey="month" tick={{ fill: "#999" }} />
              <YAxis tick={{ fill: "#999" }} />
              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="transaction"
                stroke="#ff6b6b"
                fill="url(#tx)"
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f6df5"
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ------------------ BOTTOM GRID ------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-7">

          {/* ------------------ PIE CHART ------------------ */}
          <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border shadow min-h-[320px] flex flex-col">
            <h3 className="text-[18px] font-semibold mb-4 text-gray-900 dark:text-white">
              Subscription Types
            </h3>

            <div className="flex justify-center mb-4">
              <div className="w-[140px] h-[140px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius="80%"
                      innerRadius="55%"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>

                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-black dark:fill-white"
                      style={{
                        fontSize: "22px",
                        fontWeight: 600,
                      }}
                    >
                      {pieData.reduce((acc, v) => acc + v.value, 0)}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LEGENDS */}
            <div className="mt-4 space-y-4">
              {pieData.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between border-t border-dashed border-gray-300 dark:border-gray-700 pt-3 text-gray-900 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: PIE_COLORS[i] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">
                    {String(item.value).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
