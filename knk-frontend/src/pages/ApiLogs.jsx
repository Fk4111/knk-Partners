import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";

const ApiLogs = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await API.get(
        "/api-logs"
      );

      setLogs(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">

        <div className="bg-white rounded-xl shadow border">

          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">
              API Activity Logs
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>

                  <th className="p-4 text-left">
                    App ID
                  </th>

                  <th className="p-4 text-left">
                    Endpoint
                  </th>

                  <th className="p-4 text-left">
                    Method
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Source
                  </th>

                  <th className="p-4 text-left">
                    Time
                  </th>

                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-t"
                  >
                    <td className="p-4">
                      {log.appId}
                    </td>

                    <td className="p-4">
                      {log.endpoint}
                    </td>

                    <td className="p-4">
                      {log.method}
                    </td>

                    <td className="p-4">
                      {log.status}
                    </td>

                    <td className="p-4">
                      {log.source}
                    </td>

                    <td className="p-4">
                      {new Date(
                        log.createdAt
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApiLogs;