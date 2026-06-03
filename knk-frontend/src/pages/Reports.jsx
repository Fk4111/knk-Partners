import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  MdFolder,
  MdInbox,
  MdSync,
  MdCheckCircle,
  MdWarning,
  MdErrorOutline,
} from "react-icons/md";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function ReportCard({
  title,
  value,
  icon: Icon,
  iconBg,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-xs text-slate-500 uppercase font-medium">
          {title}
        </p>

        <h2 className="text-3xl font-bold text-slate-900 mt-2">
          {value}
        </h2>
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        <Icon className="text-2xl" />
      </div>
    </div>
  );
}

export default function Reports() {
  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchReports =
      async () => {
        try {
          const res =
            await API.get(
              "/reports/summary"
            );

          setStats(
            res.data.data
          );
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <DashboardLayout
        title="Reports"
        breadcrumbs={[
          "Home",
          "Reports",
        ]}
      >
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const chartData = [
    {
      name: "New",
      value:
        Number(
          stats?.newCases
        ) || 0,
    },
    {
      name: "In Progress",
      value:
        Number(
          stats?.inProgressCases
        ) || 0,
    },
    {
      name: "Done",
      value:
        Number(
          stats?.doneCases
        ) || 0,
    },
    {
      name: "Insufficient",
      value:
        Number(
          stats?.insufficientCases
        ) || 0,
    },
    {
      name: "Overdue",
      value:
        Number(
          stats?.overdueCases
        ) || 0,
    },
  ];

  return (
    <DashboardLayout
      title="Reports"
      breadcrumbs={[
        "Home",
        "Reports",
      ]}
    >
      {/* CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <ReportCard
          title="Total Cases"
          value={
            stats?.totalCases || 0
          }
          icon={MdFolder}
          iconBg="bg-blue-50 text-blue-600"
        />

        <ReportCard
          title="New Cases"
          value={
            stats?.newCases || 0
          }
          icon={MdInbox}
          iconBg="bg-slate-100 text-slate-600"
        />

        <ReportCard
          title="In Progress"
          value={
            stats?.inProgressCases ||
            0
          }
          icon={MdSync}
          iconBg="bg-indigo-50 text-indigo-600"
        />

        <ReportCard
          title="Done"
          value={
            stats?.doneCases || 0
          }
          icon={
            MdCheckCircle
          }
          iconBg="bg-green-50 text-green-600"
        />

        <ReportCard
          title="Insufficient"
          value={
            stats?.insufficientCases ||
            0
          }
          icon={
            MdErrorOutline
          }
          iconBg="bg-orange-50 text-orange-600"
        />

        <ReportCard
          title="Overdue"
          value={
            stats?.overdueCases ||
            0
          }
          icon={MdWarning}
          iconBg="bg-red-50 text-red-600"
        />
      </div>

      {/* BAR CHART */}
      <div className="mt-6 bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          Case Distribution
        </h2>

        <div className="overflow-x-auto flex justify-center">
          <BarChart
            width={850}
            height={350}
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="value"
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </div>
      </div>
    </DashboardLayout>
  );
}